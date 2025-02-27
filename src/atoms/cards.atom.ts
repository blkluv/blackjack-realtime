// atoms/cardStates.atom.ts
import { atom } from 'jotai';

type TPlayerCardState = {
  [userId: string]: string[];
};

export const playerCardsAtom = atom<TPlayerCardState>({});
export const dealerCardsAtom = atom<string[]>([]);
