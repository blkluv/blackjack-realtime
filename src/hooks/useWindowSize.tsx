'use client';
import { useLayoutEffect, useState } from 'react';

type WindowSize = {
  width: number;
  height: number;
  q: number;
  q2: number;
};

export const useWindowSize = (): WindowSize => {
  const [size, setSize] = useState<WindowSize>({
    width: 0,
    height: 0,
    q: 0,
    q2: 0,
  });

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
        q: window.innerWidth + window.innerHeight,
        q2: Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2),
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};
