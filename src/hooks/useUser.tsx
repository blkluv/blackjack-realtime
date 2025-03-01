import { client } from '@/lib/client';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useAtomValue, useSetAtom } from 'jotai';

import { setUserAtom, userAtom } from '@/atoms/user.atom';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { huddle01Testnet } from 'viem/chains';

export const useUser = () => {
  const { status, address } = useAppKitAccount();
  const { switchNetwork } = useAppKitNetwork();
  const { data: session } = useSession();
  const user = useAtomValue(userAtom);
  const updateUser = useSetAtom(setUserAtom);

  const fetchWsToken = async () => {
    if (!address) return;
    const response = await client.token.getPlayerToken.$get();
    const { token } = await response.json();

    return token;
  };

  useEffect(() => {
    switchNetwork(huddle01Testnet);
  }, []);

  const logout = async () => {
    try {
      await signOut({ redirect: false });

      updateUser({
        isAuthenticated: false,
        walletAddress: '',
        wsToken: '',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (!user.isAuthenticated && status === 'connected' && session?.address) {
      fetchWsToken()
        .then((token) => {
          updateUser({
            isAuthenticated: true,
            walletAddress: session.address.toLowerCase(),
            wsToken: token,
          });
        })
        .catch((error) => {
          console.error('Fetch WS token error:', error);
        });
    }

    if (user.isAuthenticated && status === 'disconnected') {
      logout();
    }
  }, [status, address, session]);

  return {
    user,
    logout,
    fetchWsToken,
  };
};
