import { atom, useAtom, useSetAtom } from 'jotai';

type User = {
  walletAddress?: string;

  token?: string;

  isAuthenticated: boolean;
};

const userAtom = atom<User>({
  walletAddress: '',
  token: '',
  isAuthenticated: false,
});

const setUserAtom = atom(null, (get, set, user: User) => {
  get(userAtom);
  set(userAtom, user);
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
  const [user, setUser] = useAtom(userAtom);
  const updateAuthStatus = useSetAtom(setIsAuthenticatedAtom);
  const updateWalletAddress = useSetAtom(setWalletAddressAtom);

  return {
    user,
    setUser,
    updateAuthStatus,
    updateWalletAddress,
  };
};
