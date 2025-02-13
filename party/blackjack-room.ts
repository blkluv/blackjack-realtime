import type * as Party from 'partykit/server';
import {
  BlackjackMessageSchema,
  type BlackjackRecord,
  type Client,
  type GameState,
  type PlayerJoinData,
  type TBlackjackServerMessage,
} from './blackjack.types';

import { createDeck, handValue } from './blackjack.utils';

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

  broadcast<T extends keyof BlackjackRecord>(
    message: TBlackjackServerMessage<T>,
    without?: string[],
  ) {
    this.room.broadcast(JSON.stringify(message), without);
    console.log(`[Room ${this.id} broadcast]: ${message}`);
  }

  send<T extends keyof BlackjackRecord>(
    id: string,
    message: TBlackjackServerMessage<T>,
  ) {
    const client = this.clients[id];
    if (!client) {
      return;
    }

    client.connection.send(JSON.stringify(message));
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
  }

  async onMessage(
    playerAddr: `0x${string}`,
    unknownData: unknown,
  ): Promise<void> {
    const { type, data } = BlackjackMessageSchema.parse(unknownData);

    switch (type) {
      case 'playerJoin': {
        this.playerJoin(playerAddr, { seat: data.seat });
        break;
      }
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
        console.warn(`Unknown message type: ${type}`);
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
    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
  }

  playerLeave(playerAddr: `0x${string}`): void {
    delete this.state.players[playerAddr];

    this.state.playerOrder = Object.values(this.state.players)
      .sort((a, b) => a.seat - b.seat)
      .map((p) => p.walletAddr);
    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
  }

  placeBet(playerAddr: `0x${string}`, bet: number): void {
    if (this.state.status !== 'waiting' && this.state.status !== 'betting') {
      return;
    }
    const p = this.state.players[playerAddr];
    if (!p) return;
    p.bet = bet;
    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
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
    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
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
    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
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
    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
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
    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
  }
}
