import type { TChatMessageSchema } from '../../party/chat/chat.types';

type ChatSend = (message: TChatMessageSchema) => void;

export type { ChatSend };
