import { z } from 'zod';
import type { UserId } from '..';

const ChatUserMessageSchema = z.object({
  type: z.literal('user-message'),
  data: z.object({
    message: z.string().min(1).max(1000),
  }),
});

const ChatMessageSchema = ChatUserMessageSchema;
type TChatMessageSchema = z.infer<typeof ChatMessageSchema>;

type ChatRole = 'player' | 'viewer';

type ChatRecord = {
  'game-log': { message: string };
  'user-message': { userId: UserId; message: string; role: ChatRole };
};

type ChatServerMessage<T extends keyof ChatRecord> = {
  room: 'chat';
  type: T;
  data: ChatRecord[T];
};

export {
  ChatMessageSchema,
  type TChatMessageSchema,
  type ChatRecord,
  type ChatServerMessage,
};
