import {
  type CursorsMap,
  removeSingleCursorAtom,
  setCursorMapAtom,
  updateSingleCursorAtom,
} from '@/atoms/cursor.atom';
import { useSetAtom } from 'jotai';
import type { TPartyKitServerMessage } from '../../../party';

export const cursorMessageHandler = async (message: TPartyKitServerMessage) => {
  const setCursorMap = useSetAtom(setCursorMapAtom);
  const updateSingleCursor = useSetAtom(updateSingleCursorAtom);
  const removeSingleCursor = useSetAtom(removeSingleCursorAtom);

  const { room, type, data } = message;

  if (room === 'cursor') {
    if (type === 'cursor-sync') {
      const newOthers: CursorsMap = {};
      for (const cursor of data.cursors) {
        newOthers[cursor.id] = cursor;
      }
      setCursorMap(newOthers);
    } else if (type === 'cursor-update') {
      const other = {
        id: data.cursor.id,
        x: data.cursor.x,
        y: data.cursor.y,
        country: data.cursor.country,
        lastUpdate: data.cursor.lastUpdate,
        pointer: data.cursor.pointer,
      };
      updateSingleCursor(data.cursor.id, other);
    } else if (type === 'cursor-remove') {
      removeSingleCursor(data.id);
    }
  } else {
    throw new Error('Invalid room');
  }
};
