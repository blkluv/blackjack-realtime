import { setGameStateAtom } from '@/atoms/blackjack.atom';
import { useSetAtom } from 'jotai';
import type { TPartyKitServerMessage } from '../../../party';

export const useBlackjackHandler = () => {
  const setGameState = useSetAtom(setGameStateAtom);

  const blackjackHandler = (message: TPartyKitServerMessage) => {
    const { room, type, data } = message;
    if (room === 'blackjack') {
      if (type === 'stateUpdate') {
        setGameState(data.state);
      }
    }
  };
  return { blackjackHandler };
};
