import { blackjackSendAtom } from '@/atoms/blackjack.atom';
import { useAtomValue } from 'jotai';

const useBlackjack = () => {
  const { blackjackSend } = useAtomValue(blackjackSendAtom);
  if (!blackjackSend) return;
};

export { useBlackjack };
