import type * as Party from 'partykit/server';
import {
  BETTING_PERIOD,
  BlackjackMessageSchema,
  type BlackjackRecord,
  type ClientSideGameState,
  DEALER_TURN_PERIOD,
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

import { generateRandomString } from '@/atoms/atom';
import { TableRounds, UserRounds } from '@/server/db/schema';
import type { ConnectionState, TDatabase } from '..';
import { EnhancedEventEmitter } from '../EnhancedEventEmitter';
import { createDeck, handValue } from './blackjack.utils';

import { env } from '@/env.mjs';
import {
  TOKEN_ABI,
  TOKEN_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
} from '@/web3/constants';
import {
  http,
  createPublicClient,
  createWalletClient,
  formatUnits,
  parseUnits,
} from 'viem';
import { nonceManager, privateKeyToAccount } from 'viem/accounts';
import { huddle01Testnet } from 'viem/chains';

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
  db: TDatabase;
  decimals: number | null;
  betPromises: Promise<void>[];

  private operatorPrivateKey: string; // Server's private key for operator
  private operatorAccount: ReturnType<typeof privateKeyToAccount>;
  private walletClient: ReturnType<typeof createWalletClient>;
  private publicClient: ReturnType<typeof createPublicClient>;

  //Mutex for bet timer
  private betTimerMutexLocked = false;

  constructor(id: string, room: Party.Room, db: TDatabase) {
    super();
    this.id = id;
    this.room = room;
    this.db = db;
    this.decimals = null;
    this.betPromises = [];

    this.state = {
      players: {},
      dealerHand: [],
      deck: createDeck(),
      playerOrder: [],
      currentPlayerIndex: 0,
      status: 'waiting',
      roundId: null,
    };

    this.timers = {
      betTimer: null,
      betTimerStart: null,
      playerTimer: null,
      roundEndTimer: null,
      dealerTimer: null,
    };

    // Initialize blockchain clients
    this.operatorPrivateKey = env.OPERATOR_PRIVATE_KEY;
    if (this.operatorPrivateKey === '') {
      throw new Error('Operator private key is empty, Set ENV Vars');
    }
    this.operatorAccount = privateKeyToAccount(
      this.operatorPrivateKey as `0x${string}`,
      { nonceManager: nonceManager },
    );

    this.publicClient = createPublicClient({
      chain: huddle01Testnet, // Use your chain configuration
      transport: http(),
    });

    this.walletClient = createWalletClient({
      chain: huddle01Testnet, // Use your chain configuration
      transport: http(),
      account: this.operatorAccount,
    });
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

        connection.setState({
          userId: userId,
          country: connection.state?.country ?? null,
          staticId: connection.state?.staticId ?? generateRandomString(9),
          isPlayer: true,
        });

        player.online = true;
        // this.emit('game-log', `Player ${userId} Reconnected`);
        player.connectionId = connection.id;
        this.sendGameState('broadcast');
      }
    }

    this.sendGameState('send', [connection.id]);
  }

  async onLeave(connection: Party.Connection<ConnectionState>) {
    const userId = connection.state?.userId;
    if (userId === undefined) {
      return;
    }

    if (userId !== 'guest') {
      const player = this.getPlayer(userId);
      if (player) {
        if (this.state.status === 'playing') {
          player.online = false;
          this.emit('game-log', `Player ${userId} Disconnected`);
        } else {
          connection.setState({
            userId: userId,
            country: connection.state?.country ?? null,
            staticId: connection.state?.staticId ?? generateRandomString(9),
            isPlayer: false,
          });

          // remove player from game
          delete this.state.players[player.seat];
        }

        this.sendGameState('broadcast');
      }
    }
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
      case 'leave': {
        this.playerLeave(userId);
        break;
      }
      default:
        console.warn(`Unknown message type: ${type}`);
    }
    console.log({ gamestate: this.state });
  }
  sendGameState(mode: 'broadcast' | 'send', toConnectionIds?: string[]) {
    // Create a copy of the state to avoid modifying the original
    const clientGameState: ClientSideGameState = {
      players: this.state.players,
      currentPlayerIndex: this.state.currentPlayerIndex,
      dealerHand: this.state.dealerHand,
      playerOrder: this.state.playerOrder,
      status: this.state.status,
    };

    // In 'playing' state, hide deck and dealer's second card
    if (this.state.status === 'playing') {
      let firstCard = this.state.dealerHand[0];
      if (!firstCard) {
        firstCard = '**';
      }
      clientGameState.dealerHand = [firstCard, '**'];
    } else if (
      this.state.status === 'dealerTurn' ||
      this.state.status === 'roundover'
    ) {
      clientGameState.dealerHand = this.state.dealerHand; // keep dealer hand empty before game start or betting state
    }

    if (mode === 'broadcast') {
      this.broadcast({
        room: 'blackjack',
        type: 'stateUpdate',
        data: { state: clientGameState },
      });
    } else if (mode === 'send' && toConnectionIds) {
      for (const connectionId of toConnectionIds) {
        this.send(connectionId, {
          room: 'blackjack',
          type: 'stateUpdate',
          data: { state: clientGameState },
        });
      }
    }
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
      online: true,
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

    this.sendGameState('broadcast');

    if (this.state.status === 'betting' && this.timers.betTimer) {
      if (this.getBetTimerRemainingTime() < 15) {
        this.resetBetTimer();
      }
    }
  }

  playerLeave(userId: `0x${string}`): void {
    const seat = this.getSeat(userId);
    if (!seat) return;

    if (this.state.status === 'playing' && this.state.players[seat]) {
      this.state.players[seat].online = false;
      // this.emit('game-log', `Player ${userId} left the Table`);
      this.sendGameState('broadcast');
      return;
    }

    delete this.state.players[seat];

    this.state.playerOrder = Object.values(this.state.players)
      .sort((a, b) => a.seat - b.seat)
      .map((p) => p.userId);

    // this.emit('game-log', `Player ${userId} left the Table`);

    this.sendGameState('broadcast');
  }

  /**
   * Execute a function with timer mutex protection
   */
  private async withTimerMutex<T>(fn: () => T): Promise<T> {
    // Wait until lock is free
    while (this.betTimerMutexLocked) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Acquire lock
    this.betTimerMutexLocked = true;

    try {
      // Execute the protected code
      return fn();
    } finally {
      // Release lock
      this.betTimerMutexLocked = false;
    }
  }

  /**
   * Safe timer check and start if needed
   */
  private async ensureBetTimer(): Promise<void> {
    await this.withTimerMutex(() => {
      if (!this.timers.betTimer) {
        this.startBetTimer();
      }
      return true;
    });
  }

  private placeBet(connectionId: string, userId: `0x${string}`, bet: number) {
    const promise = this.placeBetPromise(connectionId, userId, bet);
    this.betPromises.push(promise);
  }

  private async placeBetPromise(
    connectionId: string,
    userId: `0x${string}`,
    bet: number,
  ): Promise<void> {
    if (this.state.status !== 'waiting' && this.state.status !== 'betting') {
      return;
    }

    this.send(connectionId, {
      room: 'blackjack',
      type: 'bet-log',
      data: { status: 'checking-balance' },
    });

    // Check if player has enough balance
    const hasSufficientBalance = await this.checkPlayerBalance(userId, bet);

    if (!hasSufficientBalance) {
      // Send error message to player
      this.send(connectionId, {
        room: 'blackjack',
        type: 'bet-log',
        data: { status: 'insufficient-funds' },
      });
      this.send(connectionId, {
        room: 'blackjack',
        type: 'error',
        data: { message: 'Insufficient balance to place bet' },
      });
      return;
    }
    console.log(
      'Player',
      userId,
      ' hasSufficientBalance',
      hasSufficientBalance,
    );
    const seat = this.getSeat(userId);
    if (!seat) return;

    const p = this.state.players[seat];
    if (!p) return;

    try {
      // Use a negative amount to deduct funds
      this.send(connectionId, {
        room: 'blackjack',
        type: 'bet-log',
        data: { status: 'deducting-funds' },
      });
      const success = await this.updatePlayerBalance(
        userId,
        -bet, // Negative value to deduct the bet amount
        `Blackjack bet placed in round ${this.state.roundId || 'new round'}`,
        1,
      );

      if (!success) {
        this.send(connectionId, {
          room: 'blackjack',
          type: 'bet-log',
          data: { status: 'bet-failed' },
        });
        this.send(connectionId, {
          room: 'blackjack',
          type: 'error',
          data: { message: 'Failed to process bet. Please try again.' },
        });
        return;
      }
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

      this.send(connectionId, {
        room: 'blackjack',
        type: 'bet-log',
        data: { status: 'bet-placed' },
      });

      this.emit('game-log', `Player ${userId} placed a bet of ${bet}`);

      this.sendGameState('broadcast');

      // Use the mutex-protected timer method
      await this.ensureBetTimer();
    } catch (error) {
      console.error(`Error processing bet for ${userId}:`, error);
      this.send(connectionId, {
        room: 'blackjack',
        type: 'error',
        data: { message: 'Failed to process bet. Please try again.' },
      });
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

  async startRound(): Promise<void> {
    await Promise.all(this.betPromises).catch((err) => {
      console.error('bet promises failed', err);
    });

    this.betPromises = [];

    if (this.timers.betTimer) {
      clearTimeout(this.timers.betTimer);
      this.timers.betTimer = null;
      this.timers.betTimerStart = null;
    }

    // this.emit('game-log', 'Betting Period has Ended');
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
    if (this.state.deck.length < 52) {
      this.state.deck = createDeck();
      console.log(
        'New 4-deck shoe created with',
        this.state.deck.length,
        'cards',
      );
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
    this.state.roundId = generateRandomString(9);
    this.state.currentPlayerIndex = 0;

    // this.emit(
    //   'game-log',
    //   'Game has Started, Dealer has dealt two cards to each player',
    // );

    this.sendGameState('broadcast');

    if (this.state.playerOrder.length > 0) {
      this.startPlayerTimer();
    } else {
      this.state.status = 'waiting';
      this.sendGameState('broadcast');
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
    // this.emit('game-log', `${p.userId} has hit with ${getCardName(card)}`);
    if (handValue(p.hand).value > 21) {
      // this.emit('game-log', `${p.userId} has busted`);
      p.hasBusted = true;
      p.done = true;
      this.clearPlayerTimer();
      this.advanceTurn();
    } else {
      this.resetPlayerTimer();
    }
    this.sendGameState('broadcast');
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
    // this.emit('game-log', `${p.userId} has chosen to stand`);
    this.clearPlayerTimer();
    this.advanceTurn();
    this.sendGameState('broadcast');
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
      this.sendGameState('broadcast');
      this.advanceTurn();
    }, PLAYER_TURN_PERIOD);

    // this.emit('game-log', `${currentPlayerId}'s Turn to Hit or Stand`);

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
      this.state.playerOrder[this.state.currentPlayerIndex];
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

    this.dealerPlay();
  }

  dealerPlay(): void {
    // All players have been processed; now it's the dealer's turn.

    // this.emit('game-log', 'All Players have played, Dealers Turn Begins');
    this.state.status = 'dealerTurn';

    while (handValue(this.state.dealerHand).value < 17) {
      const card = this.state.deck.pop();
      if (!card) throw new Error('Deck is empty');

      this.state.dealerHand.push(card);
      // this.emit('game-log', `Dealer draws ${getCardName(card)}`);
    }

    this.sendGameState('broadcast');
    this.timers.dealerTimer = setTimeout(() => {
      this.endRound();
    }, DEALER_TURN_PERIOD);
  }

  async endRound(): Promise<void> {
    type UserRoundObj = {
      id: string;
      walletAddress: string;
      roundId: string;
      state: RoundResultState;
      bet: number;
      reward: number;
      handArray: string;
    };

    this.timers.dealerTimer = null;
    this.state.status = 'roundover';
    const { value: dealerScore } = handValue(this.state.dealerHand);
    const roundId = this.state.roundId;
    if (roundId === null) {
      console.error('Round ID is null');
      this.resetRound();
      return;
    }
    let netDealerReward = 0;
    const userRoundObj: UserRoundObj[] = [];
    const balanceUpdates: Promise<boolean>[] = [];

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
        // this.emit('game-log', `Player ${pid} busted and loses bet ${p.bet}`);
        state = 'loss';
        reward = 0; // Lost
        netDealerReward += p.bet;
      } else if (dealerScore > 21 || playerScore > dealerScore) {
        // Check for Blackjack (example condition - adjust as needed)
        if (playerScore === 21 && p.hand.length === 2) {
          state = 'blackjack';
          reward = Math.floor(2.5 * p.bet); // Blackjack (1.5x bet - adjust as needed)
          console.log(`Player ${pid} wins with Blackjack!`);
          this.emit('game-log', `Player ${pid} wins with Blackjack!`);
          netDealerReward -= Math.floor(1.5 * p.bet);
        } else {
          console.log(
            `Player ${pid} wins! (Player: ${playerScore} vs Dealer: ${dealerScore})`,
          );
          // this.emit(
          //   'game-log',
          //   `Player ${pid} wins! (Player: ${playerScore} vs Dealer: ${dealerScore})`,
          // );
          state = 'win';
          reward = 2 * p.bet; // Win (1x bet)
          netDealerReward -= p.bet;
        }
      } else if (playerScore === dealerScore) {
        if (
          playerScore === 21 &&
          p.hand.length === 2 &&
          this.state.dealerHand.length === 2
        ) {
          state = 'push';
          reward = p.bet; // Push (return bet)
        } else if (playerScore === 21 && p.hand.length === 2) {
          state = 'blackjack';
          reward = Math.floor(2.5 * p.bet); // Blackjack (1.5x bet - adjust as needed)
          console.log(`Player ${pid} wins with Blackjack!`);
          this.emit('game-log', `Player ${pid} wins with Blackjack!`);
          netDealerReward -= Math.floor(1.5 * p.bet);
        } else {
          console.log(`Player ${pid} draws with ${playerScore} hence loses`);
          // this.emit(
          //   'game-log',
          //   `Player ${pid} draws with ${playerScore} hence loses`,
          // );
          state = 'loss';
          reward = 0; // Draw (hence lost)
          netDealerReward += p.bet;
        }
      } else {
        console.log(
          `Player ${pid} loses. (Player: ${playerScore} vs Dealer: ${dealerScore})`,
        );
        state = 'loss';
        reward = 0; // Lost
        netDealerReward += p.bet;
      }
      // Update the player's state with the round result
      p.roundResult = { bet: p.bet, reward, state };

      userRoundObj.push({
        id: generateRandomString(10),
        walletAddress: p.userId,
        roundId: roundId,
        state: state,
        bet: p.bet,
        handArray: p.hand.toString(),
        reward: reward,
      });

      // Only send rewards for wins - losses were already deducted
      if (reward > 0) {
        const updatePromise = this.updatePlayerBalance(
          p.userId,
          reward, // Only positive values for winnings
          `Blackjack round ${roundId}: ${state}`,
          3,
        );
        balanceUpdates.push(updatePromise);
      }
    }

    this.db
      .insert(TableRounds)
      .values([
        {
          roundId,
          netDealerReward,
          dealerHandArray: this.state.dealerHand.toString(),
          date: new Date().toISOString(),
        },
      ])
      .then(() => {
        this.db
          .insert(UserRounds)
          .values(userRoundObj)
          .catch((err) => {
            console.error('UserRounds insert failed', err);
          });
      })
      .catch((err) => {
        console.error('TableRounds insert failed', err);
      });

    await Promise.all(balanceUpdates);

    this.sendGameState('broadcast');

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
    this.state.roundId = null;
    this.state.status = status;
    this.state.dealerHand = [];
    this.state.currentPlayerIndex = 0;
    this.state.playerOrder = [];
    for (const player of Object.values(this.state.players)) {
      if (player.online === false) {
        // remove player from map if offline during reset
        delete this.state.players[player.seat];
      } else {
        player.bet = 0;
        player.hand = [];
        player.done = false;
        player.hasBusted = false;
        player.isStanding = false;
        player.roundResult = null;
      }
    }

    this.clearRoundEndTimer();

    this.timers = {
      roundEndTimer: null,
      playerTimer: null,
      betTimerStart: null,
      betTimer: null,
      dealerTimer: null,
    };

    this.emit('game-log', 'Table is ready for a new game');
    this.sendGameState('broadcast');
  }

  // wallet functions
  async getTokenDecimals(): Promise<number> {
    try {
      if (this.decimals !== null) {
        return this.decimals;
      }

      const decimals = await this.publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'decimals',
      });

      this.decimals = decimals;
      return decimals;
    } catch (error) {
      console.error('Error getting token decimals:', error);
      return 18; // Default to 18 if we can't get the value
    }
  }
  /**
   * Checks if a player has sufficient balance in the vault contract
   */
  async checkPlayerBalance(
    userId: `0x${string}`,
    betAmount: number,
  ): Promise<boolean> {
    try {
      const balance = await this.publicClient.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'getBalance',
        args: [userId],
      });

      // floor the balance to 2 decimal places
      const decimals = await this.getTokenDecimals();

      const formattedBalance = formatUnits(balance, decimals);

      console.log('Player', userId, 'has balance :', formattedBalance);

      return BigInt(formattedBalance) >= BigInt(betAmount);
    } catch (error) {
      console.error('Error checking player balance:', error);
      return false;
    }
  }

  /**
   * Updates player balance in the vault contract
   */
  async updatePlayerBalance(
    userId: `0x${string}`,
    amount: number,
    reason: string,
    maxRetries = 0, // Default to 0 retries (single attempt)
  ): Promise<boolean> {
    const totalAttempts = maxRetries + 1; // Initial attempt + retries

    try {
      const decimals = await this.getTokenDecimals();
      const formattedAmount = parseUnits(amount.toString(), decimals);

      for (let attempt = 1; attempt <= totalAttempts; attempt++) {
        try {
          // Call the adjustPlayerBalance function
          const hash = await this.walletClient.writeContract({
            address: VAULT_ADDRESS,
            abi: VAULT_ABI,
            functionName: 'adjustPlayerBalance',
            args: [userId, formattedAmount, reason],
            account: this.operatorAccount,
            chain: huddle01Testnet,
          });

          // Wait for transaction to be confirmed
          await this.publicClient.waitForTransactionReceipt({ hash });

          // If it wasn't the first attempt, log success after retry
          if (attempt > 1) {
            console.log(
              `Balance update for ${userId} succeeded on attempt ${attempt}/${totalAttempts}`,
            );
          }

          // Success - return true
          return true;
        } catch (error) {
          // On final attempt, just throw to outer catch
          if (attempt === totalAttempts) {
            throw error;
          }

          // Otherwise, log and retry immediately
          console.log(
            `Attempt ${attempt}/${totalAttempts} failed for ${userId}. Retrying immediately...`,
          );
          // No delay - continue directly to the next iteration
        }
      }

      return false; // Should never reach here
    } catch (error) {
      console.error(
        `Error updating balance for ${userId} after ${totalAttempts} attempts:`,
        error,
      );
      return false;
    }
  }
}
