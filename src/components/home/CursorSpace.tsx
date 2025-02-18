import type { Cursor } from "@/atoms/cursor.atom";
import { useCursor } from "@/hooks/useCursor";
import { useWindowSize } from "@/hooks/useWindowSize";
import { MousePointer2 } from "lucide-react";
import { motion } from "motion/react";

const CursorSpace = () => {
  const cursor = useCursor();
  const { height, width } = useWindowSize();
  if (!cursor) return null;

  return (
    <div className="w-full h-full">
      {cursor.cursorMap &&
        Object.entries(cursor.cursorMap).map(
          (
            [id, cursor] // Use Object.entries here
          ) => (
            <motion.div
              key={id}
              animate={{
                x: (cursor as Cursor).x * width, // Type assertion if needed
                y: (cursor as Cursor).y * height - (48 * 4 - 24),
              }}
              className="text-black h-8 w-fit rounded-full absolute pointer-events-none"
            >
              <MousePointer2 className="absolute top-0 left-0 text-white" />
              <div className="pt-3 pl-5 pr-2 text-sm flex items-center">
                {getFlagFromCountryCode((cursor as Cursor).country)}{" "}
                {/* <span className="ml-1">{id}</span> */}
              </div>
            </motion.div>
          )
        )}
    </div>
  );
};

const getFlagFromCountryCode = (countryCode: string | null): string => {
  if (!countryCode) return "";

  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join("");
};

export { CursorSpace };
