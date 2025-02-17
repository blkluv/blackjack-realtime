import { setPartyKitAtom } from '@/atoms/atom';

import { env } from '@/env.mjs';
import { useSetAtom } from 'jotai';
import { usePartySocket } from 'partysocket/react';
import { useEffect } from 'react';
import type { TPartyKitServerMessage } from '../../../party';
import { useUser } from '../useUser';
import { useBlackjackHandler } from './blackjack.handler';
import { useCursorHandler } from './cursor.handler';
import { useDefaultHandler } from './default.handler';
import { useStaticId } from './useStaticId';

export const usePartyKit = () => {
  const { user } = useUser();
  const setPartyKit = useSetAtom(setPartyKitAtom);
  const staticId = useStaticId();

  const { cursorHandler } = useCursorHandler();
  const { blackjackHandler } = useBlackjackHandler();
  const { defaultHandler } = useDefaultHandler();

  const partyKit = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: 'blackjack',
    query: { token: user.wsToken, walletAddress: user.walletAddress, staticId },
    onOpen: () => {
      console.log('Connected to PartyKit');
      setPartyKit(partyKit);
    },
    onMessage: (event) => {
      const message = JSON.parse(
        event.data as string,
      ) as TPartyKitServerMessage;

      const { room, type, data } = message;

      if (room === 'cursor') {
        cursorHandler(message);
      } else if (room === 'blackjack') {
        blackjackHandler(message);
      } else if (room === 'default') {
        defaultHandler(message);
      }
    },
    onClose: () => {
      console.log('Disconnected from PartyKit');
      partyKit.close();
    },
    onError: () => {},
  });
  // // on unmount
  useEffect(() => {
    return () => {
      partyKit.close();
    };
  }, []);

  return {
    readyState: partyKit.readyState,
  };
};
