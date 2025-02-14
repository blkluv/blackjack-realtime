import type { TPartyKitServerMessage } from '../../../party';

export const defaultMessageHandler = async (
  message: TPartyKitServerMessage,
) => {
  const { room, type, data } = message;
  if (room === 'default') {
    if (type === 'hello-world') {
      console.log('Hello World', data);
    }
  } else {
    throw new Error('Invalid room');
  }
};
