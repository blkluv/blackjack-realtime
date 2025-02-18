import { partyKitAtom } from '@/atoms/atom';
import { type CursorSend, cursorMapAtom } from '@/atoms/cursor.atom';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import type { Position } from '../../party/cursor/cursor.types';
import { useWindowSize } from './useWindowSize';

const useCursor = () => {
  const [self, setSelf] = useState<Position | null>(null);
  const { width, height } = useWindowSize();
  const partyKit = useAtomValue(partyKitAtom);
  const cursorMap = useAtomValue(cursorMapAtom);

  const cursorSend: CursorSend = (message) => {
    if (!partyKit) return;
    partyKit.send(JSON.stringify({ room: 'cursor', ...message }));
  };

  useEffect(() => {
    if (width < 768) {
      setSelf(null);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      const position: Position = {
        x: e.clientX / width,
        y: e.clientY / height,
        pointer: 'mouse',
      };
      cursorSend?.({
        type: 'cursor-update',
        data: position,
      });
      setSelf(position);
    };
    window.addEventListener('mousemove', onMouseMove);

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      e.preventDefault();
      const position: Position = {
        x: e.touches[0].clientX / width,
        y: e.touches[0].clientY / height,
        pointer: 'touch',
      };
      cursorSend?.({
        type: 'cursor-update',
        data: position,
      });
      setSelf(position);
    };
    window.addEventListener('touchmove', onTouchMove);

    const onTouchEnd = () => {
      cursorSend?.({
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
  }, [cursorSend, height, width]);

  if (width < 768) return null;

  return { self, cursorMap };
};

export { useCursor };
