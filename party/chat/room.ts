import type * as Party from 'partykit/server';
import type { BlackjackRoom } from '../blackjack/room';
import type { ConnectionState } from '../index';
import {
  ChatMessageSchema,
  type ChatRecord,
  type ChatServerMessage,
} from './chat.types';

export class ChatRoom {
  readonly id: string;
  room: Party.Room;
  blackjackRoom: BlackjackRoom;

  constructor(id: string, room: Party.Room, blackjackRoom: BlackjackRoom) {
    this.id = id;
    this.room = room;
    this.blackjackRoom = blackjackRoom;

    blackjackRoom.on('game-log', (log) => {
      this.broadcast({
        room: 'chat',
        type: 'game-log',
        data: { message: log },
      });
    });
  }

  broadcast<T extends keyof ChatRecord>(
    message: ChatServerMessage<T>,
    without?: string[],
  ) {
    this.room.broadcast(JSON.stringify(message), without);
  }

  send<T extends keyof ChatRecord>(id: string, message: ChatServerMessage<T>) {
    const connection = this.room.getConnection(id);
    if (!connection) {
      return;
    }

    connection.send(JSON.stringify(message));
  }

  async onMessage(
    connection: Party.Connection<ConnectionState>,
    unknownData: unknown,
  ) {
    try {
      const { type, data } = ChatMessageSchema.parse(unknownData);
      const userId = connection.state?.userId;

      //guests are not allowed to send messages
      if (!userId || userId === 'guest') {
        return;
      }

      if (type === 'user-message') {
        const { message } = data;
        this.broadcast({
          room: 'chat',
          type: 'user-message',
          data: { message, userId },
        });
      }
    } catch (error) {
      console.error('Error parsing cursor message:', unknownData);
    }
  }
}
