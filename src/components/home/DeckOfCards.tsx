import { useWindowSize } from '@/hooks/useWindowSize';
//@ts-ignore
import Card from '@heruka_urgyen/react-playing-cards';
import { motion } from 'motion/react';
import { nanoid } from 'nanoid';

const DeckOfCards = ({
  cards,
  extraDelay = 0,
}: {
  cards: string[];
  extraDelay?: number;
}) => {
  const { q } = useWindowSize();
  //   const isMounted = useMounted();
  //   if (!isMounted) return null;
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
          <motion.div
            initial={{
              y: -q,
              rotate: 720,
            }}
            animate={{
              y: 0,
              rotate: 0,
            }}
            transition={{
              delay: extraDelay + i * 0.3,
              duration: 0.3,
            }}
            // drag
            // dragConstraints={{ top: 10, left: 10, right:10, bottom: 10 }}
            className="transform cursor-grab transition-transform duration-300 group-hover:-translate-y-4 group-hover:scale-105"
          >
            <Card
              card={card}
              deckType="basic"
              height={`${q / 16}px`}
              className="cursor-pointer"
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export { DeckOfCards };
