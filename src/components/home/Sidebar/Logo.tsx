import { cn } from '@/lib/utils';
import { Spade } from 'lucide-react';
import type { FC } from 'react';

type TLogoProps = {
  isLoading?: boolean;
};

const Logo: FC<TLogoProps> = ({ isLoading }) => {
  return (
    <div
      className={cn(
        'flex items-center space-x-2',
        isLoading && 'animate-pulse',
      )}
    >
      <Spade size={isLoading ? 32 : 24} />
      <div
        className={cn('font-bold text-xl font-mono', isLoading && 'text-3xl')}
      >
        Deckdash
      </div>
    </div>
  );
};

export default Logo;
