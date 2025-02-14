import { z } from 'zod';

type Cursor = {
  id: string;
  x: number;
  y: number;
  pointer: 'mouse' | 'touch';
  lastUpdate: number;
  country: string | null;
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
  type Cursor,
  type TCursorServerMessage,
  type CursorRecord,
  CursorMessageSchema,
  type TCursorMessageSchema,
};
