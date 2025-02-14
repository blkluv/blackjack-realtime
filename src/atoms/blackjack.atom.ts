import { atom } from 'jotai';

import type { GameState } from '../../party/blackjack/blackjack.types';

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

export { gameStateAtom, setGameStateAtom };
