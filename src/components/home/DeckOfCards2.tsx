import { nanoid } from 'nanoid';
import type { FC } from 'react';
// import { motion } from "motion/react";
import PlayingCard, { type EPlayingCardState } from './PlayingCard';

type TDeckOfCardsProps = {
  cards: string[];
  state?: EPlayingCardState;
  flipped?: boolean;
};

const DeckOfCards2: FC<TDeckOfCardsProps> = ({
  cards,
  state,
  flipped = false,
}) => {
  return (
    <div
      className="flex relative"
      style={{
        right: cards.length * 10,
      }}
    >
      {cards.map((card, i) => (
        <PlayingCard
          key={nanoid()}
          card={card}
          style={{
            position: i > 0 ? 'absolute' : 'relative',
            left: `${i * 40}px`,
            top: `${i * 12}px`,
          }}
          flipped={i === cards.length - 1 ? flipped : false}
          state={state}
        />
      ))}
    </div>
  );
};

export default DeckOfCards2;
