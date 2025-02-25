import { atom } from 'jotai';
// import {
//   BETTING_PERIOD,
//   ROUND_END_PERIOD,
//   PLAYER_TURN_PERIOD,
// } from "../../party/blackjack/blackjack.types";

type TTimeState = {
  startedAt: number;
  state:
    | 'idle'
    | 'betTimerStart'
    | 'betTimerEnd'
    | 'playerTimerStart'
    | 'playerTimerEnd';
  userId?: `0x${string}`;
};

const initalState: TTimeState = {
  startedAt: 0,
  state: 'idle',
};

export const timeStateAtom = atom<TTimeState>(initalState);

// export const useTimeState = useAtom(timeStateAtom);
