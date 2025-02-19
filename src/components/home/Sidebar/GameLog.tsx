const FakeLogs = [
  {
    id: 0,
    sender: 'GawkGawk',
    message: 'Welcome to GawkGawk',
  },
  {
    id: 1,
    sender: 'GawkGawk',
    message: '0x1234 has joined the game',
  },
  {
    id: 2,
    sender: 'GawkGawk',
    message: '0x1235 has joined the game',
  },
  {
    id: 3,
    sender: 'GawkGawk',
    message: '0x1236 has placed a bet',
  },
  {
    id: 4,
    sender: 'GawkGawk',
    message: 'Welcome to GawkGawk',
  },
  {
    id: 5,
    sender: 'GawkGawk',
    message: '0x1234 has joined the game',
  },
  {
    id: 6,
    sender: 'GawkGawk',
    message: '0x1235 has joined the game',
  },
  {
    id: 7,
    sender: 'GawkGawk',
    message: '0x1236 has placed a bet',
  },
];

const GameLog = () => {
  return (
    <div className="flex flex-col h-full divide-y divide-slate-900 overflow-hidden">
      <div className="flex justify-between items-center p-4">
        <div className="text-slate-400 text-sm">Game Logs: </div>
        <div className="text-slate-400 text-sm">Players: {2}/5</div>
      </div>
      <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
        {FakeLogs.map((log) => (
          <div
            key={log.id}
            className="bg-slate-900 px-4 text-xs font-light text-slate-300 py-2 rounded-full w-fit"
          >
            <span className="font-bold">{log.sender}:</span> {log.message}
          </div>
        ))}
        {FakeLogs.map((log) => (
          <div
            key={log.id}
            className="bg-slate-900 px-4 text-xs font-light text-slate-300 py-2 rounded-full w-fit"
          >
            <span className="font-bold">{log.sender}:</span> {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameLog;
