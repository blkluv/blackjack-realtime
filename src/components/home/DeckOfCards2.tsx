'use client';

import { deckPositionAtom } from '@/atoms/deck.atom';
import { soundAtom } from '@/atoms/sound.atom';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'motion/react';
import { nanoid } from 'nanoid';
import { type FC, useLayoutEffect, useRef, useState } from 'react';
import PlayingCard, {
  type TPlayingCardSize,
  type EPlayingCardState,
} from './PlayingCard';
// import { SoundType } from "./Utils/sound";

type TDeckOfCardsProps = {
  cards: string[];
  state?: EPlayingCardState;
  size?: TPlayingCardSize;
  extraDelay?: number;
};

const DeckOfCards2: FC<TDeckOfCardsProps> = ({
  cards,
  state,
  size = 'sm',
  extraDelay = 0,
}) => {
  const { value, extra } = getDeckValue(cards);
  const cardSizeMap: { [key in TPlayingCardSize]: number } = {
    sm: 0.8,
    md: 1,
    lg: 1.2,
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cardPositions, setCardPositions] = useState<
    Array<{ x: number; y: number }>
  >(cards.map(() => ({ x: 0, y: 0 })));
  const cardSize = cardSizeMap[size];
  const deckPosition = useAtomValue(deckPositionAtom);
  const playSound = useSetAtom(soundAtom);
  // playSound(SoundType.DEAL);

  useLayoutEffect(() => {
    if (!containerRef.current || (deckPosition.x === 0 && deckPosition.y === 0))
      return;

    const containerRect = containerRef.current.getBoundingClientRect();

    const newPositions = cards.map((_, index) => {
      if (cardRefs.current[index]) {
        const cardRect = cardRefs.current[index]?.getBoundingClientRect();
        if (cardRect) {
          return {
            x: deckPosition.x - cardRect.left,
            y: deckPosition.y - cardRect.top,
          };
        }
      }

      const estimatedCardLeft = containerRect.left + index * 40 * cardSize;
      const estimatedCardTop = containerRect.top + index * 12 * cardSize;

      return {
        x: deckPosition.x - estimatedCardLeft,
        y: deckPosition.y - estimatedCardTop,
      };
    });

    setCardPositions(newPositions);
  }, [deckPosition, cardSize, cards.length]);

  return (
    <div
      className="flex relative"
      style={{
        right: cards.length * (16 * cardSize),
      }}
      ref={containerRef}
    >
      {cards.map((card, i) => (
        <motion.div
          key={`card-${i}-${nanoid()}`}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          // initial={{
          //   x: cardPositions[i]?.x ?? 0,
          //   y: cardPositions[i]?.y ?? 0,
          // }}
          // onClick={() => {
          //   playSound(SoundType.DEAL);
          // }}
          // onLayoutAnimationStart={() => {
          //   playSound(SoundType.DEAL);
          // }}
          animate={{
            y: 0,
            x: 0,
          }}
          transition={{
            delay: extraDelay + i * 0.6,
            duration: 0.6,
          }}
          style={{
            position: i > 0 ? 'absolute' : 'relative',
            left: `${i * 40 * cardSize}px`,
            top: `${i * 12 * cardSize}px`,
          }}
        >
          <PlayingCard
            card={card}
            // flipped={i === cards.length - 1 ? flipped : false}
            state={state}
            size={size}
          />
        </motion.div>
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
): {
  value: number;
  extra?: number;
} => {
  const flipped = cards[cards.length - 1] === '**';
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
