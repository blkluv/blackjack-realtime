import type * as Party from "partykit/server";
import { z } from "zod";
import { verifyMessage } from "viem";
/*-------------------------------------------------------------------------
  Create our own Player type
---------------------------------------------------------------------------*/
interface Player {
  id: string;
}

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

interface PlayerState {
  connection: Party.Connection;
  walletAddr: `0x${string}`;
  seat: number; // Seat number from 1 to 5.
  bet: number;
  hand: Card[];
  done: boolean;
  hasBusted: boolean;
  isStanding: boolean;
}

interface Client {
  connection: Party.Connection;
  walletAddr: `0x${string}`;
}

interface GameState {
  players: { [walletAddr: string]: PlayerState };
  dealerHand: Card[];
  deck: Card[];
  playerOrder: string[]; // player IDs sorted by seat order.
  currentPlayerIndex: number;
  status:
    | "waiting" // Waiting for players.
    | "betting" // Players placing bets.
    | "playing" // Round in progress.
    | "dealerTurn" // Dealer drawing cards.
    | "roundover"; // Results available.
}

const MessageSchema = z.object({
  type: z.string(),
  bet: z.number(),
});

/**
 * Create and shuffle a standard 52-card deck using our scheme.
 */
function createDeck(): Card[] {
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "T",
    "J",
    "Q",
    "K",
    "A",
  ];
  const suits = ["c", "d", "h", "s"];
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
    if (r === "A") {
      aces++;
      sum += 1;
    } else if (["K", "Q", "J", "T"].includes(r)) {
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
class BlackjackRoom {
  readonly id: string;
  readonly maxPlayers = 5;
  state: GameState;
  clients: { [connectionId: string]: Client };

  constructor(id: string) {
    this.id = id;
    this.clients = {};
    this.state = {
      players: {},
      dealerHand: [],
      deck: createDeck(),
      playerOrder: [],
      currentPlayerIndex: 0,
      status: "waiting",
    };
  }

  broadcast(message: string) {
    // Placeholder broadcast.
    // In a real application, this would send the update to all clients
    // connected to this room.
    console.log(`[Room ${this.id} broadcast]: ${message}`);
  }

  async onJoin(client: Client) {
    this.clients[client.connection.id] = client;

    // check if wallet adddress is already in the game
    const player = this.state.players[client.walletAddr];
    if (player) {
      player.connection.close();
      //update connection id
      player.connection = client.connection;
    }

    client.connection.send('welcome viewer');
  }

  // async onPlayerJoin(player: Player): Promise<void> {
  //   if (Object.keys(this.state.players).length >= this.maxPlayers) {
  //     throw new Error('Table is full');
  //   }
  //   // Assign the smallest available seat (1 to 5).
  //   const takenSeats = Object.values(this.state.players).map((p) => p.seat);
  //   let seat = 1;
  //   while (takenSeats.includes(seat)) {
  //     seat++;
  //   }
  //   this.state.players[player.id] = {
  //     id: player.id,
  //     seat,
  //     bet: 0,
  //     hand: [],
  //     done: false,
  //     hasBusted: false,
  //     isStanding: false,
  //   };
  //   // Update order by seat.
  //   this.state.playerOrder = Object.values(this.state.players)
  //     .sort((a, b) => a.seat - b.seat)
  //     .map((p) => p.id);
  //   this.broadcast(JSON.stringify({ type: 'stateUpdate', state: this.state }));
  // }

  // async onPlayerLeave(player: Player): Promise<void> {
  //   delete this.state.players[player.id];
  //   this.state.playerOrder = Object.values(this.state.players)
  //     .sort((a, b) => a.seat - b.seat)
  //     .map((p) => p.id);
  //   this.broadcast(JSON.stringify({ type: 'stateUpdate', state: this.state }));
  // }

  async onMessage(player: Player, unknownData: unknown): Promise<void> {
    const data = MessageSchema.parse(unknownData);

    switch (data.type) {
      case "placeBet": {
        this.placeBet(player, data.bet);
        break;
      }
      case "startRound": {
        this.startRound();
        break;
      }
      case "hit": {
        this.playerHit(player);
        break;
      }
      case "stand": {
        this.playerStand(player);
        break;
      }
      default:
        console.warn(`Unknown message type: ${data.type}`);
    }
  }

  placeBet(player: Player, bet: number): void {
    if (this.state.status !== "waiting" && this.state.status !== "betting") {
      return;
    }
    const p = this.state.players[player.id];
    if (!p) return;
    p.bet = bet;
    this.broadcast(JSON.stringify({ type: "stateUpdate", state: this.state }));
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
        if (!player) throw new Error("Player not found");
        const card = this.state.deck.pop();
        if (!card) throw new Error("Deck is empty");
        player.hand.push(card);
      }
      const card = this.state.deck.pop();
      if (!card) throw new Error("Deck is empty");
      this.state.dealerHand.push(card);
    }
    this.state.status = "playing";

    this.state.currentPlayerIndex = 0;
    this.broadcast(JSON.stringify({ type: "stateUpdate", state: this.state }));
  }

  playerHit(player: Player): void {
    const currentPlayerId =
      this.state.playerOrder[this.state.currentPlayerIndex];
    if (player.id !== currentPlayerId) return;
    const p = this.state.players[player.id];
    if (!p) throw new Error("Player not found");
    const card = this.state.deck.pop();
    if (!card) throw new Error("Deck is empty");
    p.hand.push(card);
    if (handValue(p.hand) > 21) {
      p.hasBusted = true;
      p.done = true;
      this.advanceTurn();
    }
    this.broadcast(JSON.stringify({ type: "stateUpdate", state: this.state }));
  }

  playerStand(player: Player): void {
    const currentPlayerId =
      this.state.playerOrder[this.state.currentPlayerIndex];
    if (player.id !== currentPlayerId) return;
    const p = this.state.players[player.id];
    if (!p) throw new Error("Player not found");
    p.isStanding = true;
    p.done = true;
    this.advanceTurn();
    this.broadcast(JSON.stringify({ type: "stateUpdate", state: this.state }));
  }

  advanceTurn(): void {
    while (this.state.currentPlayerIndex < this.state.playerOrder.length - 1) {
      this.state.currentPlayerIndex++;
      const pid = this.state.playerOrder[this.state.currentPlayerIndex];
      if (!pid) throw new Error("Player ID not found");
      const player = this.state.players[pid];
      if (!player) throw new Error("Player not found");
      if (!player.done) {
        return;
      }
    }
    // All players have been processed; now it's the dealer's turn.
    this.state.status = "dealerTurn";
    this.dealerPlay();
  }

  dealerPlay(): void {
    while (handValue(this.state.dealerHand) < 17) {
      const card = this.state.deck.pop();
      if (!card) throw new Error("Deck is empty");
      this.state.dealerHand.push(card);
    }
    this.endRound();
  }

  endRound(): void {
    this.state.status = "roundover";
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
          `Player ${pid} wins! (Player: ${playerScore} vs Dealer: ${dealerScore})`
        );
      } else if (playerScore === dealerScore) {
        console.log(`Player ${pid} pushes with ${playerScore}`);
      } else {
        console.log(
          `Player ${pid} loses. (Player: ${playerScore} vs Dealer: ${dealerScore})`
        );
      }
    }
    this.broadcast(JSON.stringify({ type: "stateUpdate", state: this.state }));
  }
}

