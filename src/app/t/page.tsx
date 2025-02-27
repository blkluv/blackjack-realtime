'use client';

import { deckPositionAtom } from '@/atoms/deck.atom';
// import React from 'react'

import DeckOfCards2 from '@/components/home/DeckOfCards2';
import PlayingCard from '@/components/home/PlayingCard';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useSetAtom } from 'jotai';
import { nanoid } from 'nanoid';
import { useEffect, useRef } from 'react';

const Page = () => {
  const cards = ['2c', '4d', 'Ac'];
  return (
    <div className="flex h-screen items-center justify-center space-x-24">
      <A />

      {Array.from({ length: 5 }).map((_, i) => (
        <DeckOfCards2
          cards={cards}
          key={nanoid()}
          size="md"
          extraDelay={i * 0.6 * cards.length}
        />
      ))}
    </div>
  );
};

export default Page;

const A = () => {
  const { width, height } = useWindowSize();
  const setPosition = useSetAtom(deckPositionAtom);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to update position
    const updatePosition = () => {
      if (divRef.current) {
        const rect = divRef.current.getBoundingClientRect();
        setPosition({
          x: rect.left,
          y: rect.top,
          viewportX: rect.left / window.innerWidth,
          viewportY: rect.top / window.innerHeight,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Update position initially
    updatePosition();

    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    // Clean up
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [setPosition]);

  return (
    <div className="h-screen relative">
      <div ref={divRef} className="absolute top-64 left-64">
        <PlayingCard card="**" size="md" />
      </div>
    </div>
  );
};
