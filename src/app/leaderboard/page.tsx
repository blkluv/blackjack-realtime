import Logo from '@/components/home/Sidebar/Logo';
import {
  Table,
  TableBody,
  //   TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { client } from '@/lib/client';
import { truncateAddress } from '@/lib/utils';
import Image from 'next/image';

interface LeaderboardDataItem {
  id: number;
  walletAddress: string;
  netProfit: number;
  totalWagered: number;
  rank: number;
  biggestWin: number;
  gamesPlayed: number;
}

const LeaderboardPage = async () => {
  let leaderboardData: LeaderboardDataItem[] = [];
  let loading = true;
  let error: string | null = null;

  try {
    const response = await client.leaderboard.getLeaderboardData.$get();
    const data = await response.json();
    console.log({ data });
    if (data) {
      // Check if data is an array
      if (Array.isArray(data)) {
        leaderboardData = data;
      } else if ('error' in data) {
        // Handle error case
        throw new Error(`${data.error}`);
      }
    }
    loading = false;
  } catch (e: unknown) {
    loading = false;
    //@ts-ignore
    error = e.message ?? 'Failed to fetch leaderboard data';
    console.error('Error fetching leaderboard data:', e);
  }

  if (loading) {
    return <div>Loading leaderboard...</div>;
  }

  if (error) {
    return <div>Error fetching leaderboard data: {error}</div>;
  }

  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <div className="flex relative flex-col h-screen items-center bg-zinc-950 text-zinc-200">
      <Image
        alt=""
        height={2000}
        width={2000}
        priority
        quality={100}
        className="absolute h-full w-full object-cover opacity-50"
        src={'/bg.png'}
      />
      <div className="flex justify-start items-center z-10 p-4 max-w-xl w-2xl">
        <Logo />
      </div>
      <div className="flex mt-52 items-end z-10">
        {top3[1] && (
          <div className="flex flex-col relative rounded-l-4xl items-center pt-20 bg-zinc-800 h-48 px-12">
            <div className="size-24 rounded-full bg-zinc-950 absolute -top-12 flex justify-center border-4 border-sky-500">
              <Image
                alt=""
                height={100}
                width={100}
                priority
                className="rounded-full"
                src={`/api/blockie/${top3[1]?.walletAddress}`}
              />
              <div className="size-6 text-xs rounded bg-sky-500 flex items-center justify-center rotate-45 -bottom-3 absolute">
                <div className="-rotate-45 text-white">2</div>
              </div>
            </div>
            <div className="flex items-center flex-col space-y-4">
              <div className="text-xs">
                {truncateAddress(top3[1]?.walletAddress)}
              </div>
              <div className="text-xl text-sky-500">{top3[1]?.netProfit}</div>
              <div className="text-[9px] text-zinc-400">Net Profit</div>
            </div>
          </div>
        )}
        {top3[0] && (
          <div className="flex flex-col relative rounded-t-4xl items-center pt-28 bg-zinc-900 h-64 px-12">
            <div className="size-32 rounded-full bg-zinc-950 absolute -top-16 flex justify-center border-4 border-yellow-500">
              <Image
                alt=""
                height={100}
                width={100}
                priority
                className="rounded-full w-full h-full object-cover"
                src={`/api/blockie/${top3[0]?.walletAddress}`}
              />
              <div className="size-6 text-xs rounded bg-yellow-500 flex items-center justify-center rotate-45 -bottom-3 absolute">
                <div className="-rotate-45 text-white">1</div>
              </div>
              <Image
                src={'/crown.svg'}
                alt=""
                height={200}
                width={200}
                priority
                className="absolute -top-28"
              />
            </div>
            <div className="flex items-center flex-col space-y-4">
              <div className="text-xs">
                {truncateAddress(top3[0]?.walletAddress)}
              </div>
              <div className="text-xl text-yellow-500">
                {top3[0]?.netProfit}
              </div>
              <div className="text-[9px] text-zinc-400">Net Profit</div>
            </div>
          </div>
        )}
        {top3[2] && (
          <div className="flex flex-col relative rounded-r-4xl items-center pt-20 bg-zinc-800 h-48 px-12">
            <div className="size-24 rounded-full bg-zinc-950 absolute -top-12 flex justify-center border-4 border-green-500">
              <Image
                alt=""
                height={100}
                width={100}
                priority
                className="rounded-full w-full h-full object-cover"
                src={`/api/blockie/${top3[2]?.walletAddress}`}
              />
              <div className="size-6 text-xs rounded bg-green-500 flex items-center justify-center rotate-45 -bottom-3 absolute">
                <div className="-rotate-45 text-white">3</div>
              </div>
            </div>
            <div className="flex items-center flex-col space-y-4">
              <div className="text-xs">
                {truncateAddress(top3[2]?.walletAddress)}
              </div>
              <div className="text-xl text-green-500">{top3[2]?.netProfit}</div>
              <div className="text-[9px] text-zinc-400">Net Profit</div>
            </div>
          </div>
        )}
      </div>
      <div className="flex space-x-8 items-center py-8">
        <div className="w-32 h-px bg-zinc-700" />
        <div className="text-xs text-zinc-400 whitespace-nowrap">
          Leaderboard of the month
        </div>
        <div className="w-32 h-px bg-zinc-700" />
      </div>
      <LeaderboardTable data={rest} />
    </div>
  );
};

export default LeaderboardPage;

const LeaderboardTable = ({ data }: { data: LeaderboardDataItem[] }) => {
  const totalNetProfit = data.reduce((acc, row) => acc + row.netProfit, 0);

  return (
    <div className="text-xs bg-zinc-800 border border-zinc-800 rounded-xl ">
      <Table className="text-[10px] font-[400]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead className="text-center">Player</TableHead>
            <TableHead>Total Wagered</TableHead>
            <TableHead>Biggest Win</TableHead>
            <TableHead>Games Played</TableHead>
            <TableHead className="text-right">Net Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">#{row.rank}</TableCell>
              <TableCell> {truncateAddress(row.walletAddress)}</TableCell>
              <TableCell className="text-center">{row.totalWagered}</TableCell>
              <TableCell className="text-center">{row.biggestWin}</TableCell>
              <TableCell className="text-center">{row.gamesPlayed}</TableCell>
              <TableCell className="text-right">{row.netProfit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>Total Net Profit</TableCell>
            <TableCell className="text-right">{totalNetProfit}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