/*-------------------------------------------------------------------------
  Server Class
  This class implements Party.Server and wires up connections, requests,
  and in-room messages for our Blackjack game.
---------------------------------------------------------------------------*/
export default class Server implements Party.Server {
  // Create a map of rooms. Right now, we only instantiate a "main" room.
  private roomMap: { [id: string]: BlackjackRoom } = {
    main: new BlackjackRoom("main"),
  };

  // We accept a Party instance in the constructor (which may contain env and
  // other details). We no longer require a separate room since we use our map.
  constructor(readonly party: Party.Server) {}

  static async onBeforeConnect(req: Party.Request, lobby: Party.Lobby) {
    try {
      // replace with jwt token and fetch walletaddress from the signature
      let walletAddress: string | null = new URL(req.url).searchParams.get(
        'walletAddress',
      );
      // verify token here

      if (!walletAddress) {
        throw new Error('No wallet address provided');
      }
      walletAddress = walletAddress.toLowerCase();

      // check if wallet address is valid by checking if it starts woth 0x
      if (!walletAddress.startsWith('0x')) {
        throw new Error('Invalid wallet address');
      }

      req.headers.set('X-User-WalletAddress', walletAddress);

      return req;
    } catch (e: unknown) {
      if (e instanceof Error) {
        return new Response(`Unauthorized ${e.message} `, { status: 401 });
      }
      return new Response('Unauthorized: An unexpected error occurred', {
        status: 401,
      });
    }
  }

  async onConnect(
    conn: Party.Connection,
    { request }: Party.ConnectionContext,
  ) {
    try {
      const room = this.roomMap.main;

      if (!room) {
        throw new Error('Room not found');
      }
      const walletAddress = request.headers.get('X-User-WalletAddress') as
        | `0x${string}`
        | null;
      if (!walletAddress) {
        throw new Error('No wallet address provided');
      }

      console.log(`Connected: id: ${conn.id}, room: ${room.id}`);
      conn.send(
        JSON.stringify({
          type: 'welcome',
          message: `Welcome to Blackjack! ${walletAddress}`,
        }),
      );

      await room.onJoin({ connection: conn, walletAddr: walletAddress });
    } catch (err) {
      console.error(`Error joining room: ${err}`);
      conn.send(JSON.stringify({ type: 'error', message: err }));
      conn.close();
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    console.log(`Connection ${sender.id} sent message: ${message}`);
    try {
      const data = JSON.parse(message);
      // Here, we assume messages are for the "main" room.
      const room = this.roomMap.main;
      if (!room) {
        throw new Error("Room not found");
      }
      const player: Player = { id: sender.id };
      room
        .onMessage(player, data)
        .catch((err) => console.error("Error handling message in room:", err));
    } catch (err) {
      console.error("Failed to parse message as JSON", err);
    }
  }

  async onRequest(req: Party.Request) {
    // For debugging, a simple HTTP GET shows the room state.
    const room = this.roomMap.main;
    if (!room) {
      throw new Error("Room not found");
    }
    if (req.method === "GET") {
      return new Response(JSON.stringify(room.state, null, 2));
    }
    return new Response("Unsupported method", { status: 400 });
  }
}

// Ensure our server class satisfies Party.Worker.
Server satisfies Party.Worker;
