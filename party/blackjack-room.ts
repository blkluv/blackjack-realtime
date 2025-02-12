import type * as Party from 'partykit/server';
import { z } from 'zod';
import type { Id } from '.';

/*-------------------------------------------------------------------------
  Helper Types and Functions for Blackjack
---------------------------------------------------------------------------*/

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
  connection: Party.Connection;
  walletAddr: `0x${string}`;
  seat: number; // Seat number from 1 to 5.
  bet: number;
  hand: Card[];
  done: boolean;
  hasBusted: boolean;
  isStanding: boolean;
};

type Client = {
  connection: Party.Connection;
  id: Id;
};

type GameState = {
  players: { [walletAddr: string]: PlayerState };
  dealerHand: Card[];
  deck: Card[];
  playerOrder: string[]; // player IDs sorted by seat order.
  currentPlayerIndex: number;
  status:
    | 'waiting' // Waiting for players.
    | 'betting' // Players placing bets.
    | 'playing' // Round in progress.
    | 'dealerTurn' // Dealer drawing cards.
    | 'roundover'; // Results available.
};

const MessageSchema = z.object({
  type: z.string(),
  bet: z.number(),
});

/**
 * Create and shuffle a standard 52-card deck using our scheme.
 */
function createDeck(): Card[] {
  const ranks = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'T',
    'J',
    'Q',
    'K',
    'A',
  ];
  const suits = ['c', 'd', 'h', 's'];
  const deck: Card[] = [];
  for (const r of ranks) {
    for (const s of suits) {
      deck.push(`${r}${s}`);
    }
  }
  // Shuffle with Fisher–Yates algorithm.
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // @ts-ignore: false positive on tuple swap
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Compute the best blackjack hand value.
 * Since cards are represented as "rank+suit", we extract the rank
 * using card.slice(0, 1). (This works because all ranks are one character,
 * with "T" meaning 10.)
 */
function handValue(hand: Card[]): number {
  let sum = 0;
  let aces = 0;
  for (const card of hand) {
    const r = card.slice(0, 1);
    if (r === 'A') {
      aces++;
      sum += 1;
    } else if (['K', 'Q', 'J', 'T'].includes(r)) {
      sum += 10;
    } else {
      sum += Number.parseInt(r, 10);
    }
  }
  // Upgrade aces if possible.
  while (aces > 0 && sum + 10 <= 21) {
    sum += 10;
    aces--;
  }
  return sum;
}

/*-------------------------------------------------------------------------
  BlackjackRoom Class
  This class encapsulates all game state and logic for Blackjack.
---------------------------------------------------------------------------*/
export class BlackjackRoom {
  readonly id: string;
  room: Party.Room;
  readonly maxPlayers = 5;
  state: GameState;
  clients: { [connectionId: string]: Client };

  constructor(id: string, room: Party.Room) {
    this.id = id;
    this.room = room;
    this.clients = {};
    this.state = {
      players: {},
      dealerHand: [],
      deck: createDeck(),
      playerOrder: [],
      currentPlayerIndex: 0,
      status: 'waiting',
    };
  }

  broadcast(message: string, without?: string[]) {
    this.room.broadcast(message, without);
    console.log(`[Room ${this.id} broadcast]: ${message}`);
  }

  async onJoin(client: Client) {
    this.clients[client.connection.id] = client;

    // check if wallet adddress is already in the game
    if (client.id !== 'guest') {
      const player = this.state.players[client.id];
      if (player) {
        player.connection.close();
        //update connection id
        player.connection = client.connection;
      }
    }

    client.connection.send('welcome guest');
  }

  async onMessage(
    playerAddr: `0x${string}`,
    unknownData: unknown,
  ): Promise<void> {
    const data = MessageSchema.parse(unknownData);

    switch (data.type) {
      case 'placeBet': {
        this.placeBet(playerAddr, data.bet);
        break;
      }
      case 'startRound': {
        this.startRound();
        break;
      }
      case 'hit': {
        this.playerHit(playerAddr);
        break;
      }
      case 'stand': {
        this.playerStand(playerAddr);
        break;
      }
      default:
        console.warn(`Unknown message type: ${data.type}`);
    }
  }

  playerJoin(playerAddr: `0x${string}`, data: PlayerJoinData) {
    if (Object.keys(this.state.players).length >= this.maxPlayers) {
      throw new Error('Table is full');
    }

    // check if player is a connected client

    const player = this.clients[playerAddr];
    if (!player) {
      throw new Error('Player not found');
    }
    //check if player is already in the game
    if (this.state.players[playerAddr]) {
      throw new Error('Player is already in the game');
    }

    const { seat } = data;

    //check if seat is already taken
    if (Object.values(this.state.players).some((p) => p.seat === seat)) {
      throw new Error('Seat is already taken');
    }

    this.state.players[playerAddr] = {
      connection: player.connection,
      walletAddr: playerAddr,
      seat,
      bet: 0,
      hand: [],
      done: false,
      hasBusted: false,
      isStanding: false,
    };

    // Update order by seat.
    this.state.playerOrder = Object.values(this.state.players)
      .sort((a, b) => a.seat - b.seat)
      .map((p) => p.walletAddr);

    this.broadcast(JSON.stringify({ type: 'stateUpdate', state: this.state }));
  }

