import { chatLogsAtom } from '@/atoms/chat.atom';
import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react'; // Import useState

// Define a color palette for usernames - Brighter colors added
const usernameColors = [
  'text-red-500',
  'text-green-500',
  'text-blue-500',
  'text-yellow-500',
  'text-purple-500',
  'text-pink-500',
  'text-orange-500',
  'text-cyan-500',
  'text-lime-500',
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
  const [showScrollButton, setShowScrollButton] = useState(false);

  const chatLogs = useAtomValue(chatLogsAtom); // Use chatLogsAtom from Jotai

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLogs]); // useEffect dependency on chatLogs to scroll on updates

  const handleScroll = () => {
    if (logContainerRef.current) {
      const container = logContainerRef.current;
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50;
      setShowScrollButton(!isAtBottom);
    }
  };

  useEffect(() => {
    const container = logContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {showScrollButton && ( // Button is now outside the scrollable div, directly inside the main div
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-2 right-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full p-2 transition-colors duration-200"
          aria-label="Scroll to bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5L12 21m0 0L4.5 13.5M12 21V10.5"
            />
          </svg>
        </button>
      )}
      <div className="flex justify-between items-center p-3 bg-zinc-900">
        <div className="text-zinc-400 text-sm font-bold">Game Logs</div>
        <div className="text-zinc-400 text-sm">Players: {2}/5</div>
      </div>
      <div
        ref={logContainerRef}
        className="flex flex-col h-full p-3 space-y-2 overflow-y-auto scrollbar-hide relative" // scrollbar-hide class added here
      >
        {chatLogs.map(
          (
            log, // Use chatLogs instead of FakeLogs
          ) => (
            <div
              key={log.id} // Make sure your ChatSchema has an 'id' or use index as key if not available and order is consistent
              className={`px-3 py-1 rounded-md w-fit transition-colors duration-100 ${
                log.isGameLog
                  ? 'text-zinc-400 text-center mx-auto w-full'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:bg-opacity-70'
              }`}
            >
              {log.isGameLog ? (
                <span className="text-sm">{log.message}</span>
              ) : (
                <>
                  <span className={`font-bold ${getUsernameColor(log.userId)}`}>
                    {' '}
                    {log.userId}:
                    {/* {log.userId.length > 6 ? `${log.userId.substring(0, 3)}...${log.userId.substring(log.userId.length - 3)}` : log.userId}:{' '} */}
                  </span>
                  <span className="text-sm">{log.message}</span>
                </>
              )}
            </div>
          ),
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default GameLog;
