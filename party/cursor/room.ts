import type * as Party from 'partykit/server';
import type { ConnectionState } from '../index';
import {
  type Cursor,
  CursorMessageSchema,
  type CursorRecord,
  type TCursorServerMessage,
} from './cursor.types';

export class CursorRoom {
  readonly id: string;
  private cursors: Map<string, Cursor> = new Map();
  clients: { [connectionId: string]: Party.Connection<ConnectionState> };

  constructor(id: string) {
    this.id = id;
    this.clients = {};
  }

  broadcast<T extends keyof CursorRecord>(
    message: TCursorServerMessage<T>,
    excludeId?: string,
  ) {
    for (const [id, conn] of Object.entries(this.clients)) {
      if (id !== excludeId) {
        conn.send(JSON.stringify(message));
      }
    }
  }

  send<T extends keyof CursorRecord>(
    id: string,
    message: TCursorServerMessage<T>,
  ) {
    const connection = this.clients[id];
    if (!connection) {
      return;
    }

    connection.send(JSON.stringify(message));
  }

  async onJoin(connection: Party.Connection<ConnectionState>) {
    this.clients[connection.id] = connection;
    // Send existing cursors to new connection
    const cursorsArray = Array.from(this.cursors.values());
    this.send(connection.id, {
      room: 'cursor',
      type: 'cursor-sync',
      data: { cursors: cursorsArray },
    });
  }

  async onLeave(connectionId: string) {
    delete this.clients[connectionId];
    this.cursors.delete(connectionId);
    this.broadcast({
      room: 'cursor',
      type: 'cursor-remove',
      data: { id: connectionId },
    });
  }

  async handleMessage(connectionId: string, unknownData: unknown) {
    const { type, data } = CursorMessageSchema.parse(unknownData);

    if (type === 'cursor-update') {
      const connection = this.clients[connectionId];
      if (!connection) {
        return;
      }
      const country = connection.state?.country ?? null;
      const cursor: Cursor = {
        id: connectionId,
        x: data.x,
        y: data.y,
        pointer: data.pointer,
        lastUpdate: Date.now(),
        country: country,
      };

      this.cursors.set(connectionId, cursor);
      this.broadcast(
        { room: 'cursor', type: 'cursor-update', data: { cursor } },
        connectionId,
      );
    } else if (type === 'cursor-remove') {
      this.onLeave(connectionId);
    }
  }
}
