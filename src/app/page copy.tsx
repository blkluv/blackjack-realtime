'use client';

import PlayerDeck from '@/components/home/PlayerDeck';
import PlayingCard, {
  type TPlayingCardSize,
} from '@/components/home/PlayingCard';
import Sidebar from '@/components/home/Sidebar/Sidebar';
import { useWindowSize } from '@/hooks/useWindowSize';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';

const Home = () => {
  const length = 5;
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width } = useWindowSize();

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({
          width: offsetWidth,
          height: offsetHeight,
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950">
      <div className="w-full h-full p-8">
        <div
          ref={containerRef}
          className="w-full h-full bg-zinc-950 flex items-center justify-center rounded-full border border-zinc-800 relative"
        >
          <Dealer />
          {Array.from({ length: 5 }).map((text, index) => {
            const size = width < 1280 ? 64 : 96;
            const startAngle = dimensions.width > dimensions.height ? -7 : 0;
            const angle =
              index * (360 / length) -
              (dimensions.width > dimensions.height ? 120 : 90) +
              startAngle;
            // index * (360 / texts.length) -
            //   (dimensions.width > dimensions.height ? -225 : 90);
            const angleRad = (angle * Math.PI) / 180;

            const radiusX = dimensions.width / 2 - size; // size
            const radiusY = dimensions.height / 2 - size;

            const x = dimensions.width / 2 + radiusX * Math.cos(angleRad);
            const y = dimensions.height / 2 + radiusY * Math.sin(angleRad);

            const tangentAngle =
              Math.atan2(
                radiusX * Math.sin(angleRad),
                radiusY * Math.cos(angleRad),
              ) *
              (180 / Math.PI);

            return (
              <div
                key={nanoid()}
                className="absolute size-16 flex items-center justify-center"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) rotate(${tangentAngle}deg)`,
                }}
              >
                <span
                  className="size-full flex items-center justify-center text-white"
                  style={{
                    transform: `rotate(${-tangentAngle}deg)`,
                  }}
                >
                  <PlayerDeck
                    cards={['Tc', 'Tc']}
                    bet={1}
                    walletAddress="asd"
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Sidebar />
    </div>
  );
};

export default Home;

const EmtpyDeck = () => {
  const { width } = useWindowSize();
  const size: TPlayingCardSize = width < 1280 ? 'sm' : 'md';
  return (
    <div className="flex rotate-90 flex-col">
      <PlayingCard card="**" />
      <PlayingCard
        card="**"
        size={size}
        className="absolute bottom-4 left-4 hidden xl:block"
      />
    </div>
  );
};

const Dealer = () => {
  return (
    <div className="relative top-[2dvh] xl:top-[-8dvh] flex flex-col">
      <EmtpyDeck />
      <div className="relative left-1 xl:left-5 bottom-[4dvh] xl:top-[7dvh]">
        <PlayerDeck cards={['Tc', 'Tc']} bet={1} walletAddress="asd" />
      </div>
    </div>
  );
};
