import { atom } from 'jotai';
import type { TChatMessageSchema } from '../../party/chat/chat.types';
// import { FakeChatLogs } from './fakeChats';
type ChatSend = (message: TChatMessageSchema) => void;

type ChatSchema = {
  id: string;
  userId: string;
  message: string;
  isGameLog: boolean;
  role: 'player' | 'viewer';
};

const chatLogsAtom = atom<ChatSchema[]>([]);

const addChatLogAtom = atom(null, (get, set, chatLog: ChatSchema) => {
  set(chatLogsAtom, (prev) => {
    return [...prev, chatLog];
  });
});

function generateRandomId(): string {
  return crypto.randomUUID();
}

export {
  addChatLogAtom,
  chatLogsAtom,
  generateRandomId,
  type ChatSchema,
  type ChatSend,
};
