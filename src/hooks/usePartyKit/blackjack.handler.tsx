import {
  setBetStateAtom,
  setGameStateAtom,
  setTriggerBalanceRefreshAtom,
} from '@/atoms/blackjack.atom';
import { timeStateAtom } from '@/atoms/time.atom';
import { useSetAtom } from 'jotai';
import type { TPartyKitServerMessage } from '../../../party';

export const useBlackjackHandler = () => {
  const setGameState = useSetAtom(setGameStateAtom);
  const setTimeState = useSetAtom(timeStateAtom);
  const setBetState = useSetAtom(setBetStateAtom);
  const setTriggerBalanceRefresh = useSetAtom(setTriggerBalanceRefreshAtom);
  const blackjackHandler = (message: TPartyKitServerMessage) => {
    const { room, type, data } = message;

    if (room === 'blackjack') {
      if (type === 'stateUpdate') {
        setGameState(data.state);

        if (data.state.status === 'roundover') {
          setTriggerBalanceRefresh();
        } else if (data.state.status === 'waiting') {
          setBetState(null);
        }
      } else if (type === 'betTimerStart') {
        setTimeState({ startedAt: data.startedAt, state: 'betTimerStart' });
        // console.log("bet timer start");
      } else if (type === 'betTimerEnd') {
        // setTimeState({ startedAt: data.endedAt, state: "betTimerEnd" });
        // console.log("bet timer end");
      } else if (type === 'playerTimerStart') {
        setTimeState({
          startedAt: data.startedAt,
          state: 'playerTimerStart',
          userId: data.userId,
        });
        console.log('player turn start', data);
      } else if (type === 'playerTimerEnd') {
        // console.log('player turn end', data);
        setTimeState({
          startedAt: data.endedAt,
          state: 'idle',
          userId: undefined,
        });
      } else if (type === 'bet-log') {
        setBetState(data.status);
        if (data.status === 'bet-placed') {
          setTriggerBalanceRefresh();
        }
      } else if (type === 'error') {
        console.log('error', data);
      }
    }
  };
  return { blackjackHandler };
};
