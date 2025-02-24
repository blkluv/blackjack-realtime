import { nanoid } from 'nanoid';
import type { FC } from 'react';
// import { motion } from "motion/react";
import PlayingCard, {
  type TPlayingCardSize,
  type EPlayingCardState,
} from './PlayingCard';

type TDeckOfCardsProps = {
  cards: string[];
  state?: EPlayingCardState;
  flipped?: boolean;
  size?: TPlayingCardSize;
};

const DeckOfCards2: FC<TDeckOfCardsProps> = ({
  cards,
  state,
  flipped = false,
  size = 'sm',
}) => {
  const { value, extra } = getDeckValue(cards, flipped);
  const cardSizeMap: { [key in TPlayingCardSize]: number } = {
    sm: 0.8,
    md: 1,
    lg: 1.2,
  };
  const cardSize = cardSizeMap[size];
  return (
    <div
      className="flex relative"
      style={{
        right: cards.length * (16 * cardSize),
      }}
    >
      {cards.map((card, i) => (
        <PlayingCard
          key={nanoid()}
          card={card}
          style={{
            position: i > 0 ? 'absolute' : 'relative',
            left: `${i * 40 * cardSize}px`,
            top: `${i * 12 * cardSize}px`,
          }}
          flipped={i === cards.length - 1 ? flipped : false}
          state={state}
          size={size}
        />
      ))}
      <div
        className="absolute text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-200"
        style={{
          left: `${
            cards.length * (48 * cardSize - cards.length) - (extra ? 14 : 0)
          }px`,
          top: `${size === 'sm' ? 10 : size === 'md' ? -16 : -20}px`,
        }}
      >
        <div className="whitespace-nowrap">{`${value}${
          extra ? ` , ${extra}` : ''
        }`}</div>
      </div>
    </div>
  );
};

export default DeckOfCards2;

const getDeckValue = (
  cards: string[],
  flipped: boolean,
): {
  value: number;
  extra?: number;
} => {
  let value = 0;
  let aceCount = 0;
  const cardsToConsider = flipped ? cards.slice(0, -1) : cards;

  for (const card of cardsToConsider) {
    const rank = card.slice(0, card.length - 1);
    if (rank === 'A') {
      aceCount++;
    } else if (['J', 'Q', 'K', 'T'].includes(rank)) {
      value += 10;
    } else {
      value += Number.parseInt(rank);
    }
  }

  let extra = 0;
  if (aceCount > 0) {
    const minValue = value + aceCount;
    const maxValue = value + aceCount * 11;
    if (maxValue <= 21) {
      value = maxValue;
    } else {
      value = minValue;
      extra = maxValue - 21;
    }
  }

  return { value, extra };
};
