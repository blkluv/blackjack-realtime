import { env } from '@/env.mjs';
import { jwtVerify } from 'jose';
import type * as Party from 'partykit/server';
import { BlackjackRoom } from './blackjack-room';
import { CursorRoom } from './cursor-room';

export type Id = `0x${string}` | 'guest';

type ConnectionState = {
  id: Id;
};

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
      const urlParams = new URL(req.url).searchParams;
      const token = urlParams.get('token');
      const walletAddress = urlParams.get('walletAddress')?.toLowerCase();

      // If no wallet address is provided, treat as guest
      if (!walletAddress) {
        req.headers.set('X-User-Id', 'guest');
        return req;
      }

      // If token is provided, verify it
      if (token) {
        try {
          const secretKey = new TextEncoder().encode(env.JWT_SECRET);
          const { payload } = await jwtVerify(token, secretKey);

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
          // Continue to require new authentication
        }
      }

      // No valid token, return unauthorized
      return new Response('Unauthorized: Valid token required', {
        status: 401,
      });
    } catch (error) {
      console.error('Authentication error:', error);
      return new Response('Authentication error', { status: 401 });
    }
  }

  // static async onBeforeConnect2(req: Party.Request, lobby: Party.Lobby) {
  //   try {
  //     // replace with jwt token and fetch walletaddress from the signature
  //     const walletAddress =
  //       new URL(req.url).searchParams.get("walletAddress")?.toLowerCase() ?? "";

  //     if (walletAddress !== "") {
  //       req.headers.set("X-User-Id", walletAddress);
  //     } else {
  //       req.headers.set("X-User-Id", "guest");
  //     }
  //     return req;
  //   } catch (e: unknown) {
  //     if (e instanceof Error) {
  //       return new Response(`Unauthorized ${e.message} `, { status: 401 });
  //     }
  //     return new Response("Unauthorized: An unexpected error occurred", {
  //       status: 401,
  //     });
  //   }
  // }

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

      if (!id) {
        console.log('guest user');
        id = 'guest';
      }

      console.log(`Connected: id: ${conn.id}, room: ${room.id}`);
      conn.send(
        JSON.stringify({
          type: 'welcome',
          message: `Welcome to Blackjack! ${id}`,
        }),
      );

      conn.setState({ id });
      // Join both rooms
      await room.onJoin({ connection: conn, id: id });
      await this.cursorRoom.onJoin(conn);
    } catch (err) {
      console.error(`Error joining room: ${err}`);
      conn.send(JSON.stringify({ type: 'error', message: err }));
      conn.close();
    }
  }

  async onMessage(message: string, sender: Party.Connection<ConnectionState>) {
    console.log(`Connection ${sender.id} sent message: ${message}`);
    try {
      const data = JSON.parse(message);

      // Route cursor messages to cursor room
      if (data.type === 'cursor-update') {
        this.cursorRoom.handleMessage(sender.id, data).catch((err) => {
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
        .onMessage(playerAddr, data)
        .catch((err) => console.error('Error handling message in room:', err));
    } catch (err) {
      console.error('Failed to parse message as JSON', err);
    }
  }
}

// Ensure our server class satisfies Party.Worker.
Server satisfies Party.Worker;
