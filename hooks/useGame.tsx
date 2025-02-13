import { env } from '@/env.mjs';
import { useAppKitAccount } from '@reown/appkit-core/react';
import { useAppKit } from '@reown/appkit/react';
import usePartySocket from 'partysocket/react';
import { useEffect, useState } from 'react';
import { useSignMessage } from 'wagmi';
import type { TPartyKitServerMessage } from '../party';

type Position = {
  x: number;
  y: number;
  pointer: 'mouse' | 'touch';
};

type Cursor = Position & {
  country: string | null;
  lastUpdate: number;
};

type OtherCursorsMap = {
  [id: string]: Cursor;
};

const useGame = () => {
  const [seat, setSeat] = useState('');
  const [isMicOn, setIsMicOn] = useState(false);
  const [token, setToken] = useState('');
  const [self, setSelf] = useState<Position | null>(null);
  const [others, setOthers] = useState<OtherCursorsMap>({});
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
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
        console.log('signed message', data);
        setToken(data);
      },
      onError: (error) => {
        console.error('error signing message', error);
      },
    },
  });

  const { send, readyState } = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: 'blackjack',
    onOpen: () => {
      console.log('connected to partykit');
      setIsAuthenticated(true);
      send('hello from client');
    },
    onMessage: (evt) => {
      const { room, data, type } = JSON.parse(evt.data as string) as TPartyKitServerMessage
      // TODO: need to add validation here , either common type across client and server or zod
      if (room === 'cursor') {
        switch (type) {
          case 'cursor-sync': {

            setOthers({ ...data.cursors });
            break;
          }
          case 'cursor-update': {

            const other = {
              x: data.cursor.x
              y: data.cursor.y,
              country: ,
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
            console.log('message received', msg);
        }
      } else {
        console.log('blackjack', type, data)

      }
    },
    onClose: (close) => {
      console.log('disconnected from partykit', close);
      setIsAuthenticated(false);
    },
    onError: (err) => {
      console.error('error in partykit', err);
      setIsAuthenticated(false);
    },
    query: {
      walletAddress,
      seat,
      token,
    },
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    readyState === WebSocket.OPEN,
  );

  // Track window dimensions
  useEffect(() => {
    const onResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Track cursor position
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (readyState !== WebSocket.OPEN) return;
      if (!dimensions.width || !dimensions.height) return;
      const position = {
        x: e.clientX / dimensions.width,
        y: e.clientY / dimensions.height,
        pointer: 'mouse' as const,
      };
      send(
        JSON.stringify({
          room: 'cursor',
          type: 'cursor-update',
          data: position,
        }),
      );
      setSelf(position);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (readyState !== WebSocket.OPEN) return;
      if (!dimensions.width || !dimensions.height) return;
      if (!e.touches[0]) return;
      e.preventDefault();
      const position = {
        x: e.touches[0].clientX / dimensions.width,
        y: e.touches[0].clientY / dimensions.height,
        pointer: 'touch' as const,
      };
      send(
        JSON.stringify({
          room: 'cursor',
          type: 'cursor-update',
          data: position,
        }),
      );
      setSelf(position);
    };

    const onTouchEnd = () => {
      if (readyState !== WebSocket.OPEN) return;
      send(JSON.stringify({ room: 'cursor', type: 'cursor-remove', data: {} }));
      setSelf(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [readyState, dimensions, send]);

  const joinGame = (seat: number) => {
    setSeat(seat.toString());
    send('');
    // signMessageAsync({ message: env.NEXT_PUBLIC_SIGN_MSG });
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
    send,
    readyState,
    cursors: { self, others }, // Add cursors to the return object
  };
};

export default useGame;
