'use client';

import { deckPositionAtom } from '@/atoms/deck.atom';
import { soundAtom } from '@/atoms/sound.atom';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'motion/react';
import { nanoid } from 'nanoid';
import { type FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import PlayingCard, {
  type TPlayingCardSize,
  type EPlayingCardState,
} from './PlayingCard';
import { ESoundType } from './Utils/sound';

type TDeckOfCardsProps = {
  cards: string[];
  state?: EPlayingCardState;
  size?: TPlayingCardSize;
  extraDelay?: number;
};

const DeckOfCards3: FC<TDeckOfCardsProps> = ({
  cards,
  state,
  size = 'sm',
  extraDelay = 0,
}) => {
  useEffect(() => {
    console.log('Cards length changed:', cards.length);
    console.log('Current card IDs:', cardIdsRef.current);
    console.log('Animated card IDs:', [...animatedCardIdsRef.current]);
  }, [cards.length]);

  // Create a ref to track card IDs
  const cardIdsRef = useRef<string[]>([]);

  // Track which cards have been animated
  const animatedCardIdsRef = useRef<Set<string>>(new Set());

  // Update cardIds when cards change
  useEffect(() => {
    // Extend cardIds array if we have more cards than before
    if (cards.length > cardIdsRef.current.length) {
      const newIds = Array(cards.length - cardIdsRef.current.length)
        .fill(0)
        .map(() => nanoid());
      cardIdsRef.current = [...cardIdsRef.current, ...newIds];
    }
    // Trim if we have fewer cards
    else if (cards.length < cardIdsRef.current.length) {
      cardIdsRef.current = cardIdsRef.current.slice(0, cards.length);
    }
  }, [cards.length]);

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
      {cards.map((card, i) => {
        // Make sure we have an ID for this position
        if (!cardIdsRef.current[i]) {
          cardIdsRef.current[i] = nanoid();
          console.log(
            `Generated new ID for card ${i}: ${cardIdsRef.current[i]}`,
          );
        }

        // Check if this card position has been animated before
        const cardId = cardIdsRef.current[i];
        const isNewCard = !animatedCardIdsRef.current.has(cardId);

        console.log(`Card ${i}: ID=${cardId}, isNewCard=${isNewCard}`);

        // Mark this card as animated
        if (isNewCard) {
          console.log(`Marking card ${i} (${cardId}) as animated`);
          animatedCardIdsRef.current.add(cardId);
        }

        return (
          <motion.div
            key={cardId}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            // Log animation status
            onLayoutAnimationComplete={() => {
              console.log(`Animation completed for card ${i} (${cardId})`);
            }}
            // Only use initial animation for new cards
            // initial={
            //   isNewCard
            //     ? {
            //         y: cardPositions[i]?.y ?? 100,
            //         x: cardPositions[i]?.x ?? 0,
            //       }
            //     : false
            // }
            initial={{
              x: 50,
              y: 50,
            }}
            animate={{
              y: 0,
              x: 0,
            }}
            transition={{
              delay: isNewCard ? extraDelay + i * 0.6 : 0,
              duration: isNewCard ? 0.6 : 0,
            }}
            onAnimationStart={() => {
              if (isNewCard) {
                console.log(`Starting animation for card ${i} (${cardId})`);
                playSound(ESoundType.DEAL);
              } else {
                console.log(
                  `Skipping animation for card ${i} (${cardId}) - already animated`,
                );
              }
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
        );
      })}
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

export default DeckOfCards3;

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
