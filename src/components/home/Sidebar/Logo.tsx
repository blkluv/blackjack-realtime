import { cn } from '@/lib/utils';
import { Spade } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

type TLogoProps = {
  isLoading?: boolean;
};

const Logo: FC<TLogoProps> = ({ isLoading }) => {
  return (
    <Link href="/">
      <div
        className={cn(
          'flex items-center space-x-2 cursor-pointer',
          isLoading && 'animate-pulse',
        )}
      >
        <Spade size={isLoading ? 32 : 24} />
        <div
          className={cn('font-bold text-xl font-mono', isLoading && 'text-3xl')}
        >
          BLKJACK
        </div>
      </div>
    </Link>
  );
};

export default Logo;
