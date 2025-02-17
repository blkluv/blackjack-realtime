import { z } from 'zod';

/**
 * Cards are represented as "rank+suit".
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
type PlayerState = {
  // this is the partykit connection id of the player
  connectionId: string;
  // this is the wallet address of the player
  userId: `0x${string}`;
  seat: number; // Seat number from 1 to 5.
  bet: number;
  hand: Card[];
  done: boolean;
  hasBusted: boolean;
  isStanding: boolean;
};

type GameState = {
  players: { [seat: number]: PlayerState };
  dealerHand: Card[];
  deck: Card[];
  playerOrder: `0x${string}`[]; // player IDs sorted by seat order.
  currentPlayerIndex: number;
  status:
    | 'waiting' // Waiting for players.
    | 'betting' // Players placing bets.
    | 'playing' // Round in progress.
    | 'dealerTurn' // Dealer drawing cards.
    | 'roundover'; // Results available.
};

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

const BlackjackMessageSchema = z.union([
  PlayerJoinSchema,
  PlaceBetSchema,
  StartRoundSchema,
  HitSchema,
  StandSchema,
]);
type TBlackjackMessageSchema = z.infer<typeof BlackjackMessageSchema>;

// all server to client messages

type BlackjackRecord = {
  stateUpdate: { state: GameState };
};

export type TBlackjackServerMessage<T extends keyof BlackjackRecord> = {
  room: 'blackjack';
  type: T;
  data: BlackjackRecord[T];
};

export {
  type BlackjackRecord,
  type TBlackjackMessageSchema,
  BlackjackMessageSchema,
  type PlayerState,
  type GameState,
  type PlayerJoinData,
  type Card,
};
