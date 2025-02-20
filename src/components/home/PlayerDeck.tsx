import { truncateAddress } from '@/lib/utils';
import DeckOfCards2 from './DeckOfCards2';
import { EPlayingCardState } from './PlayingCard';

const PlayerDeck = () => {
  const cards = ['Tc', '**'];
  const walletAddress = '0x1234567890abcdef';
  const bet = 100;
  return (
    <div className="w-full flex justify-center items-center">
      <div className="flex flex-col items-center relative">
        <DeckOfCards2 cards={cards} flipped state={EPlayingCardState.focus} />
        <div
          className="flex space-x-2 absolute bottom-0"
          style={{
            bottom: `${-14 * cards.length - 12}px`,
            left: `${-14 * cards.length - 12}px`,
          }}
        >
          <div className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-200">
            <div className="whitespace-nowrap">
              {truncateAddress(walletAddress)}
            </div>
          </div>
          <div className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-200">
            <div className="whitespace-nowrap">Bet: {bet}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDeck;
