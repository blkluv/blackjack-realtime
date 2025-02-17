// import { setWsSendAtom } from '@/atoms/atom';
import { setPartyKitAtom } from '@/atoms/atom';
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
  // const setWsSend = useSetAtom(setWsSendAtom);
  const setPartyKit = useSetAtom(setPartyKitAtom);

  const partyKit = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: 'blackjack',
    query: { token: user.wsToken, walletAddress: user.walletAddress },
    onOpen: () => {
      console.log('Connected to PartyKit');
      setPartyKit(partyKit);
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

  return {
    readyState: partyKit.readyState,
  };
};
