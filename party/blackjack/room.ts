import type * as Party from 'partykit/server';
import {
  BETTING_PERIOD,
  BlackjackMessageSchema,
  type BlackjackRecord,
  type GameState,
  PLAYER_TURN_PERIOD,
  type PlayerJoinData,
  type PlayerState,
  ROUND_END_PERIOD,
  type RoundResultState,
  type TBlackjackServerMessage,
  type TStatus,
  type Timers,
} from './blackjack.types';

import type { ConnectionState } from '..';
import { EnhancedEventEmitter } from '../EnhancedEventEmitter';
import { createDeck, getCardName, handValue } from './blackjack.utils';

type BlackjackRoomEvents = {
  'game-log': [log: string];
};

/*-------------------------------------------------------------------------
  BlackjackRoom Class
  This class encapsulates all game state and logic for Blackjack.
---------------------------------------------------------------------------*/
export class BlackjackRoom extends EnhancedEventEmitter<BlackjackRoomEvents> {
  readonly id: string;
  room: Party.Room;
  readonly maxPlayers = 5;
  state: GameState;
  timers: Timers;

  constructor(id: string, room: Party.Room) {
    super();
    this.id = id;
    this.room = room;

    this.state = {
      players: {},
      dealerHand: [],
      deck: createDeck(),
      playerOrder: [],
      currentPlayerIndex: 0,
      status: 'waiting',
    };

    this.timers = {
      betTimer: null,
      betTimerStart: null,
      playerTimer: null,
      roundEndTimer: null,
    };
  }

  broadcast<T extends keyof BlackjackRecord>(
    message: TBlackjackServerMessage<T>,
    without?: string[],
  ) {
    this.room.broadcast(JSON.stringify(message), without);
  }

  send<T extends keyof BlackjackRecord>(
    id: string,
    message: TBlackjackServerMessage<T>,
  ) {
    const connection = this.room.getConnection(id);
    if (!connection) {
      return;
    }

    connection.send(JSON.stringify(message));
  }

  getPlayer(userId: `0x${string}`): PlayerState | undefined {
    for (const player of Object.values(this.state.players)) {
      if (player.userId === userId) {
        return player;
      }
    }
  }

  getSeat(userId: `0x${string}`): number | undefined {
    const player = this.getPlayer(userId);
    if (!player) return undefined;
    return player.seat;
  }

  async onJoin(connection: Party.Connection<ConnectionState>) {
    // check if wallet adddress is already in the game
    const userId = connection.state?.userId;
    if (userId === undefined) {
      //close connection throw error
      //TODO:Implement close error codes
      connection.close(4000, 'Invalid wallet address');
      console.log("didn't join blackjackroom ", { connection });

      return;
    }

    if (userId !== 'guest') {
      const player = this.getPlayer(userId);
      if (player) {
        const oldConnection = this.room.getConnection(player.connectionId);
        if (oldConnection) {
          oldConnection.close(
            4000,
            'Player already in game, Reconnected , Closing Old Socket',
          );
        }
        this.emit('game-log', `Player ${userId} Reconnected`);
        player.connectionId = connection.id;
      }
    }

    this.send(connection.id, {
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
  }

  async onMessage(
    connection: Party.Connection<ConnectionState>,
    unknownData: unknown,
  ): Promise<void> {
    const { type, data } = BlackjackMessageSchema.parse(unknownData);
    const userId = connection.state?.userId;
    if (!userId) {
      throw new Error('User ID not found');
    }
    if (userId === 'guest') {
      throw new Error('Guests cannot join the game');
    }
    // check if player is a connected client
    if (connection.readyState !== WebSocket.OPEN) {
      throw new Error('Player is not connected');
    }

    switch (type) {
      case 'playerJoin': {
        this.playerJoin(connection.id, userId, { seat: data.seat });
        break;
      }
      case 'placeBet': {
        this.placeBet(connection.id, userId, data.bet);
        break;
      }
      case 'startRound': {
        this.startRound();
        break;
      }
      case 'hit': {
        this.playerHit(userId);
        break;
      }
      case 'stand': {
        this.playerStand(userId);
        break;
      }
      default:
        console.warn(`Unknown message type: ${type}`);
    }
    console.log({ gamestate: this.state });
  }

  playerJoin(
    connectionId: string,
    userId: `0x${string}`,
    data: PlayerJoinData,
  ) {
    if (Object.keys(this.state.players).length >= this.maxPlayers) {
      throw new Error('Table is full');
    }
    const { seat } = data;

    //check if player is already connected
    if (Object.values(this.state.players).some((p) => p.userId === userId)) {
      throw new Error('Player is already connected');
    }

    //check if seat is already taken
    if (this.state.players[seat]) {
      throw new Error('Seat is already taken');
    }

    this.state.players[seat] = {
      connectionId,
      userId,
      seat,
      bet: 0,
      hand: [],
      done: false,
      hasBusted: false,
      isStanding: false,
      roundResult: null,
    };

    // Update order by seat.
    this.state.playerOrder = Object.values(this.state.players)
      .sort((a, b) => a.seat - b.seat)
      .map((p) => p.userId);

    this.emit('game-log', `Player ${userId} joined the Table`);

    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });

    if (this.state.status === 'betting' && this.timers.betTimer) {
      if (this.getBetTimerRemainingTime() < 15) {
        this.resetBetTimer();
      }
    }
  }

