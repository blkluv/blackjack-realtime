import { jwtVerify } from 'jose';
import type * as Party from 'partykit/server';
import z from 'zod';
import type { BlackjackRecord } from './blackjack/blackjack.types';
import { BlackjackRoom } from './blackjack/room';

import { env } from '@/env.mjs';
import { type Client, createClient } from '@libsql/client';
import { type LibSQLDatabase, drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/server/db/schema';
import type { ChatRecord } from './chat/chat.types';
import { ChatRoom } from './chat/room';
import type { CursorRecord } from './cursor/cursor.types';
import { CursorRoom } from './cursor/room';
type UserId = `0x${string}` | 'guest';

const SocketMessageSchema = z.object({
  room: z.enum(['blackjack', 'cursor', 'chat']),
  type: z.string(),
});

type ConnectionState = {
  userId: UserId;
  isPlayer: boolean;
  staticId: string;
  country: string | null;
};

type DefaultRecord = {
  'hello-world': { message: string };
};

// Define a mapping from room name to its Record type
type RoomRecordMap = {
  cursor: CursorRecord;
  chat: ChatRecord;
  blackjack: BlackjackRecord;
  default: DefaultRecord;
};

//  TPartyKitServerMessage - Attempt with direct lookup and conditional types
type TPartyKitServerMessage<
  TRoom extends keyof RoomRecordMap = keyof RoomRecordMap,
> = TRoom extends keyof RoomRecordMap
  ? // Conditional type based on TRoom
    { room: TRoom } & {
      // Intersection to add room property
      [TType in keyof RoomRecordMap[TRoom]]: // Mapped type over types for the given room
      { type: TType; data: RoomRecordMap[TRoom][TType] };
    }[keyof RoomRecordMap[TRoom]] // Index to distribute mapped type as union
  : never; // If TRoom is not a valid room, type is never

type TDatabase = LibSQLDatabase<typeof schema> & {
  $client: Client;
};

/*-------------------------------------------------------------------------
  Server Class
  This class implements Party.Server and wires up connections, requests,
  and in-room messages for our Blackjack game.
---------------------------------------------------------------------------*/
export default class Server implements Party.Server {
  private roomMap: {
    [id: string]: { blackjack: BlackjackRoom; chat: ChatRoom };
  };
  private cursorRoom: CursorRoom;
  readonly room: Party.Room;
  db: TDatabase;
  private staticIdMap: { [staticId: string]: string };

  constructor(room: Party.Room) {
    this.room = room;
    this.cursorRoom = new CursorRoom('cursors', this.room);
    const client = createClient({
      url: env.TURSO_CONNECTION_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
    this.db = drizzle(client, { schema });

    const blackjack = new BlackjackRoom('main', this.room, this.db);

    this.roomMap = {
      main: { blackjack, chat: new ChatRoom('chat', this.room, blackjack) },
    };

    this.staticIdMap = {};
  }

  async onRequest(request: Party.Request) {
    const urlParams = new URL(request.url).searchParams;

    if (request.method === 'GET') {
      // get all connectionids
      const connections = this.room.getConnections<ConnectionState>();
      const arr: { [id: string]: ConnectionState } = {};
      for (const connection of connections) {
        arr[connection.id] = {
          userId: connection.state?.userId ?? 'guest',
          staticId: connection.state?.staticId ?? '',
          country: connection.state?.country ?? '',
          isPlayer: connection.state?.isPlayer ?? false,
        };
      }

      const res = new Response(JSON.stringify(arr), { status: 200 });
      return res;
    }
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
    });
  }

  static async onBeforeConnect(req: Party.Request, lobby: Party.Lobby) {
    try {
      const urlParams = new URL(req.url).searchParams;

      const token = urlParams.get('token');
      const walletAddress = urlParams.get('walletAddress')?.toLowerCase();
      const staticId = urlParams.get('staticId');

      if (!staticId) {
        throw new Error('UnAuthorised');
      }
      req.headers.set('X-Static-Id', staticId);

      if (!walletAddress || !token) {
        req.headers.set('X-User-Id', 'guest');
        return req;
      }

      if (token) {
        try {
          // console.log('Token received:', token);

          const secretKey = new TextEncoder().encode(env.JWT_SECRET);
          const { payload } = await jwtVerify(token, secretKey);
          // console.log({ payload });
          if (
            typeof payload === 'object' &&
            'walletAddress' in payload &&
            (payload.walletAddress as string).toLowerCase() === walletAddress
          ) {
            req.headers.set('X-User-Id', walletAddress);
            return req;
          }
        } catch (error) {
          console.warn('Invalid or expired token');
        }
      }

      return new Response('Unauthorized: Valid token required', {
        status: 401,
      });
    } catch (error) {
      console.error('Authentication error:', error);
      return new Response('Authentication error', { status: 402 });
    }
  }

  async onConnect(
    conn: Party.Connection<ConnectionState>,
    { request }: Party.ConnectionContext,
  ) {
    try {
      const room = this.roomMap.main?.blackjack;
      if (!room) {
        throw new Error('Room not found');
      }

      const staticId = request.headers.get('X-Static-Id') as string;
      const userId = request.headers.get('X-User-Id') as UserId;
      const country = (request.cf?.country ?? null) as string | null;

      if (this.staticIdMap[staticId]) {
        const oldConnectionId = this.staticIdMap[staticId];

        const oldConnection = this.room.getConnection(oldConnectionId);
        oldConnection?.close();

        console.log('closed old connection');

        this.staticIdMap[staticId] = conn.id;
      } else {
        this.staticIdMap[staticId] = conn.id;
      }

      console.log(`Connected: id: ${conn.id}, room: ${room.id}`);
      this.send(userId, {
        room: 'default',
        type: 'hello-world',
        data: { message: 'hello-from-server' },
      });

      conn.setState({ userId, country, staticId, isPlayer: false });
      // Join both rooms
      await room.onJoin(conn);
      await this.cursorRoom.onJoin(conn);

      console.log({ conn });
    } catch (err) {
      console.error(`Error joining room: ${err}`);
      conn.send(JSON.stringify({ type: 'error', message: err }));
      conn.close();
    }
  }

  onClose(connection: Party.Connection<ConnectionState>): void | Promise<void> {
    console.log(`Connection ${connection.id} closed`);
    const blackjackRoom = this.roomMap.main?.blackjack;
    if (!blackjackRoom) {
      throw new Error('Blackjack Room not found');
    }
    blackjackRoom.onLeave(connection);
    this.cursorRoom.onLeave(connection);
  }

  send(id: string, message: TPartyKitServerMessage) {
    const connection = this.room.getConnection(id);
    if (!connection) return;
    connection.send(JSON.stringify(message));
  }

  broadcast(message: TPartyKitServerMessage, without?: string[]) {
    this.room.broadcast(JSON.stringify(message), without);
  }

  async onMessage(
    unknownMessage: string,
    conn: Party.Connection<ConnectionState>,
  ) {
    // console.log(`Connection ${conn.id} sent message: `);
    // console.log({ unknownMessage })
    try {
      const json = JSON.parse(unknownMessage);
      const message = SocketMessageSchema.parse(json);
      // console.log(message)
      // Route cursor messages to cursor room
      if (message.room === 'cursor') {
        this.cursorRoom.onMessage(conn, json).catch(() => {
          console.error('Error handling cursor messages:');
        });
        return;
      }

      const blackjackRoom = this.roomMap.main?.blackjack;
      const chatRoom = this.roomMap.main?.chat;
      if (!blackjackRoom || !chatRoom) {
        throw new Error('Room not found');
      }
      const userId = conn.state?.userId;
      if (!userId) {
        throw new Error('No player address found');
      }

      if (userId === 'guest') {
        return;
      }

      // Route game messages to blackjack room
      if (message.room === 'blackjack') {
        blackjackRoom
          .onMessage(conn, json)
          .catch((err) =>
            console.error('Error handling message in room:', err),
          );
      } else if (message.room === 'chat') {
        chatRoom
          .onMessage(conn, json)
          .catch((err) =>
            console.error('Error handling message in room:', err),
          );
      }
    } catch (err) {
      console.error('Failed to parse message as JSON', unknownMessage);
    }
  }
}

// Ensure our server class satisfies Party.Worker.
Server satisfies Party.Worker;

export type { UserId, ConnectionState, TPartyKitServerMessage, TDatabase };
