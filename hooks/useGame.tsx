import { useAppKitAccount } from '@reown/appkit-core/react';
import { useAppKit } from '@reown/appkit/react';
import React, { useState } from 'react';
import { useSignMessage } from 'wagmi';
import usePartySocket from 'partysocket/react';
import { env } from '@/env.mjs';

const useGame = () => {
  const [seat, setSeat] = useState('');
  const [isMicOn, setIsMicOn] = useState(false);
  const [token, setToken] = useState('');
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
    onMessage: (msg) => {
      console.log('message received', msg);
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
      // get an auth token using your authentication client library
      //   walletAddress: address?.toLowerCase(),
      seat,
      token,
      walletAddress,
    },
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    readyState === WebSocket.OPEN,
  );

  const joinGame = (seat: number) => {
    setSeat(seat.toString());
    signMessageAsync({ message: env.NEXT_PUBLIC_SIGN_MSG });
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
  };
};

export default useGame;
