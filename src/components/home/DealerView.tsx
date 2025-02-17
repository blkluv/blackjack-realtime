import { useWindowSize } from '@/hooks/useWindowSize';
import { getRandomCard } from '@/lib/utils';
import { DeckOfCards } from './DeckOfCards';

const DealerView = () => {
  const { q } = useWindowSize();
  return (
    <div
      className="flex flex-col space-y-2 z-10 relative"
      style={{
        top: `${q / 16}px`,
      }}
    >
      <div>Dealer</div>
      <DeckOfCards
        cards={Array.from({ length: 2 }).map(() => getRandomCard())}
      />
    </div>
  );
};

export { DealerView };
