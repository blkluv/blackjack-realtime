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
      // write a regex to convert walletaddress if inside the log to short form like this log.userId.substring(0, 3)}...${log.userId.substring(log.userId.length - 3)

      const regex = /(\b0x[a-fA-F0-9]{40}\b)/g;
      const shortForm = log.replace(regex, (match) => {
        return `${match.substring(0, 3)}...${match.substring(match.length - 3)}`;
      });

      this.broadcast({
        room: 'chat',
        type: 'game-log',
        data: { message: shortForm },
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
      console.log(data);
      //guests are not allowed to send messages
      if (!userId || userId === 'guest') {
        return;
      }

      if (type === 'user-message') {
        const { message } = data;
        this.broadcast({
          room: 'chat',
          type: 'user-message',
          data: {
            message,
            userId,
            role: connection.state?.isPlayer ? 'player' : 'viewer',
          },
        });
      }
    } catch (error) {
      console.error('Error parsing cursor message:', unknownData);
    }
  }
}
