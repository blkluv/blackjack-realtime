// import { useSetAtom } from 'jotai';
import type { TPartyKitServerMessage } from '../../../party';

export const useChatHandler = () => {
  const chatHandler = (message: TPartyKitServerMessage) => {
    const { room, type, data } = message;

    if (room === 'chat') {
      if (type === 'game-log') {
        console.log(type, data);
      } else if (type === 'user-message') {
        console.log(type, data);
      }
    }
  };
  return { chatHandler };
};
