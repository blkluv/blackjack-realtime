// import { wsSendAtom } from '@/atoms/atom';
import { partyKitAtom } from '@/atoms/atom';
import {
  type CursorSend,
  cursorMapAtom,
  // cursorSendAtom,
} from '@/atoms/cursor.atom';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import type { Position } from '../../party/cursor/cursor.types';

const useCursor = () => {
  const [self, setSelf] = useState<Position | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const partyKit = useAtomValue(partyKitAtom);

  const cursorSend: CursorSend = (message) => {
    if (!partyKit) return;
    partyKit.send(JSON.stringify({ room: 'cursor', ...message }));
    return;
  };

  const cursorMap = useAtomValue(cursorMapAtom);

  // Track window dimensions
  useEffect(() => {
    const onResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Always track the mouse position
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dimensions.width || !dimensions.height) return;
      const position: Position = {
        x: e.clientX / dimensions.width,
        y: e.clientY / dimensions.height,
        pointer: 'mouse',
      };
      if (!cursorSend) return;
      cursorSend({
        type: 'cursor-update',
        data: {
          ...position,
        },
      });
      setSelf(position);
    };
    window.addEventListener('mousemove', onMouseMove);

    // Also listen for touch events
    const onTouchMove = (e: TouchEvent) => {
      if (!dimensions.width || !dimensions.height || !e.touches[0]) return;
      e.preventDefault();
      const position: Position = {
        x: e.touches[0].clientX / dimensions.width,
        y: e.touches[0].clientY / dimensions.height,
        pointer: 'touch',
      };
      if (!cursorSend) return;

      cursorSend({
        type: 'cursor-update',
        data: {
          ...position,
        },
      });
      setSelf(position);
    };
    window.addEventListener('touchmove', onTouchMove);

    // Catch the end of touch events
    const onTouchEnd = () => {
      if (!cursorSend) return;

      cursorSend({
        type: 'cursor-remove',
        data: {},
      });
      setSelf(null);
    };
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [cursorSend, dimensions]);

  return { self, cursorMap };
};

export { useCursor };
