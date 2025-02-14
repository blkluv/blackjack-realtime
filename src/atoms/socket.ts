import { env } from '@/env.mjs';
import PartySocket from 'partysocket';
import type { TPartyKitServerMessage } from '../../party';

const ws = new PartySocket({
  host: env.NEXT_PUBLIC_PARTYKIT_HOST,
  room: 'blackjack',
  query: { walletAddress, token },
});

ws.addEventListener('open', () => {
  console.log('WebSocket connection opened');
});

ws.addEventListener('message', (event) => {
  const { room, data, type } = JSON.parse(
    event.data as string,
  ) as TPartyKitServerMessage;
  if (room === 'cursor') {
    switch (type) {
      case 'cursor-sync': {
        const newOthers: OtherCursorsMap = {};
        for (const cursor of data.cursors) {
          newOthers[cursor.id] = cursor;
        }
        setOthers(newOthers);
        break;
      }
      case 'cursor-update': {
        const other = {
          x: data.cursor.x,
          y: data.cursor.y,
          country: data.cursor.country,
          lastUpdate: data.cursor.lastUpdate,
          pointer: data.cursor.pointer,
        };
        setOthers((others) => ({ ...others, [data.cursor.id]: other }));
        break;
      }
      case 'cursor-remove':
        setOthers((others) => {
          const newOthers = { ...others };
          delete newOthers[data.id];
          return newOthers;
        });
        break;
      default:
        console.log('message received', room, type, data);
    }
  } else if (room === 'blackjack') {
    console.log('blackjack', type, data);
  } else {
    console.log('message received', room, type, data);
  }
});

ws.addEventListener('close', () => {
  console.log('WebSocket connection closed');
});

ws.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});
