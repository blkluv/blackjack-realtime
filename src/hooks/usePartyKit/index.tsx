import { env } from '@/env.mjs';
import { usePartySocket } from 'partysocket/react';
import type { TPartyKitServerMessage } from '../../../party';
import type { TBlackjackMessageSchema } from '../../../party/blackjack/blackjack.types';
import type { TCursorMessageSchema } from '../../../party/cursor/cursor.types';
import { blackjackMessageHandler } from './blackjack.handler';
import { cursorMessageHandler } from './cursor.handler';
import { defaultMessageHandler } from './default.handler';

export const usePartyKit = () => {
  const { send: wssend, readyState } = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: 'blackjack',
    query: { walletAddress, token },
    onOpen: () => {
      console.log('Connected to PartyKit');
    },
    onMessage: (event) => {
      const message = JSON.parse(
        event.data as string,
      ) as TPartyKitServerMessage;

      if (message.room === 'cursor') {
        cursorMessageHandler(message);
      } else if (message.room === 'blackjack') {
        blackjackMessageHandler(message);
      } else if (message.room === 'default') {
        defaultMessageHandler(message);
      }
    },
    onClose: () => {},
    onError: () => {},
  });
  const cursorSend = (message: TCursorMessageSchema) => {
    wssend(JSON.stringify({ room: 'cursor', ...message }));
  };

  const blackjackSend = (message: TBlackjackMessageSchema) => {
    wssend(JSON.stringify({ room: 'blackjack', ...message }));
  };
  return {
    cursorSend,
    blackjackSend,
    readyState,
  };
};
