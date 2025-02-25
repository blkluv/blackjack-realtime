import { chatLogsAtom } from '@/atoms/chat.atom';
import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';

// Define a color palette for usernames - Brighter colors added
const usernameColors = [
  'text-blue-500',
  'text-yellow-500',
  'text-purple-500',
  'text-pink-500',
  'text-lime-500',
  'text-red-500',
  'text-orange-500',
  'text-cyan-500',
  'text-green-500',
  'text-rose-500',
  'text-teal-500',
  'text-amber-500',
];

const getUsernameColor = (userId: string): string => {
  let hash = 7;
  for (let i = 0; i < userId.length; i++) {
    hash = hash * 31 + userId.charCodeAt(i);
  }
  const index = Math.abs(hash % usernameColors.length);
  const result = usernameColors[index] ?? 'text-gray-400';
  return result;
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
            className={`px-3 py-1 rounded-md w-fit transition-colors duration-100 ${log.isGameLog
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
