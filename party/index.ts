import type * as Party from 'partykit/server';
import { unknown } from 'zod';
import z from 'zod';
import { BlackjackRoom } from './blackjack-room';
import type { BlackjackRecord } from './blackjack.types';

import { type CursorRecord, CursorRoom } from './cursor-room';
export type Id = `0x${string}` | 'guest';

export const SocketMessageSchema = z.object({
  room: z.enum(['blackjack', 'cursor']),
  type: z.string(),
  data: z.object({}),
});

export type ConnectionState = {
  id: Id;
  country: string | null;
};

type DefaultRecord = {
  'hello-world': { message: string };
};

// Define a mapping from room name to its Record type
type RoomRecordMap = {
  cursor: CursorRecord;
  blackjack: BlackjackRecord;
  default: DefaultRecord;
};

//  TPartyKitServerMessage - Attempt with direct lookup and conditional types
export type TPartyKitServerMessage<
  TRoom extends keyof RoomRecordMap = keyof RoomRecordMap,
> = TRoom extends keyof RoomRecordMap
  ? // Conditional type based on TRoom
    { room: TRoom } & {
      // Intersection to add room property
      [TType in keyof RoomRecordMap[TRoom]]: // Mapped type over types for the given room
      { type: TType; data: RoomRecordMap[TRoom][TType] };
    }[keyof RoomRecordMap[TRoom]] // Index to distribute mapped type as union
  : never; // If TRoom is not a valid room, type is never

/*-------------------------------------------------------------------------
  Server Class
  This class implements Party.Server and wires up connections, requests,
  and in-room messages for our Blackjack game.
---------------------------------------------------------------------------*/
export default class Server implements Party.Server {
  private roomMap: { [id: string]: BlackjackRoom };
  private cursorRoom: CursorRoom;
  readonly room: Party.Room;

  constructor(room: Party.Room) {
    this.room = room;
    this.cursorRoom = new CursorRoom('cursors');
    this.roomMap = {
      main: new BlackjackRoom('main', this.room),
    };
  }

  static async onBeforeConnect(req: Party.Request, lobby: Party.Lobby) {
    try {
      // replace with jwt token and fetch walletaddress from the signature
      const walletAddress =
        new URL(req.url).searchParams.get('walletAddress')?.toLowerCase() ?? '';

      if (walletAddress !== '') {
        req.headers.set('X-User-Id', walletAddress);
      } else {
        req.headers.set('X-User-Id', 'guest');
      }
      return req;
    } catch (e: unknown) {
      if (e instanceof Error) {
        return new Response(`Unauthorized ${e.message} `, { status: 401 });
      }
      return new Response('Unauthorized: An unexpected error occurred', {
        status: 401,
      });
    }
  }

  async onConnect(
    conn: Party.Connection<ConnectionState>,
    { request }: Party.ConnectionContext,
  ) {
    try {
      const room = this.roomMap.main;
      if (!room) {
        throw new Error('Room not found');
      }

      let id = request.headers.get('X-User-Id') as Id | null;
      const country = (request.cf?.country ?? null) as string | null;

      if (!id) {
        console.log('guest user');
        id = 'guest';
      }

      console.log(`Connected: id: ${conn.id}, room: ${room.id}`);
      this.send(id, {
        room: 'default',
        type: 'hello-world',
        data: { message: 'hello-from-server' },
      });

      conn.setState({ id, country });
      // Join both rooms
      await room.onJoin({ connection: conn, id: id });
      await this.cursorRoom.onJoin(conn);
    } catch (err) {
      console.error(`Error joining room: ${err}`);
      conn.send(JSON.stringify({ type: 'error', message: err }));
      conn.close();
    }
  }

  send(id: string, message: TPartyKitServerMessage) {
    const connection = this.room.getConnection(id);
    if (!connection) return;
    connection.send(JSON.stringify(message));
  }

  broadcast(message: TPartyKitServerMessage, without?: string[]) {
    this.room.broadcast(JSON.stringify(message));
  }

  async onMessage(
    unknownMessage: string,
    sender: Party.Connection<ConnectionState>,
  ) {
    console.log(`Connection ${sender.id} sent message: ${unknown}`);
    try {
      const message = SocketMessageSchema.parse(unknownMessage);

      // Route cursor messages to cursor room
      if (message.room === 'cursor') {
        this.cursorRoom.handleMessage(sender.id, message).catch((err) => {
          console.error('Error handling cursor update:', err);
        });
        return;
      }

      // Route game messages to blackjack room
      const room = this.roomMap.main;
      if (!room) {
        throw new Error('Room not found');
      }
      const playerAddr = sender.state?.id;
      if (!playerAddr) {
        throw new Error('No player address found');
      }

      if (playerAddr === 'guest') {
        return;
      }

      room
        .onMessage(playerAddr, message)
        .catch((err) => console.error('Error handling message in room:', err));
    } catch (err) {
      console.error('Failed to parse message as JSON', err);
    }
  }
}

// Ensure our server class satisfies Party.Worker.
Server satisfies Party.Worker;
