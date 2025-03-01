import { atom } from 'jotai';

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
