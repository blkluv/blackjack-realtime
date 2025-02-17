import type { Cursor } from '@/atoms/cursor.atom';
import { useCursor } from '@/hooks/useCursor';
import { useWindowSize } from '@/hooks/useWindowSize';
import { MousePointer2 } from 'lucide-react';
import { motion } from 'motion/react';

const CursorSpace = () => {
  const { cursorMap } = useCursor();
  const { height, width } = useWindowSize();
  console.log(cursorMap);

  const lastValue: Cursor = {
    country: 'IN',
    id: '0',
    lastUpdate: 1739794803807,
    pointer: 'mouse',
    x: 0.7019027484143763,
    y: 0.8498452012383901,
  };

  return (
    <div className="w-full h-full">
      <motion.div
        animate={{
          x: lastValue.x * width,
          y: lastValue.y * height - (48 * 4 - 24),
        }}
        className="text-black h-8 w-fit rounded-full relative"
      >
        <MousePointer2 className="absolute top-0 left-0 text-white" />
        <div className="pt-3 pl-5">
          {getFlagFromCountryCode(lastValue.country)}
        </div>
      </motion.div>
    </div>
  );
};

const getFlagFromCountryCode = (countryCode: string | null): string => {
  if (!countryCode) return '';

  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join('');
};

export { CursorSpace };
