import { useAppKitAccount } from '@reown/appkit/react';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useSession } from 'next-auth/react';
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

const setIsAuthenticatedAtom = atom(
  null,
  (get, set, isAuthenticated: boolean) => {
    const user = get(userAtom);
    set(userAtom, { ...user, isAuthenticated });
  },
);

const setWalletAddressAtom = atom(null, (get, set, walletAddress: string) => {
  const user = get(userAtom);
  set(userAtom, { ...user, walletAddress });
});

// set/update single entry in map
export const useUser = () => {
  const { status, address } = useAppKitAccount();
  const { data: session } = useSession();
  const [user, setUser] = useAtom(userAtom);
  const updateAuthStatus = useSetAtom(setIsAuthenticatedAtom);
  const updateWalletAddress = useSetAtom(setWalletAddressAtom);

  useEffect(() => {
    if (status === 'connected' && address && session?.address) {
      updateAuthStatus(true);
      updateWalletAddress(session.address);
    } else {
      updateAuthStatus(false);
      updateWalletAddress('');
    }
  }, [status, address, session]);

  return {
    user,
    setUser,
    updateAuthStatus,
    updateWalletAddress,
  };
};
