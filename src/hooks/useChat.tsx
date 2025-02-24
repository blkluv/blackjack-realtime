import { partyKitAtom } from '@/atoms/atom';
import type { ChatSend } from '@/atoms/chat.atom';
import { useAtomValue } from 'jotai';

const useChat = () => {
  const partyKit = useAtomValue(partyKitAtom);

  const chatSend: ChatSend = (message) => {
    if (!partyKit) return;
    partyKit.send(JSON.stringify({ room: 'chat', ...message }));
  };

  return {
    chatSend,
  };
};

export { useChat };
