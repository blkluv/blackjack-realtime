import { partyKitAtom } from '@/atoms/atom';
import { type BlackjackSend, gameStateAtom } from '@/atoms/blackjack.atom';
import { userAtom } from '@/atoms/user.atom';
import { useAtomValue } from 'jotai';

const useBlackjack = () => {
  const user = useAtomValue(userAtom);
  const partyKit = useAtomValue(partyKitAtom);
  const blackjackSend: BlackjackSend = (message) => {
    if (!partyKit) return;
    partyKit.send(JSON.stringify({ room: 'blackjack', ...message }));
  };

  const gameState = useAtomValue(gameStateAtom);

  const getPlayer = (userId: string) => {
    for (const player of Object.values(gameState.players)) {
      if (player.userId === userId) {
        return player;
      }
    }
  };

  const getSeat = (userId?: string) => {
    if (!userId) return -1;
    const player = getPlayer(userId);
    if (!player) return -1;
    return player.seat;
  };
  // returns seat number if seated else returns -1
  const mySeat = getSeat(user?.walletAddress);

  return {
    mySeat,
    blackjackSend,
    gameState,
  };
};

export { useBlackjack };
