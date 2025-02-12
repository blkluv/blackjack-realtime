import { useEffect, useState } from 'react';

type WindowSize = {
  width: number;
  height: number;
  q: number;
  q2: number;
};

export const useWindowSize = (): WindowSize => {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    q2:
      typeof window !== 'undefined'
        ? Math.sqrt((window.innerHeight ^ 2) + (window.innerWidth ^ 2))
        : 0,
    q:
      typeof window !== 'undefined'
        ? window.innerHeight + window.innerWidth
        : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
        q2: Math.sqrt((window.innerHeight ^ 2) + (window.innerWidth ^ 2)),
        q: window.innerHeight + window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};
