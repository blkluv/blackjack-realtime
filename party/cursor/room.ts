import type * as Party from 'partykit/server';
import type { ConnectionState } from '../index';
import {
  type Cursor,
  CursorMessageSchema,
  type CursorRecord,
  type ServerCursor,
  type TCursorServerMessage,
} from './cursor.types';

export class CursorRoom {
  readonly id: string;
  room: Party.Room;
  private cursors: Map<string, ServerCursor> = new Map();

  constructor(id: string, room: Party.Room) {
    this.id = id;
    this.room = room;
  }

  broadcast<T extends keyof CursorRecord>(
    message: TCursorServerMessage<T>,
    without?: string[],
  ) {
    this.room.broadcast(JSON.stringify(message), without);
    console.log(`[Room ${this.id} broadcast]: ${message}`);
  }

  send<T extends keyof CursorRecord>(
    id: string,
    message: TCursorServerMessage<T>,
  ) {
    const connection = this.room.getConnection(id);
    if (!connection) {
      return;
    }

    connection.send(JSON.stringify(message));
  }

  async onJoin(connection: Party.Connection<ConnectionState>) {
    const userId = connection.state?.userId;
    if (userId === undefined) {
      //close connection throw error
      //TODO:Implement close error codes
      connection.close(4000, 'Invalid wallet address');
      return;
    }

    // Send existing cursors to new connection
    const cursorsArray: Cursor[] = [];
    for (const cursor of this.cursors.values()) {
      cursorsArray.push({
        id: cursor.id,
        x: cursor.x,
        y: cursor.y,
        pointer: cursor.pointer,
        country: cursor.country,
        lastUpdate: cursor.lastUpdate,
      });
    }

    this.send(connection.id, {
      room: 'cursor',
      type: 'cursor-sync',
      data: { cursors: cursorsArray },
    });

    console.log('joined cursor room ', { connection });
  }

  async onLeave(connection: Party.Connection<ConnectionState>) {
    this.cursors.delete(connection.id);
    this.broadcast({
      room: 'cursor',
      type: 'cursor-remove',
      data: { id: connection.id },
    });
  }

  async handleMessage(
    connection: Party.Connection<ConnectionState>,
    unknownData: unknown,
  ) {
    const { type, data } = CursorMessageSchema.parse(unknownData);

    if (type === 'cursor-update') {
      const country = connection.state?.country ?? null;
      const userId = connection.state?.userId;
      if (!userId) {
        connection.close(4000, 'UserId is required');
        return;
      }
      const cursor: ServerCursor = {
        id: connection.id,
        x: data.x,
        y: data.y,
        pointer: data.pointer,
        lastUpdate: Date.now(),
        country: country,
        userId: userId,
      };

      this.cursors.set(connection.id, cursor);
      this.broadcast(
        { room: 'cursor', type: 'cursor-update', data: { cursor } },
        [connection.id],
      );
    } else if (type === 'cursor-remove') {
      this.onLeave(connection);
    }
  }
}
