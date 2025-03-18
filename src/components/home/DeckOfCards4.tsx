'use client';

import { deckPositionAtom } from '@/atoms/deck.atom';
import { useWindowSize } from '@/hooks/useWindowSize';
// import { soundAtom } from "@/atoms/sound.atom";
import { useAtomValue } from 'jotai';
import { motion } from 'motion/react';
// import { nanoid } from "nanoid";
import { type FC, useLayoutEffect, useRef, useState } from 'react';
import PlayingCard, {
  type TPlayingCardSize,
  type EPlayingCardState,
} from './PlayingCard';
import { ESoundType, playSound } from './Utils/sound';
// import { SoundType } from "./Utils/sound";
// import { SoundType } from "./Utils/sound";

type TDeckOfCardsProps = {
  cards: string[];
  state?: EPlayingCardState;
  size?: TPlayingCardSize;
  extraDelay?: number;
  animateCards?: Set<string>;
  animate?: boolean;
};

const DeckOfCards4: FC<TDeckOfCardsProps> = ({
  cards,
  state,
  size = 'sm',
  extraDelay = 0,
  animateCards,
  animate = true,
}) => {
  //   console.log("animateCards in DeckOfCards4: ", animateCards, "cards: ", cards);
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
  const { width } = useWindowSize();
  const isMobile = width < 1024;

  const cardSize = cardSizeMap[size];
  const deckPosition = useAtomValue(deckPositionAtom);
  // const playSound = useSetAtom(soundAtom);

  useLayoutEffect(() => {
    if (!containerRef.current || (deckPosition.x === 0 && deckPosition.y === 0))
      return;

    const containerRect = containerRef.current.getBoundingClientRect();

    const topOffset = -85;
    const leftOffset = 25;

    const newPositions = cards.map((_, index) => {
      const cardRect = cardRefs.current[index]?.getBoundingClientRect();
      if (cardRect) {
        return {
          x: deckPosition.x - cardRect.left + leftOffset,
          y: deckPosition.y - cardRect.top + topOffset,
        };
      }

      const emptyDeckCenterX = deckPosition.x + deckPosition.width / 2;
      const emptyDeckCenterY = deckPosition.y + deckPosition.height / 2;

      return {
        x:
          emptyDeckCenterX - containerRect.left - cardSize * index + leftOffset,
        y: emptyDeckCenterY - containerRect.top - cardSize * index + topOffset,
      };
    });

    setCardPositions(newPositions);
  }, [deckPosition, cardSize, cards.length]);

  return (
    <div
      className="flex relative"
      style={{
        right: (width * cards.length) / 90,
        bottom: isMobile
          ? cards.length === 2
            ? -(cards.length * width) / 100
            : cards.length === 3
              ? -(cards.length * width) / 200
              : cards.length === 4
                ? -(cards.length * width) / 300
                : cards.length > 4
                  ? 0
                  : -(cards.length * 8)
          : cards.length * cardSize * 6,
      }}
      ref={containerRef}
    >
      {cards.map((card, i) => {
        const shouldAnimate = animateCards?.has(card) && animate;

        // const shouldAnimate = true;

        const initial = {
          x: shouldAnimate && cardPositions[i] ? cardPositions[i].x : 0,
          y: shouldAnimate && cardPositions[i] ? cardPositions[i].y : 0,
          rotate: shouldAnimate ? 90 : 0,
        };
        let animationDelay = 0;
        if (shouldAnimate && animateCards) {
          const animateCardsArray = Array.from(animateCards);
          const cardIndexInAnimate = animateCardsArray.indexOf(card);
          animationDelay = extraDelay + cardIndexInAnimate * 0.6;
        }
        return (
          <motion.div
            key={`card-${i}-${card}-${shouldAnimate ? 'animate' : 'static'}`}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            initial={initial}
            animate={{ x: 0, y: 0, rotate: 0 }}
            layout
            onAnimationComplete={() => {
              if (shouldAnimate) {
                playSound(ESoundType.FLIP);
              }
            }}
            transition={{
              delay: shouldAnimate ? animationDelay : 0,
              duration: shouldAnimate ? 0.6 : 0,
            }}
            style={{
              position: i > 0 ? 'absolute' : 'relative',
              left: `${i * (width / 45)}px`,
              top: `${i * (width / 100)}px`,
            }}
          >
            <PlayingCard card={card} state={state} size={size} />
          </motion.div>
        );
      })}
      <div
        className="absolute text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-200"
        style={{
          left: `${(width * cards.length) / 36.5}px`,
          top: `${-((width * cards.length) / 440)}px`,
        }}
      >
        <div className="whitespace-nowrap">{`${value}${
          extra ? ` , ${extra}` : ''
        }`}</div>
      </div>
    </div>
  );
};

export default DeckOfCards4;

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
      value += 11; // Initially count Ace as 11
    } else if (['J', 'Q', 'K', 'T'].includes(rank)) {
      value += 10;
    } else if (rank !== '') {
      value += Number.parseInt(rank);
    }
  }

  let aceAdjustments = 0;
  // Adjust for Aces if total value is over 21
  while (value > 21 && aceCount > aceAdjustments) {
    value -= 10; // Convert an Ace from 11 to 1
    aceAdjustments++;
  }

  let extraValue: number | undefined = undefined;
  if (aceCount > aceAdjustments && value <= 21) {
    const potentialExtraValue = value - 10;
    if (potentialExtraValue <= 21) {
      extraValue = potentialExtraValue;
    }
  }

  return { value, extra: extraValue };
};
