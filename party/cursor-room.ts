import type * as Party from 'partykit/server';
import { z } from 'zod';

interface Cursor {
  id: string;
  x: number;
  y: number;
  pointer: 'mouse' | 'touch';
  lastUpdate: number;
}

const cursorSchema = z.object({
  type: z.literal('cursor-update'),
  cursor: z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    pointer: z.enum(['mouse', 'touch']),
    lastUpdate: z.number(),
  }),
});

export class CursorRoom {
  readonly id: string;
  private cursors: Map<string, Cursor> = new Map();
  clients: { [connectionId: string]: Party.Connection };

  constructor(id: string) {
    this.id = id;
    this.clients = {};
  }

  broadcast(message: string, excludeId?: string) {
    for (const [id, conn] of Object.entries(this.clients)) {
      if (id !== excludeId) {
        conn.send(message);
      }
    }
  }

  async onJoin(connection: Party.Connection) {
    this.clients[connection.id] = connection;

    // Send existing cursors to new connection
    const cursorsArray = Array.from(this.cursors.values());
    connection.send(
      JSON.stringify({
        type: 'cursor-sync',
        cursors: cursorsArray,
      }),
    );
  }

  async onLeave(connectionId: string) {
    delete this.clients[connectionId];
    this.cursors.delete(connectionId);
    this.broadcast(
      JSON.stringify({
        type: 'cursor-remove',
        id: connectionId,
      }),
    );
  }

  async handleMessage(connectionId: string, unknownData: unknown) {
    const data = cursorSchema.parse(unknownData);

    if (data.type === 'cursor-update') {
      const cursor: Cursor = {
        id: connectionId,
        x: data.cursor.x,
        y: data.cursor.y,
        pointer: data.cursor.pointer,
        lastUpdate: Date.now(),
      };

      this.cursors.set(connectionId, cursor);
      this.broadcast(
        JSON.stringify({ type: 'cursor-update', cursor }),
        connectionId,
      );
    }
  }
}
