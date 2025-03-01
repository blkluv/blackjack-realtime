import { atom } from 'jotai';

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

export { type User, userAtom, setUserAtom };
