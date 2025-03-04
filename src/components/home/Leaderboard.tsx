import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { ChartNoAxesColumn } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LeaderboardDataItem {
  id: number;
  walletAddress: string;
  netProfit: number;
  totalWagered: number;
  rank: number;
  biggestWin: number;
  gamesPlayed: number;
}

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardDataItem[]>(
    [],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.leaderboard.getLeaderboardData.$get();
        const data = await response.json();
        console.log({ data });
        if (data) {
          if (Array.isArray(data)) {
            setLeaderboardData(data);
          } else if ('error' in data) {
            throw new Error(`${data.error}`);
          }
        }
      } catch (e: unknown) {
        console.error('Error fetching leaderboard data:', e);
      }
    };

    fetchData();
  }, []);

  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <ChartNoAxesColumn size={24} />
        </div>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/10 p-8 h-[54.5rem] backdrop-blur-3xl text-zinc-100 border-zinc-900 flex flex-col">
        <DialogHeader className="h-0 hidden">
          <DialogTitle> </DialogTitle>
          <DialogDescription> </DialogDescription>
        </DialogHeader>
        <div className="flex relative flex-col h-screen items-center text-zinc-200">
          {/* <Image
            alt=""
            height={2000}
            width={2000}
            priority
            quality={100}
            className="absolute h-full w-full object-cover opacity-50"
            src={"/bg.png"}
          /> */}

          <div className="flex mt-28 items-end z-10">
            {top3[1] && (
              <div className="flex flex-col relative rounded-l-4xl items-center pt-14 bg-zinc-800 h-36 px-12">
                <div className="size-16 rounded-full bg-zinc-950 absolute -top-8 flex justify-center border-4 border-sky-500">
                  <Image
                    alt=""
                    height={100}
                    width={100}
                    priority
                    className="rounded-full"
                    src={'/rank/second.png'}
                  />
                  <div className="size-6 text-xs rounded bg-sky-500 flex items-center justify-center rotate-45 -bottom-3 absolute">
                    <div className="-rotate-45 text-white">2</div>
                  </div>
                </div>
                <div className="flex items-center flex-col space-y-2">
                  <div className="text-xs">
                    {truncateAddress(top3[1]?.walletAddress)}
                  </div>
                  <div className="text-xl text-sky-500">
                    {top3[1]?.netProfit}
                  </div>
                  <div className="text-[9px] text-zinc-400">Net Profit</div>
                </div>
              </div>
            )}
            {top3[0] && (
              <div className="flex flex-col relative rounded-t-4xl items-center pt-28 bg-zinc-900 h-48 px-12">
                <div className="size-24 rounded-full bg-zinc-950 absolute -top-12 flex justify-center border-4 border-yellow-500">
                  <Image
                    alt=""
                    height={100}
                    width={100}
                    priority
                    className="rounded-full w-full h-full object-cover"
                    src={'/rank/first.png'}
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
                    className="absolute -top-20"
                  />
                </div>
                <div className="flex items-center flex-col space-y-4 -mt-8">
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
              <div className="flex flex-col relative rounded-r-4xl items-center pt-14 bg-zinc-800 h-36 px-12">
                <div className="size-16 rounded-full bg-zinc-950 absolute -top-8 flex justify-center border-4 border-green-500">
                  <Image
                    alt=""
                    height={100}
                    width={100}
                    priority
                    className="rounded-full w-full h-full object-cover"
                    src={'/rank/third.png'}
                  />
                  <div className="size-6 text-xs rounded bg-green-500 flex items-center justify-center rotate-45 -bottom-3 absolute">
                    <div className="-rotate-45 text-white">3</div>
                  </div>
                </div>
                <div className="flex items-center flex-col space-y-2">
                  <div className="text-xs">
                    {truncateAddress(top3[2]?.walletAddress)}
                  </div>
                  <div className="text-xl text-green-500">
                    {top3[2]?.netProfit}
                  </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default Leaderboard;

const LeaderboardTable = ({ data }: { data: LeaderboardDataItem[] }) => {
  const totalNetProfit = data.reduce((acc, row) => acc + row.netProfit, 0);

  return (
    <div className="text-xs bg-zinc-950/50 border border-zinc-800 rounded-xl ">
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
