'use client';

import { useBlackjack } from '@/hooks/useBlackjack';
import { useWindowSize } from '@/hooks/useWindowSize';
import { DeckOfCards } from './DeckOfCards';

const DealerView = () => {
  const { q } = useWindowSize();
  const { gameState } = useBlackjack();
  const hand = gameState.dealerHand;

  return (
    <div
      className="flex flex-col space-y-2 z-10 relative"
      style={{
        top: `${q / 16}px`,
      }}
    >
      <div>Dealer</div>
      <DeckOfCards cards={hand} />
    </div>
  );
};

export { DealerView };
