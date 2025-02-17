import { atom } from 'jotai';

import type {
  GameState,
  TBlackjackMessageSchema,
} from '../../party/blackjack/blackjack.types';

const gameStateAtom = atom<GameState>({
  players: {},
  dealerHand: [],
  currentPlayerIndex: 0,
  playerOrder: [],
  status: 'waiting',
  deck: [],
});

const setGameStateAtom = atom(null, (get, set, newGameState: GameState) => {
  set(gameStateAtom, newGameState);
});

type BlackjackSend = (message: TBlackjackMessageSchema) => void;

export { gameStateAtom, setGameStateAtom, type BlackjackSend };
