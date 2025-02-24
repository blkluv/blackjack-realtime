import { atom } from 'jotai';

import type {
  ClientSideGameState,
  TBlackjackMessageSchema,
} from '../../party/blackjack/blackjack.types';

const gameStateAtom = atom<ClientSideGameState>({
  players: {},
  dealerHand: [],
  currentPlayerIndex: 0,
  playerOrder: [],
  status: 'waiting',
});

const setGameStateAtom = atom(
  null,
  (get, set, newGameState: ClientSideGameState) => {
    set(gameStateAtom, newGameState);
  },
);

type BlackjackSend = (message: TBlackjackMessageSchema) => void;

export { gameStateAtom, setGameStateAtom, type BlackjackSend };
