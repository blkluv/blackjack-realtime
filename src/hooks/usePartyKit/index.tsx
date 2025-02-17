// import { setWsSendAtom } from '@/atoms/atom';
import { setPartyKitAtom } from "@/atoms/atom";
import { env } from "@/env.mjs";
import { useSetAtom } from "jotai";
import { usePartySocket } from "partysocket/react";
import type { TPartyKitServerMessage } from "../../../party";
import { useUser } from "../useUser";
// import { blackjackMessageHandler } from "./blackjack.handler";
// import { cursorMessageHandler } from "./cursor.handler";
// import { defaultMessageHandler } from "./default.handler";
import {
  type CursorsMap,
  removeSingleCursorAtom,
  setCursorMapAtom,
  updateSingleCursorAtom,
} from "@/atoms/cursor.atom";
import { setGameStateAtom } from "@/atoms/blackjack.atom";

export const usePartyKit = () => {
  const { user } = useUser();
  // const setWsSend = useSetAtom(setWsSendAtom);
  const setPartyKit = useSetAtom(setPartyKitAtom);

  const setCursorMap = useSetAtom(setCursorMapAtom);
  const updateSingleCursor = useSetAtom(updateSingleCursorAtom);
  const removeSingleCursor = useSetAtom(removeSingleCursorAtom);

  const setGameState = useSetAtom(setGameStateAtom);

  const partyKit = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room: "blackjack",
    query: { token: user.wsToken, walletAddress: user.walletAddress },
    onOpen: () => {
      console.log("Connected to PartyKit");
      setPartyKit(partyKit);
    },
    onMessage: (event) => {
      const message = JSON.parse(
        event.data as string
      ) as TPartyKitServerMessage;

      if (message.room === "cursor") {
        const { room, type, data } = message;
        if (room === "cursor") {
          if (type === "cursor-sync") {
            const newOthers: CursorsMap = {};
            for (const cursor of data.cursors) {
              newOthers[cursor.id] = cursor;
            }
            setCursorMap(newOthers);
          } else if (type === "cursor-update") {
            const other = {
              id: data.cursor.id,
              x: data.cursor.x,
              y: data.cursor.y,
              country: data.cursor.country,
              lastUpdate: data.cursor.lastUpdate,
              pointer: data.cursor.pointer,
            };
            updateSingleCursor(data.cursor.id, other);
          } else if (type === "cursor-remove") {
            removeSingleCursor(data.id);
          }
        } else {
          throw new Error("Invalid room");
        }
        // cursorMessageHandler(message);
      } else if (message.room === "blackjack") {
        const { room, type, data } = message;
        if (room === "blackjack") {
          if (type === "stateUpdate") {
            setGameState(data.state);
          }
        } else {
          throw new Error("Invalid room");
        }
      } else if (message.room === "default") {
        const { room, type, data } = message;
        if (room === "default") {
          if (type === "hello-world") {
            console.log("Hello World", data);
          }
        } else {
          throw new Error("Invalid room");
        }
      }
    },
    onClose: () => {},
    onError: () => {},
  });

  return {
    readyState: partyKit.readyState,
  };
};
