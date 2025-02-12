'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { nanoid } from 'nanoid';
// @ts-ignore
import Card from '@heruka_urgyen/react-playing-cards';
import { cn, getRandomCard } from '@/lib/utils';
import Image from 'next/image';
import { useWindowSize } from '../../../hooks/useWindowSize';

const BlackjackTable = () => {
  const { height, width, q, q2 } = useWindowSize();
  const numPlayers = 5;
  const curveHeight = q / 5.5;
  const radius = curveHeight + q / 10.5;
  const centerY = radius;

  return (
    <div className="bg-green-900 from-blue-500 overflow-hidden to-pink-500 min-h-screen flex flex-col space-y-8 items-center relative">
      <Background />

      <div className="text-4xl z-10 transition-colors duration-300 hover:text-red-300">
        Blackjack
      </div>

      {/* Dealer */}
      <div className="flex flex-col space-y-2">
        <DeckOfCards
          q={q}
          cards={Array.from({ length: 2 }).map(() => getRandomCard())}
        />
        <div>Dealer</div>
      </div>

      <Players />

      <Controls />
    </div>
  );
};

const Background = () => {
  const { height, width, q, q2 } = useWindowSize();

  return (
    <>
      <Image
        alt=""
        quality={100}
        src="/bg.png"
        width={1000}
        height={1000}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div
        style={{
          width: q / 2.1,
          top: -q / 4.2,
          outlineWidth: q / 20,
          outlineColor: '#18181b',
        }}
        className="absolute  rounded-full aspect-square outline"
      />
      <div
        style={{
          width: q / 2.4,
          top: -q / 4.8,
        }}
        className="absolute bg-zinc-800 rounded-full aspect-square"
      />
      <div
        style={{
          width: q / 3,
          top: -q / 6,
        }}
        className="absolute bg-zinc-900 rounded-full aspect-square"
      />
    </>
  );
};

const Controls = () => {
  return (
    <div className="flex fixed bottom-4 items-center p-4 bg-green-950 rounded-full space-x-4">
      <Button
        size="sm"
        className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-full"
      >
        Hit
      </Button>
      <Button
        size="sm"
        className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-full"
      >
        Stand
      </Button>
      <Button
        size="sm"
        className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-full"
      >
        Start Game
      </Button>
    </div>
  );
};

const Players = () => {
  const { height, width, q, q2 } = useWindowSize();
  const numPlayers = 5;
  const curveHeight = q / 5.5;
  const radius = curveHeight + q / 10.5;
  const centerY = radius;
  return (
    <div
      className="absolute w-full flex justify-center"
      style={{ height: `${radius}px`, top: `${q / 32}px` }}
    >
      {Array.from({ length: numPlayers }).map((_, i) => {
        const mid = Math.floor(numPlayers / 2);
        const angleStep = Math.PI / (numPlayers + 1);
        const angle = (i - mid) * angleStep;
        const x = radius * Math.sin(angle);
        const y = centerY - radius * Math.cos(angle);
        const rotationAngle = Math.atan2(centerY - y, x) * (180 / Math.PI) - 90;

        return (
          <div
            key={nanoid()}
            className="absolute transition-all duration-300 z-20"
            style={{
              bottom: `${y}px`,
              left: `calc(50% + ${x}px)`,
              transform: `translateX(-50%) rotate(${rotationAngle}deg)`,
            }}
          >
            <DeckOfCards
              q={q}
              cards={Array.from({ length: 3 }).map(() => getRandomCard())}
            />
            <div
              className="text-center whitespace-nowrap"
              style={{
                fontSize: `${q / 140}px`,
                transform: `rotate(${-rotationAngle}deg)`,
              }}
            >
              Player {i + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DeckOfCards = ({ cards, q }: { cards: string[]; q: number }) => {
  return (
    <div className="relative pb-4">
      {cards.map((card, i) => (
        <div
          key={nanoid()}
          className="group"
          style={{
            position: i > 0 ? 'absolute' : 'relative',
            left: `${i * (q / 256) + (i > 0 ? Math.random() * 20 : 0)}px`,
            top: `${i * 0 + (i > 0 ? Math.random() * (q / 64) : 0)}px`,
            transform: `rotate(${i > 0 ? Math.random() * (q / 64) : 0}deg)`,
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          <div className="transform transition-transform duration-300 group-hover:-translate-y-4 group-hover:scale-105">
            <Card
              card={card}
              deckType="basic"
              height={`${q / 16}px`}
              className="cursor-pointer"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlackjackTable;
