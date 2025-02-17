import { atom } from 'jotai';
import type {
  Cursor,
  TCursorMessageSchema,
} from '../../party/cursor/cursor.types';

type CursorsMap = Record<string, Cursor>;

const cursorMapAtom = atom<CursorsMap>({});

const setCursorMapAtom = atom(null, (get, set, cursorMap: CursorsMap) => {
  get(cursorMapAtom);
  set(cursorMapAtom, cursorMap);
});

//set/update single entry in map
const updateSingleCursorAtom = atom(
  null,
  (get, set, id: string, cursor: Cursor) => {
    const cursorMap = get(cursorMapAtom);
    set(cursorMapAtom, { ...cursorMap, [id]: cursor });
  },
);

//remove single entry from map
const removeSingleCursorAtom = atom(null, (get, set, id: string) => {
  const cursorMap = get(cursorMapAtom);
  delete cursorMap[id];
  set(cursorMapAtom, cursorMap);
});

type CursorSend = (message: TCursorMessageSchema) => void;

const cursorSendAtom = atom<{ cursorSend: CursorSend | null }>({
  cursorSend: null,
});

const setCursorSendAtom = atom(null, (_get, set, newSend: CursorSend) => {
  set(cursorSendAtom, { cursorSend: newSend });
});

export {
  type CursorSend,
  type Cursor,
  type CursorsMap,
  cursorMapAtom,
  setCursorMapAtom,
  updateSingleCursorAtom,
  removeSingleCursorAtom,
  cursorSendAtom,
  setCursorSendAtom,
};
