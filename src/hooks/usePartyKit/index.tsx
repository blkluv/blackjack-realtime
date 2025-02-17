import {
  type BlackjackSend,
  setBlackjackSendAtom,
} from '@/atoms/blackjack.atom';
import { type CursorSend, setCursorSendAtom } from '@/atoms/cursor.atom';
import { env } from '@/env.mjs';
import { useSetAtom } from 'jotai';
import { usePartySocket } from 'partysocket/react';
import type { TPartyKitServerMessage } from '../../../party';
import { useUser } from '../useUser';
import { blackjackMessageHandler } from './blackjack.handler';
import { cursorMessageHandler } from './cursor.handler';
import { defaultMessageHandler } from './default.handler';

export const usePartyKit = () => {
  const { user } = useUser();
  const setCursorSend = useSetAtom(setCursorSendAtom);
  const setBlackjackSend = useSetAtom(setBlackjackSendAtom);
  console.log({ user });

  const { send: wssend, readyState } = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: 'blackjack',
    query: { token: user.wsToken, walletAddress: user.walletAddress },
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

  const cursorSend: CursorSend = (message) => {
    wssend(JSON.stringify({ room: 'cursor', ...message }));
  };

  setCursorSend(cursorSend);

  const blackjackSend: BlackjackSend = (message) => {
    wssend(JSON.stringify({ room: 'blackjack', ...message }));
  };

  setBlackjackSend(blackjackSend);

  return {
    cursorSend,
    blackjackSend,
    readyState,
  };
};
