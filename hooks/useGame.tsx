'use client';

import { env } from '@/env.mjs';
import { client } from '@/lib/client';
import { useAppKitAccount } from '@reown/appkit-core/react';
import { useAppKit } from '@reown/appkit/react';
import usePartySocket from 'partysocket/react';
import { useCallback, useEffect, useState } from 'react';
import { useSignMessage } from 'wagmi';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const authenticate = useCallback(async () => {
    if (!walletAddress) return null;

    try {
      const signature = await signMessageAsync({
        message: env.NEXT_PUBLIC_SIGN_MSG,
      });

      const response = await client.post.verifyChallenge.$get({
        signature,
        walletAddress,
      });

      if (!response.ok) throw new Error('Authentication failed');

      const res = await response.json();

      if ('message' in res) {
        console.error('Authentication response message:', res.message);
      } else if ('token' in res) {
        setToken(res.token);
        localStorage.setItem('token', res.token);
      } else {
        console.error('Unexpected authentication response:', res);
      }
      return token;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }, [walletAddress, signMessageAsync]);

  const { send, readyState } = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: 'blackjack',
    query: { walletAddress, seat, token },
    onOpen: () => {
      console.log('Connected to PartyKit');
      setIsAuthenticated(true);
      send('hello from client');
    },
    onMessage: (evt) => {
      try {
        const msg = JSON.parse(evt.data as string);
        switch (msg.type) {
          case 'sync':
            setOthers(msg.cursors);
            break;
          case 'cursor-update':
            setOthers((prev) => ({ ...prev, [msg.id]: msg }));
            break;
          case 'cursor-remove':
            setOthers((prev) => {
              const updated = { ...prev };
              delete updated[msg.id];
              return updated;
            });
            break;
          case 'new-token':
            setToken(msg.token);
            localStorage.setItem('token', msg.token);
            break;
          default:
            console.log('Received unknown message:', msg);
        }
      } catch (error) {
        console.error('Error parsing incoming message:', error);
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

  // Handle screen resize
  useEffect(() => {
    const onResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Handle cursor movement
  useEffect(() => {
    if (
      readyState !== WebSocket.OPEN ||
      !dimensions.width ||
      !dimensions.height
    )
      return;

    const updateCursor = (x: number, y: number, pointer: 'mouse' | 'touch') => {
      const position = {
        x: x / dimensions.width,
        y: y / dimensions.height,
        pointer,
      };
      send(JSON.stringify({ type: 'cursor-update', ...position }));
      setSelf(position);
    };

    const onMouseMove = (e: MouseEvent) =>
      updateCursor(e.clientX, e.clientY, 'mouse');
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0] && e.touches.length > 0)
        updateCursor(e.touches[0].clientX, e.touches[0].clientY, 'touch');
    };
    const onTouchEnd = () => {
      send(JSON.stringify({ type: 'cursor-remove' }));
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

  const joinGame = useCallback(
    async (seatNumber: number) => {
      setSeat(seatNumber.toString());

      if (!token && walletAddress) {
        const newToken = await authenticate();
        if (!newToken) {
          console.error('Failed to authenticate');
          return;
        }
      }
    },
    [authenticate, token, walletAddress],
  );

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
    cursors: { self, others },
  };
};

export default useGame;
