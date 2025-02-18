import { cn } from '@/lib/utils'; // Assuming you have a utils file with cn for class merging
// components/Card.tsx
import type React from 'react';

interface CardProps {
  card: string; // e.g., "Ac", "Th", "2c"
  deckType: 'basic'; // For now, only 'basic' is supported
  height: string; // e.g., "200px", "10rem"
  className?: string;
}

const rankMap: { [key: string]: string } = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  T: '10',
  J: 'J',
  Q: 'Q',
  K: 'K',
  A: 'A',
};

const suitMap: { [key: string]: string } = {
  c: '♣', // Clubs
  d: '♦', // Diamonds
  h: '♥', // Hearts
  s: '♠', // Spades
};

const suitColors: { [key: string]: string } = {
  c: 'text-black',
  d: 'text-red-500',
  h: 'text-red-500',
  s: 'text-black',
};

const Card: React.FC<CardProps> = ({ card, deckType, height, className }) => {
  if (!card) {
    return (
      <div className="w-16 h-24 border-2 border-gray-300 rounded-md bg-white" />
    ); // Placeholder for no card
  }

  const rank = card.slice(0, card.length - 1);
  const suit = card.slice(-1);

  const displayRank = rankMap[rank];
  const displaySuit = suitMap[suit];
  const colorClass = suitColors[suit] || 'text-black'; // Default to black if suit is unknown

  const cardHeight = Number.parseFloat(height);

  return (
    <div
      className={cn(
        'relative rounded-md bg-white outline outline-zinc-900 shadow-md flex flex-col items-center justify-between p-2',
        'hover:scale-105 transition-transform duration-150 ease-in-out', // Hover effect
        className,
      )}
      style={
        {
          height: height,
          width: `calc(${cardHeight}px * 0.7)`,
          '--card-text-size': `${cardHeight * 0.1}px`,
          '--card-icon-size': `${cardHeight * 0.3}px`,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute top-2 left-2 font-bold"
        style={{ fontSize: 'var(--card-text-size)' }}
      >
        <span className={colorClass}>{displayRank}</span>
      </div>
      <div
        className={`absolute ${colorClass}`}
        style={{
          fontSize: 'var(--card-icon-size)',
          top: `calc(${cardHeight}px * 0.45)`,
          transform: 'translateY(-50%)',
        }}
      >
        {displaySuit}
      </div>
      <div
        className="absolute bottom-2 right-2 font-bold rotate-180"
        style={{ fontSize: 'var(--card-text-size)' }}
      >
        <span className={colorClass}>{displayRank}</span>
      </div>
    </div>
  );
};

export default Card;
