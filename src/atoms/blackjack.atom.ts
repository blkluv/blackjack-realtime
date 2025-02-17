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

const blackjackSendAtom = atom<{ blackjackSend: BlackjackSend | null }>({
  blackjackSend: null,
});

const setBlackjackSendAtom = atom(null, (_get, set, newSend: BlackjackSend) => {
  set(blackjackSendAtom, { blackjackSend: newSend });
});

export {
  gameStateAtom,
  setGameStateAtom,
  type BlackjackSend,
  setBlackjackSendAtom,
  blackjackSendAtom,
};
