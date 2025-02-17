import { setGameStateAtom } from "@/atoms/blackjack.atom";
import { useSetAtom } from "jotai";
import type { TPartyKitServerMessage } from "../../../party";

export const blackjackMessageHandler = async (
  message: TPartyKitServerMessage
) => {
  const setGameState = useSetAtom(setGameStateAtom);

  const { room, type, data } = message;
  if (room === "blackjack") {
    if (type === "stateUpdate") {
      setGameState(data.state);
    }
  } else {
    throw new Error("Invalid room");
  }
};
