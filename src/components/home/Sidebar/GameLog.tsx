import { chatLogsAtom } from '@/atoms/chat.atom';
import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';

// Define a more vibrant and diverse color palette for usernames
const usernameColors = [
  'text-blue-400', // Brighter blues
  'text-yellow-400', // Brighter yellows
  'text-purple-400', // Brighter purples
  'text-pink-400', // Brighter pinks
  'text-lime-400', // Brighter limes
  'text-red-400', // Brighter reds
  'text-orange-400', // Brighter oranges
  'text-cyan-400', // Brighter cyans
  'text-green-400', // Brighter greens
  'text-rose-400', // Brighter roses
  'text-teal-400', // Brighter teals
  'text-amber-400', // Brighter ambers
  'text-indigo-400', // Indigo
  'text-violet-400', // Violet
];

const getUsernameColor = (userId: string): string => {
  // Remove '0x' prefix if present and handle potential errors gracefully
  const normalizedUserId = userId.startsWith('0x')
    ? userId.substring(2)
    : userId;
  let hash = 0;

  for (let i = 0; i < normalizedUserId.length; i += 2) {
    const chunk = normalizedUserId.substring(i, i + 2);
    if (chunk.length === 2) {
      const decimalValue = Number.parseInt(chunk, 16); // Parse hexadecimal chunk
      if (!Number.isNaN(decimalValue)) {
        hash = (hash + decimalValue) % usernameColors.length; // Sum and modulo
      }
    }
  }

  const index = Math.abs(hash % usernameColors.length);
  return usernameColors[index] ?? 'text-gray-400'; // Fallback to default color
};

const GameLog = () => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const chatLogs = useAtomValue(chatLogsAtom);
  const scrollToBottom = () => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    requestAnimationFrame(scrollToBottom);
  }, [chatLogs]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center p-3 bg-zinc-900">
        <div className="text-zinc-400 text-sm font-bold">Game Logs</div>
        <div className="text-zinc-400 text-sm">Players: {2}/5</div>{' '}
        {/* Example player count */}
      </div>
      <div
        ref={logContainerRef}
        className="flex flex-col h-full p-3 space-y-2 overflow-y-auto scrollbar-hide"
      >
        {chatLogs.map((log) => (
          <div
            key={log.id} // Assuming 'id' is unique in your ChatSchema
            className={`px-3 py-1 rounded-md w-fit transition-colors duration-100 ${
              log.isGameLog
                ? 'text-zinc-400 text-center mx-auto w-full bg-zinc-800 bg-opacity-50' // Slightly different styling for game logs
                : 'text-zinc-300 hover:bg-zinc-900 hover:bg-opacity-70'
            }`}
          >
            {log.isGameLog ? (
              <span className="text-sm">{log.message}</span>
            ) : (
              <>
                <span className={`font-bold ${getUsernameColor(log.userId)}`}>
                  {log.userId.length > 6
                    ? `${log.userId.substring(0, 3)}...${log.userId.substring(log.userId.length - 3)}`
                    : log.userId}
                  :
                </span>
                <span className="text-sm ml-1">{log.message}</span>{' '}
                {/* Added ml-1 for spacing */}
              </>
            )}
          </div>
        ))}
        <div ref={logEndRef} /> {/*  Anchor ref for scrolling to bottom */}
      </div>
    </div>
  );
};

export default GameLog;
