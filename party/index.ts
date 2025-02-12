import type * as Party from 'partykit/server';
import { BlackjackRoom } from './blackjack-room';
import { CursorRoom } from './cursor-room';

type ConnectionState = {
  walletAddress: `0x${string}`;
};

/*-------------------------------------------------------------------------
  Server Class
  This class implements Party.Server and wires up connections, requests,
  and in-room messages for our Blackjack game.
---------------------------------------------------------------------------*/
export default class Server implements Party.Server {
  private roomMap: { [id: string]: BlackjackRoom } = {
    main: new BlackjackRoom('main'),
  };
  private cursorRoom: CursorRoom;

  constructor(readonly party: Party.Server) {
    this.cursorRoom = new CursorRoom('cursors');
  }

  static async onBeforeConnect(req: Party.Request, lobby: Party.Lobby) {
    try {
      // replace with jwt token and fetch walletaddress from the signature
      const walletAddress =
        new URL(req.url).searchParams.get('walletAddress')?.toLowerCase() ?? '';

      if (walletAddress === '') {
        throw new Error('No wallet address provided');
      }

      req.headers.set('X-User-WalletAddress', walletAddress);
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

      const walletAddress = request.headers.get('X-User-WalletAddress') as
        | `0x${string}`
        | null;
      if (!walletAddress) {
        throw new Error('No wallet address provided');
      }

      console.log(`Connected: id: ${conn.id}, room: ${room.id}`);
      conn.send(
        JSON.stringify({
          type: 'welcome',
          message: `Welcome to Blackjack! ${walletAddress}`,
        }),
      );

      conn.setState({ walletAddress });
      // Join both rooms
      await room.onJoin({ connection: conn, walletAddr: walletAddress });
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
      const playerAddr = sender.state?.walletAddress;
      if (!playerAddr) {
        throw new Error('No player address found');
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
