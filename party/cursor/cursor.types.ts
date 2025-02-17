import { z } from 'zod';
import type { UserId } from '..';

type Position = {
  x: number;
  y: number;
  pointer: 'mouse' | 'touch';
};

type Cursor = Position & {
  id: string;
  lastUpdate: number;
  country: string | null;
};

type ServerCursor = Cursor & {
  userId: UserId;
};

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
  // room: z.literal("cursor"),
  type: z.literal('cursor-remove'),
  data: z.object({}),
});

const CursorMessageSchema = z.union([CursorUpdateSchema, CursorRemoveSchema]);
type TCursorMessageSchema = z.infer<typeof CursorMessageSchema>;

type CursorRecord = {
  'cursor-sync': { cursors: Cursor[] };
  'cursor-update': { cursor: Cursor };
  'cursor-remove': { id: string };
};

type TCursorServerMessage<T extends keyof CursorRecord> = {
  room: 'cursor';
  type: T;
  data: CursorRecord[T];
};

export {
  type Position,
  type Cursor,
  type ServerCursor,
  type TCursorServerMessage,
  type CursorRecord,
  CursorMessageSchema,
  type TCursorMessageSchema,
};