  playerLeave(playerAddr: `0x${string}`): void {
    delete this.state.players[playerAddr];

    this.state.playerOrder = Object.values(this.state.players)
      .sort((a, b) => a.seat - b.seat)
      .map((p) => p.walletAddr);

    this.broadcast(JSON.stringify({ type: 'stateUpdate', state: this.state }));
  }

  placeBet(playerAddr: `0x${string}`, bet: number): void {
    if (this.state.status !== 'waiting' && this.state.status !== 'betting') {
      return;
    }
    const p = this.state.players[playerAddr];
    if (!p) return;
    p.bet = bet;
    this.broadcast(JSON.stringify({ type: 'stateUpdate', state: this.state }));
  }

  startRound(): void {
    if (Object.keys(this.state.players).length === 0) return;

    // Replenish deck if needed.
    if (this.state.deck.length < 15) {
      this.state.deck = createDeck();
    }

    // Reset players' state.
    for (const player of Object.values(this.state.players)) {
      player.hand = [];
      player.done = false;
      player.hasBusted = false;
      player.isStanding = false;
    }
    this.state.dealerHand = [];
    // Deal two cards to every player and two to the dealer.
    for (let i = 0; i < 2; i++) {
      for (const pid of this.state.playerOrder) {
        const player = this.state.players[pid];
        if (!player) throw new Error('Player not found');
        const card = this.state.deck.pop();
        if (!card) throw new Error('Deck is empty');
        player.hand.push(card);
      }
      const card = this.state.deck.pop();
      if (!card) throw new Error('Deck is empty');
      this.state.dealerHand.push(card);
    }
    this.state.status = 'playing';

    this.state.currentPlayerIndex = 0;
    this.broadcast(JSON.stringify({ type: 'stateUpdate', state: this.state }));
  }

  playerHit(playerAddr: `0x${string}`): void {
    const currentPlayerId =
      this.state.playerOrder[this.state.currentPlayerIndex];
    if (playerAddr !== currentPlayerId) return;
    const p = this.state.players[playerAddr];
    if (!p) throw new Error('Player not found');
    const card = this.state.deck.pop();
    if (!card) throw new Error('Deck is empty');
    p.hand.push(card);
    if (handValue(p.hand) > 21) {
      p.hasBusted = true;
      p.done = true;
      this.advanceTurn();
    }
    this.broadcast(JSON.stringify({ type: 'stateUpdate', state: this.state }));
  }

  playerStand(playerAddr: `0x${string}`): void {
    const currentPlayerId =
      this.state.playerOrder[this.state.currentPlayerIndex];
    if (playerAddr !== currentPlayerId) return;
    const p = this.state.players[playerAddr];
    if (!p) throw new Error('Player not found');
    p.isStanding = true;
    p.done = true;
    this.advanceTurn();
    this.broadcast(JSON.stringify({ type: 'stateUpdate', state: this.state }));
  }

  advanceTurn(): void {
    while (this.state.currentPlayerIndex < this.state.playerOrder.length - 1) {
      this.state.currentPlayerIndex++;
      const pid = this.state.playerOrder[this.state.currentPlayerIndex];
      if (!pid) throw new Error('Player ID not found');
      const player = this.state.players[pid];
      if (!player) throw new Error('Player not found');
      if (!player.done) {
        return;
      }
    }
    // All players have been processed; now it's the dealer's turn.
    this.state.status = 'dealerTurn';
    this.dealerPlay();
  }

  dealerPlay(): void {
    while (handValue(this.state.dealerHand) < 17) {
      const card = this.state.deck.pop();
      if (!card) throw new Error('Deck is empty');
      this.state.dealerHand.push(card);
    }
    this.endRound();
  }

  endRound(): void {
    this.state.status = 'roundover';
    const dealerScore = handValue(this.state.dealerHand);
    for (const pid of this.state.playerOrder) {
      const p = this.state.players[pid];
      if (!p) {
        throw new Error(`Player ${pid} not found`);
      }
      const playerScore = handValue(p.hand);
      if (p.hasBusted) {
        console.log(`Player ${pid} busted and loses bet ${p.bet}`);
      } else if (dealerScore > 21 || playerScore > dealerScore) {
        console.log(
          `Player ${pid} wins! (Player: ${playerScore} vs Dealer: ${dealerScore})`,
        );
      } else if (playerScore === dealerScore) {
        console.log(`Player ${pid} pushes with ${playerScore}`);
      } else {
        console.log(
          `Player ${pid} loses. (Player: ${playerScore} vs Dealer: ${dealerScore})`,
        );
      }
    }
    this.broadcast(JSON.stringify({ type: 'stateUpdate', state: this.state }));
  }
}
