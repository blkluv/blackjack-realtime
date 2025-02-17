import { client } from '@/lib/client';
import { useAppKitAccount } from '@reown/appkit/react';
import { atom, useAtomValue, useSetAtom } from 'jotai';

import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

type User = {
  walletAddress?: string;
  wsToken?: string;
  isAuthenticated: boolean;
};

const userAtom = atom<User>({
  walletAddress: '',
  wsToken: '',
  isAuthenticated: false,
});

const setUserAtom = atom(null, (get, set, user: User) => {
  set(userAtom, user);
});

// set/update single entry in map
export const useUser = () => {
  const { status, address } = useAppKitAccount();
  const { data: session } = useSession();
  const user = useAtomValue(userAtom);

  const updateUser = useSetAtom(setUserAtom);

  const fetchWsToken = async () => {
    if (!address) return;
    const response = await client.token.getPlayerToken.$get({
      walletAddress: address,
    });
    const { token } = await response.json();

    return token;
  };

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
            walletAddress: session.address,
            wsToken: token,
          });
        })
        .catch((error) => {
          console.error('Fetch WS token error:', error);
        });
    }

    if (user.isAuthenticated && status === 'disconnected') {
      updateUser({
        isAuthenticated: false,
        walletAddress: '',
        wsToken: '',
      });
    }
  }, [status, address, session]);

  return {
    user,
    logout,
    fetchWsToken,
  };
};
