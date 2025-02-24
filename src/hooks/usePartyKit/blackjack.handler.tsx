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
      } else if (type === 'betTimerStart') {
        console.log('bet timer start');
      } else if (type === 'betTimerEnd') {
        console.log('bet timer end');
      } else if (type === 'playerTimerStart') {
        console.log('player turn start', data);
      } else if (type === 'playerTimerEnd') {
        console.log('player turn end', data);
      }
    }
  };
  return { blackjackHandler };
};
