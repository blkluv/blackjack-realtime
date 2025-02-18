import { useWindowSize } from '@/hooks/useWindowSize';
import { DesktopLayout } from './Desktop';
import { MobileLayout } from './Mobile';

const MOBILE_BREAKPOINT = 768;

const PlayerLayout = () => {
  const { width } = useWindowSize();
  const isMobile = width < MOBILE_BREAKPOINT;

  if (isMobile) {
    return <MobileLayout />;
  }

  return <DesktopLayout />;
};

export { PlayerLayout };
