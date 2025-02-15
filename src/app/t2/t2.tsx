'use client';
import { useWindowSize } from '@/hooks/useWindowSize';
import { getRandomCard } from '@/lib/utils';
// @ts-ignore
import Card from '@heruka_urgyen/react-playing-cards';
import { nanoid } from 'nanoid';

const A = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <DeckOfCards
        cards={Array.from({ length: 3 }).map(() => getRandomCard())}
      />
    </div>
  );
};

export default A;

const DeckOfCards = ({ cards }: { cards: string[] }) => {
  const { height, width, q, q2 } = useWindowSize();

  return (
    <div className="pb-4">
      <div className="h-64 w-64 bg-red-500 hover:rotate-6 duration-300 transition">
        a
      </div>
      {cards.map((card, i) => (
        <Card
          key={nanoid()}
          card={card}
          deckType="basic"
          height={`${q / 16}px`}
          className="cursor-pointer hover:-translate-y-4 hover:scale-105"
        />
      ))}
    </div>
  );
};
