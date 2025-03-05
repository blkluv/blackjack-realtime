import { atom } from 'jotai';

type User = {
  walletAddress?: `0x${string}`;
  wsToken?: string;
  isAuthenticated: boolean;
};

const userAtom = atom<User>({
  walletAddress: undefined,
  wsToken: undefined,
  isAuthenticated: false,
});

const setUserAtom = atom(null, (get, set, user: User) => {
  set(userAtom, user);
});

export { type User, userAtom, setUserAtom };
