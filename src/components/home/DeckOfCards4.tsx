"use client";

import { deckPositionAtom } from "@/atoms/deck.atom";
import { soundAtom } from "@/atoms/sound.atom";
import { useAtomValue, useSetAtom } from "jotai";
import { motion } from "motion/react";
// import { nanoid } from "nanoid";
import type { FC } from "react";
import PlayingCard, {
  type TPlayingCardSize,
  type EPlayingCardState,
} from "./PlayingCard";
// import { SoundType } from "./Utils/sound";
// import { SoundType } from "./Utils/sound";

type TDeckOfCardsProps = {
  cards: string[];
  state?: EPlayingCardState;
  size?: TPlayingCardSize;
  extraDelay?: number;
  animateCards?: Set<string>;
};

const DeckOfCards4: FC<TDeckOfCardsProps> = ({
  cards,
  state,
  size = "sm",
  extraDelay = 0,
  animateCards,
}) => {
  //   console.log("animateCards in DeckOfCards4: ", animateCards, "cards: ", cards);
  const { value, extra } = getDeckValue(cards);
  const cardSizeMap: { [key in TPlayingCardSize]: number } = {
    sm: 0.8,
    md: 1,
    lg: 1.2,
  };

  const cardSize = cardSizeMap[size];
  const deckPosition = useAtomValue(deckPositionAtom);
  const playSound = useSetAtom(soundAtom);

  return (
    <div
      className="flex relative"
      style={{
        right: cards.length * (16 * cardSize),
      }}
    >
      {cards.map((card, i) => {
        const shouldAnimate = animateCards?.has(card);

        // const shouldAnimate = true;

        const initial = { y: shouldAnimate ? 100 : 0 };

        console.log(initial, shouldAnimate);

        return (
          <motion.div
            key={`card-${i}-${card}-${shouldAnimate ? "animate" : "static"}`}
            initial={initial}
            animate={{ y: 0 }}
            layout
            // initial={{ y: 100 }}
            // animate={{ y: 0 }}
            // transition={
            //   shouldAnimate
            //     ? { delay: extraDelay + i * 0.6, duration: 0.6 }
            //     : {}
            // }
            transition={{
              delay: shouldAnimate ? extraDelay + i * 0.6 : 0,
              duration: shouldAnimate ? 0.6 : 0,
            }}
            style={{
              position: i > 0 ? "absolute" : "relative",
              left: `${i * 40 * cardSize}px`,
              top: `${i * 12 * cardSize}px`,
            }}
          >
            <PlayingCard card={card} state={state} size={size} />
          </motion.div>
        );
      })}
      <div
        className="absolute text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-200"
        style={{
          left: `${
            cards.length * (48 * cardSize - cards.length) - (extra ? 14 : 0)
          }px`,
          top: `${size === "sm" ? 10 : size === "md" ? -16 : -20}px`,
        }}
      >
        <div className="whitespace-nowrap">{`${value}${
          extra ? ` , ${extra}` : ""
        }`}</div>
      </div>
    </div>
  );
};

export default DeckOfCards4;

const getDeckValue = (
  cards: string[]
): {
  value: number;
  extra?: number;
} => {
  const flipped = cards[cards.length - 1] === "**";
  let value = 0;
  let aceCount = 0;
  const cardsToConsider = flipped ? cards.slice(0, -1) : cards;

  for (const card of cardsToConsider) {
    const rank = card.slice(0, card.length - 1);
    if (rank === "A") {
      aceCount++;
      value += 11; // Initially count Ace as 11
    } else if (["J", "Q", "K", "T"].includes(rank)) {
      value += 10;
    } else if (rank !== "") {
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
