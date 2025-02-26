import { z } from 'zod';

const BETTING_PERIOD = 10000;
const PLAYER_TURN_PERIOD = 10000;
const ROUND_END_PERIOD = 10000;

/**
 * Cards are represented as "rank+suit".
 * If Face Up then **
 * In this scheme:
 *   ranks: ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]
 *   suits: ["c", "d", "h", "s"]
 *
 * For example "Ac" means Ace of clubs, and "Th" means Ten of hearts.
 */
type Card = string;

type PlayerJoinData = {
  seat: number;
};

type Timers = {
  // timer on close will stop accepting bets
  betTimer: NodeJS.Timeout | null;
  // Store the start time of the bet timer
  betTimerStart: number | null;
  // timer on close will stop accepting player actions hit/stand
  playerTimer: NodeJS.Timeout | null;
  // timer on close will reset the round, timer starts when round ends
  roundEndTimer: NodeJS.Timeout | null;
};
type RoundResultState = 'win' | 'loss' | 'blackjack';

type PlayerState = {
  // this is the partykit connection id of the player
  connectionId: string;
  // this is the wallet address of the player
  userId: `0x${string}`;
  seat: number; // Seat number from 1 to 5.
  bet: number;
  hand: Card[];
  done: boolean;
  online: boolean;
  hasBusted: boolean;
  isStanding: boolean;
  roundResult: {
    // Make roundResult optional
    bet: number;
    reward: number; // is negative if loss , 0 if draw
    state: RoundResultState;
  } | null;
};

type ClientSideGameState = {
  players: { [seat: number]: PlayerState };
  dealerHand: Card[];
  playerOrder: `0x${string}`[]; // player IDs sorted by seat order.
  currentPlayerIndex: number; // Index of the current player in the playerOrder array.
  status: TStatus;
};

type GameState = ClientSideGameState & {
  deck: Card[];
  // nine char round id
  roundId: string | null;
};

type TStatus =
  | 'waiting' // Waiting for players.
  | 'betting' // Players placing bets.
  | 'playing' // Round in progress.
  | 'dealerTurn' // Dealer drawing cards.
  | 'roundover'; // Results available.
// all client to server messages

const PlayerJoinSchema = z.object({
  type: z.literal('playerJoin'),
  data: z.object({
    seat: z.number().int().min(1).max(5),
  }),
});

const PlaceBetSchema = z.object({
  type: z.literal('placeBet'),
  data: z.object({
    bet: z.number().positive(),
  }),
});

const StartRoundSchema = z.object({
  type: z.literal('startRound'),
  data: z.object({}),
});

const HitSchema = z.object({
  type: z.literal('hit'),
  data: z.object({}),
});

const StandSchema = z.object({
  type: z.literal('stand'),
  data: z.object({}),
});

const LeaveSchema = z.object({
  type: z.literal('leave'),
  data: z.object({}),
});

const BlackjackMessageSchema = z.union([
  PlayerJoinSchema,
  PlaceBetSchema,
  StartRoundSchema,
  HitSchema,
  StandSchema,
  LeaveSchema,
]);
type TBlackjackMessageSchema = z.infer<typeof BlackjackMessageSchema>;

// all server to client messages

type BlackjackRecord = {
  stateUpdate: { state: ClientSideGameState };
  betTimerStart: { startedAt: number };
  betTimerEnd: { endedAt: number };
  playerTimerStart: { userId: `0x${string}`; startedAt: number }; // Send the user ID of the player whose turn it is
  playerTimerEnd: { userId: `0x${string}`; endedAt: number }; // Send the user ID of the player whose turn it just ended
};

export type TBlackjackServerMessage<T extends keyof BlackjackRecord> = {
  room: 'blackjack';
  type: T;
  data: BlackjackRecord[T];
};

export {
  type RoundResultState,
  type BlackjackRecord,
  type TBlackjackMessageSchema,
  BlackjackMessageSchema,
  type ClientSideGameState,
  type PlayerState,
  type GameState,
  type PlayerJoinData,
  type Card,
  type TStatus,
  type Timers,
  BETTING_PERIOD,
  PLAYER_TURN_PERIOD,
  ROUND_END_PERIOD,
};
