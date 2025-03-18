import { atom } from 'jotai';

import type {
  BetStatus,
  ClientSideGameState,
  TBlackjackMessageSchema,
} from '../../party/blackjack/blackjack.types';

export const betStatusLabels: Record<BetStatus, string> = {
  'checking-balance': 'Validating',
  'deducting-funds': 'Deducting',
  'bet-placed': 'Placed',
  'insufficient-funds': 'Insufficient',
  'bet-failed': 'Failed',
};

const gameStateAtom = atom<ClientSideGameState>({
  players: {},
  dealerHand: [],
  currentPlayerIndex: 0,
  playerOrder: [],
  status: 'waiting',
});

const setGameStateAtom = atom(
  null,
  (_get, set, newGameState: ClientSideGameState) => {
    set(gameStateAtom, newGameState);
  },
);

const triggerBalanceRefreshAtom = atom<number>(0);
const setTriggerBalanceRefreshAtom = atom(null, (get, set) => {
  set(triggerBalanceRefreshAtom, get(triggerBalanceRefreshAtom) + 1);
});

const betStateAtom = atom<BetStatus | null>(null);

const setBetStateAtom = atom(
  null,
  (_get, set, newBetState: BetStatus | null) => {
    set(betStateAtom, newBetState);
  },
);

type BlackjackSend = (message: TBlackjackMessageSchema) => void;

export {
  gameStateAtom,
  setGameStateAtom,
  type BlackjackSend,
  setBetStateAtom,
  betStateAtom,
  triggerBalanceRefreshAtom,
  setTriggerBalanceRefreshAtom,
};
