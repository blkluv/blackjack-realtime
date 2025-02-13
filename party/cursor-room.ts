import type * as Party from 'partykit/server';
import { z } from 'zod';

interface Cursor {
  id: string;
  x: number;
  y: number;
  pointer: 'mouse' | 'touch';
  lastUpdate: number;
}

// all client messages to server
const CursorUpdateSchema = z.object({
  type: z.literal('cursor-update'),
  data: z.object({
    x: z.number(),
    y: z.number(),
    pointer: z.enum(['mouse', 'touch']),
  }),
});

const CursorRemoveSchema = z.object({
  type: z.literal('cursor-remove'),
  data: z.object({}),
});

const CursorMessageSchema = z.union([CursorUpdateSchema, CursorRemoveSchema]);

export type CursorRecord = {
  'cursor-sync': { cursors: Cursor[] };
  'cursor-update': { cursor: Cursor };
  'cursor-remove': { id: string };
};

export type TCursorServerMessage<T extends keyof CursorRecord> = {
  room: 'cursor';
  type: T;
  data: CursorRecord[T];
};

export class CursorRoom {
  readonly id: string;
  private cursors: Map<string, Cursor> = new Map();
  clients: { [connectionId: string]: Party.Connection };

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

  async onJoin(connection: Party.Connection) {
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
      const cursor: Cursor = {
        id: connectionId,
        x: data.x,
        y: data.y,
        pointer: data.pointer,
        lastUpdate: Date.now(),
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
