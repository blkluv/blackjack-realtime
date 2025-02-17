import type { TPartyKitServerMessage } from '../../../party';

export const useDefaultHandler = () => {
  const defaultHandler = (message: TPartyKitServerMessage) => {
    const { room, type, data } = message;
    if (room === 'default') {
      if (type === 'hello-world') {
        console.log('Hello World', data);
      }
    }
  };
  return { defaultHandler };
};
