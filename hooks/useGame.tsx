'use client';

import { env } from '@/env.mjs';
import { useAppKitAccount } from '@reown/appkit-core/react';
import { useAppKit } from '@reown/appkit/react';
import usePartySocket from 'partysocket/react';
import { useEffect, useState } from 'react';
import { useSignMessage } from 'wagmi';
import type { TPartyKitServerMessage } from '../party';
import type { TBlackjackMessageSchema } from '../party/blackjack/blackjack.types';
import type { TCursorMessageSchema } from '../party/cursor/cursor.types';

type Position = {
  x: number;
  y: number;
  pointer: 'mouse' | 'touch';
};

type Cursor = Position & {
  country: string | null;
  lastUpdate: number;
};

type OtherCursorsMap = Record<string, Cursor>;

const useGame = () => {
  const [seat, setSeat] = useState('');
  const [isMicOn, setIsMicOn] = useState(false);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token') || null,
  );
  const [self, setSelf] = useState<Position | null>(null);
  const [others, setOthers] = useState<OtherCursorsMap>({});
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const {
    address: walletAddress,
    caipAddress,
    isConnected,
    status,
  } = useAppKitAccount();
  const { open } = useAppKit();

  const { signMessageAsync } = useSignMessage({
    mutation: {
      onSuccess: (data) => {
        try {
          const parsedData = JSON.parse(data) as { token: string };
          setToken(parsedData.token);
          localStorage.setItem('token', parsedData.token);
        } catch (error) {
          console.error('Failed to parse token response:', error);
        }
      },
      onError: (error) => console.error('Error signing message:', error),
    },
  });

  const { send: wssend, readyState } = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: 'blackjack',
    query: { walletAddress, seat, token },
    onOpen: () => {
      console.log('Connected to PartyKit');
      setIsAuthenticated(true);
    },
    onMessage: (evt) => {
      const { room, data, type } = JSON.parse(
        evt.data as string,
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
    },
    onClose: () => {
      setIsAuthenticated(false);
      // If connection closed due to auth error, clear token
      if (!isAuthenticated) {
        setToken(null);
        localStorage.removeItem('token');
      }
    },
    onError: (err) => {
      console.error('Error in PartyKit:', err);
      setIsAuthenticated(false);
    },
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    readyState === WebSocket.OPEN,
  );

  const cursorSend = (message: TCursorMessageSchema) => {
    wssend(JSON.stringify({ room: 'cursor', ...message }));
  };

  const blackjackSend = (message: TBlackjackMessageSchema) => {
    wssend(JSON.stringify({ room: 'blackjack', ...message }));
  };

  // Track window dimensions
  useEffect(() => {
    const onResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Track cursor position
  // useEffect(() => {
  //   const onMouseMove = (e: MouseEvent) => {
  //     if (readyState !== WebSocket.OPEN) return;
  //     if (!dimensions.width || !dimensions.height) return;
  //     const position = {
  //       x: e.clientX / dimensions.width,
  //       y: e.clientY / dimensions.height,
  //       pointer: 'mouse' as const,
  //     };
  //     send(
  //       JSON.stringify({
  //         room: 'cursor',
  //         type: 'cursor-update',
  //         data: position,
  //       }),
  //     );
  //     setSelf(position);
  //   };

  //   const onTouchMove = (e: TouchEvent) => {
  //     if (readyState !== WebSocket.OPEN) return;
  //     if (!dimensions.width || !dimensions.height) return;
  //     if (!e.touches[0]) return;
  //     e.preventDefault();
  //     const position = {
  //       x: e.touches[0].clientX / dimensions.width,
  //       y: e.touches[0].clientY / dimensions.height,
  //       pointer: 'touch' as const,
  //     };
  //     send(
  //       JSON.stringify({
  //         room: 'cursor',
  //         type: 'cursor-update',
  //         data: position,
  //       }),
  //     );
  //     setSelf(position);
  //   };

  //   const onTouchEnd = () => {
  //     if (readyState !== WebSocket.OPEN) return;
  //     send(JSON.stringify({ room: 'cursor', type: 'cursor-remove', data: {} }));
  //     setSelf(null);
  //   };

  //   window.addEventListener('mousemove', onMouseMove);
  //   window.addEventListener('touchmove', onTouchMove);
  //   window.addEventListener('touchend', onTouchEnd);

  //   return () => {
  //     window.removeEventListener('mousemove', onMouseMove);
  //     window.removeEventListener('touchmove', onTouchMove);
  //     window.removeEventListener('touchend', onTouchEnd);
  //   };
  // }, [readyState, dimensions, send]);

  const joinGame = (seat: number) => {
    setSeat(seat.toString());
    blackjackSend({ type: 'playerJoin', data: { seat } });
  };

  return {
    joinGame,
    seat,
    isMicOn,
    setIsMicOn,
    token,
    setToken,
    walletAddress,
    caipAddress,
    isConnected,
    status,
    open,
    isAuthenticated,
    blackjackSend,
    cursorSend,
    readyState,
    cursors: { self, others },
  };
};

export default useGame;