  playerLeave(userId: `0x${string}`): void {
    const seat = this.getSeat(userId);
    if (!seat) return;

    delete this.state.players[seat];

    this.state.playerOrder = Object.values(this.state.players)
      .sort((a, b) => a.seat - b.seat)
      .map((p) => p.userId);

    this.emit('game-log', `Player ${userId} left the Table`);

    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
  }

  placeBet(connectionId: string, userId: `0x${string}`, bet: number): void {
    if (this.state.status !== 'waiting' && this.state.status !== 'betting') {
      return;
    }

    const seat = this.getSeat(userId);
    if (!seat) return;

    const p = this.state.players[seat];
    if (!p) return;

    p.bet = bet;

    this.state.status = 'betting';

    this.state.playerOrder = Object.values(this.state.players)
      .filter((player) => player.bet > 0)
      .sort((a, b) => {
        const seatA = a.seat;
        const seatB = b.seat;
        return seatA - seatB;
      })
      .map((player) => player.userId);

    this.emit('game-log', `Player ${userId} placed a bet of ${bet}`);

    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });

    if (!this.timers.betTimer) {
      this.startBetTimer();
    }
  }

  startBetTimer(): void {
    this.timers.betTimerStart = Date.now(); // Store the start time
    this.timers.betTimer = setTimeout(() => {
      this.startRound();
    }, BETTING_PERIOD); // 20 seconds

    this.emit(
      'game-log',
      `Players can place bets within the next ${BETTING_PERIOD / 1000} seconds`,
    );

    // Notify players that the bet timer has started
    this.broadcast({
      room: 'blackjack',
      type: 'betTimerStart',
      data: { startedAt: Date.now() },
    });
  }

  resetBetTimer(): void {
    if (this.timers.betTimer) {
      clearTimeout(this.timers.betTimer);
    }
    this.startBetTimer();
  }

  getBetTimerRemainingTime(): number {
    if (!this.timers.betTimer || this.timers.betTimerStart === null) return 0;

    const elapsedTime = Date.now() - this.timers.betTimerStart;
    const timeRemaining = BETTING_PERIOD - elapsedTime;
    return Math.max(0, timeRemaining);
  }

  startRound(): void {
    if (this.timers.betTimer) {
      clearTimeout(this.timers.betTimer);
      this.timers.betTimer = null;
      this.timers.betTimerStart = null;
    }

    this.emit('game-log', 'Betting Period has Ended');
    // Notify players that the bet timer has ended
    this.broadcast({
      room: 'blackjack',
      type: 'betTimerEnd',
      data: { endedAt: Date.now() },
    });

    if (Object.keys(this.state.players).length === 0) {
      this.state.status = 'waiting';
      return;
    }

    if (this.state.status !== 'betting' && this.state.status !== 'waiting')
      return;

    // Filter out players with zero bets from playerOrder
    this.state.playerOrder = Object.values(this.state.players)
      .filter((player) => player.bet > 0)
      .sort((a, b) => {
        const seatA = a.seat;
        const seatB = b.seat;
        return seatA - seatB;
      })
      .map((player) => player.userId);

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
      player.roundResult = null;
    }
    this.state.dealerHand = [];
    // Deal two cards to every player and two to the dealer.
    for (let i = 0; i < 2; i++) {
      for (const pid of this.state.playerOrder) {
        const seat = this.getSeat(pid);
        if (!seat) continue;
        const player = this.state.players[seat];
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

    this.emit(
      'game-log',
      'Game has Started, Dealer has dealt two cards to each player',
    );

    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });

    if (this.state.playerOrder.length > 0) {
      this.startPlayerTimer();
    } else {
      this.state.status = 'waiting';
      this.broadcast({
        room: 'blackjack',
        type: 'stateUpdate',
        data: { state: this.state },
      });
    }
  }

  playerHit(userId: `0x${string}`): void {
    const currentPlayerId =
      this.state.playerOrder[this.state.currentPlayerIndex];
    if (userId !== currentPlayerId) return;

    const seat = this.getSeat(userId);
    if (!seat) throw new Error('Seat not found');

    const p = this.state.players[seat];
    if (!p) throw new Error('Player not found');
    const card = this.state.deck.pop();
    if (!card) throw new Error('Deck is empty');
    p.hand.push(card);
    this.emit('game-log', `${p.userId} has hit with ${getCardName(card)}`);
    if (handValue(p.hand).value > 21) {
      this.emit('game-log', `${p.userId} has busted`);
      p.hasBusted = true;
      p.done = true;
      this.clearPlayerTimer();
      this.advanceTurn();
    } else {
      this.resetPlayerTimer();
    }
    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
  }

  playerStand(userId: `0x${string}`): void {
    const currentPlayerId =
      this.state.playerOrder[this.state.currentPlayerIndex];
    if (userId !== currentPlayerId) return;
    const seat = this.getSeat(userId);
    if (!seat) throw new Error('Seat not found');
    const p = this.state.players[seat];
    if (!p) throw new Error('Player not found');
    p.isStanding = true;
    p.done = true;
    this.emit('game-log', `${p.userId} has chosen to stand`);
    this.clearPlayerTimer();
    this.advanceTurn();
    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
  }

  startPlayerTimer(): void {
    this.clearPlayerTimer();
    const currentPlayerId =
      this.state.playerOrder[this.state.currentPlayerIndex];
    if (!currentPlayerId) return; // Handle case where there's no current player

    this.timers.playerTimer = setTimeout(() => {
      // Player timed out, force stand
      const seat = this.getSeat(currentPlayerId);
      if (!seat) return;
      const p = this.state.players[seat];
      if (!p) return;

      p.isStanding = true;
      p.done = true;
      this.broadcast({
        room: 'blackjack',
        type: 'stateUpdate',
        data: { state: this.state },
      });
      this.advanceTurn();
    }, PLAYER_TURN_PERIOD);

    this.emit('game-log', `${currentPlayerId}'s Turn to Hit or Stand`);

    // Notify players that the player timer has started
    this.broadcast({
      room: 'blackjack',
      type: 'playerTimerStart',
      data: { userId: currentPlayerId, startedAt: Date.now() },
    });
  }
  resetPlayerTimer(): void {
    this.clearPlayerTimer();
    this.startPlayerTimer();
  }

  clearPlayerTimer(): void {
    if (this.timers.playerTimer) {
      clearTimeout(this.timers.playerTimer);
      this.timers.playerTimer = null;
    }
  }

  advanceTurn(): void {
    this.clearPlayerTimer();

    const previousPlayerId =
      this.state.playerOrder[this.state.currentPlayerIndex - 1];
    if (previousPlayerId) {
      this.broadcast({
        room: 'blackjack',
        type: 'playerTimerEnd',
        data: { userId: previousPlayerId, endedAt: Date.now() },
      });
    }

    while (this.state.currentPlayerIndex < this.state.playerOrder.length - 1) {
      this.state.currentPlayerIndex++;
      const pid = this.state.playerOrder[this.state.currentPlayerIndex];
      if (!pid) throw new Error('Player ID not found');
      const seat = this.getSeat(pid);
      if (!seat) throw new Error('Seat not found');
      const player = this.state.players[seat];
      if (!player) throw new Error('Player not found');
      if (!player.done) {
        this.startPlayerTimer();
        return;
      }
    }
    // All players have been processed; now it's the dealer's turn.
    this.emit('game-log', 'All Players have played, Dealers Turn Begins');
    this.state.status = 'dealerTurn';
    this.dealerPlay();
  }

  dealerPlay(): void {
    while (handValue(this.state.dealerHand).value < 17) {
      const card = this.state.deck.pop();
      if (!card) throw new Error('Deck is empty');
      this.state.dealerHand.push(card);
      this.emit('game-log', `Dealer draws ${getCardName(card)}`);
    }
    this.endRound();
  }

  endRound(): void {
    this.state.status = 'roundover';
    const { value: dealerScore } = handValue(this.state.dealerHand);

    for (const pid of this.state.playerOrder) {
      const seat = this.getSeat(pid);
      if (!seat) throw new Error('Seat not found');
      const p = this.state.players[seat];
      if (!p) {
        throw new Error(`Player ${pid} not found`);
      }
      const { value: playerScore } = handValue(p.hand);
      let reward = 0;
      let state: RoundResultState = 'loss'; // Default state

      if (p.hasBusted) {
        console.log(`Player ${pid} busted and loses bet ${p.bet}`);
        this.emit('game-log', `Player ${pid} busted and loses bet ${p.bet}`);
        state = 'loss';
        reward = -p.bet; // Lost
      } else if (dealerScore > 21 || playerScore > dealerScore) {
        // Check for Blackjack (example condition - adjust as needed)
        if (playerScore === 21 && p.hand.length === 2) {
          state = 'blackjack';
          reward = 1.5 * p.bet; // Blackjack (1.5x bet - adjust as needed)
          console.log(`Player ${pid} wins with Blackjack!`);
          this.emit('game-log', `Player ${pid} wins with Blackjack!`);
        } else {
          console.log(
            `Player ${pid} wins! (Player: ${playerScore} vs Dealer: ${dealerScore})`,
          );
          this.emit(
            'game-log',
            `Player ${pid} wins! (Player: ${playerScore} vs Dealer: ${dealerScore})`,
          );
          state = 'win';
          reward = p.bet; // Win (1x bet)
        }
      } else if (playerScore === dealerScore) {
        console.log(`Player ${pid} draws with ${playerScore} hence loses`);
        this.emit(
          'game-log',
          `Player ${pid} draws with ${playerScore} hence loses`,
        );
        state = 'loss';
        reward = -p.bet; // Draw (hence lost)
      } else {
        console.log(
          `Player ${pid} loses. (Player: ${playerScore} vs Dealer: ${dealerScore})`,
        );
        state = 'loss';
        reward = -p.bet; // Lost
      }
      // Update the player's state with the round result
      p.roundResult = { bet: p.bet, reward, state };
    }

    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });

    this.timers.roundEndTimer = setTimeout(() => {
      this.resetRound();
    }, ROUND_END_PERIOD);
  }

  clearRoundEndTimer(): void {
    if (this.timers.roundEndTimer) {
      clearTimeout(this.timers.roundEndTimer);
      this.timers.roundEndTimer = null;
    }
  }

  resetRound(status: TStatus = 'waiting'): void {
    this.state.status = status;
    this.state.dealerHand = [];
    this.state.currentPlayerIndex = 0;
    this.state.playerOrder = [];
    for (const player of Object.values(this.state.players)) {
      player.bet = 0;
      player.hand = [];
      player.done = false;
      player.hasBusted = false;
      player.isStanding = false;
      player.roundResult = null;
    }

    this.clearRoundEndTimer();

    this.timers = {
      roundEndTimer: null,
      playerTimer: null,
      betTimerStart: null,
      betTimer: null,
    };

    this.emit('game-log', 'Table is ready for a new game');
    this.broadcast({
      room: 'blackjack',
      type: 'stateUpdate',
      data: { state: this.state },
    });
  }
}
