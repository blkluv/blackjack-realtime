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
import { env } from '@/env.mjs';
import { truncateAddress } from '@/lib/utils';
import Image from 'next/image';

export const getAvatarSrc = (key?: string): string => {
  const avatarId = key?.replace('0x', '');
  const r = fetch(`https://api.multiavatar.com/${JSON.stringify(avatarId)}`)
    .then((res) => res.text())
    .then((svg) => console.log(svg));
  return `https://api.multiavatar.com/${key}.png?apikey=${env.NEXT_PUBLIC_MULTIAVATAR_API_KEY}`;
};

const data = [
  {
    id: 1,
    walletAddress: '0xA1B2C3D4E5F6G7H8I9J0',
    netProfit: 12500,
    totalWagered: 50000,
    rank: 1,
    biggestWin: 7500,
  },
  {
    id: 2,
    walletAddress: '0xB2C3D4E5F6G7H8I9J0A1',
    netProfit: 9700,
    totalWagered: 42000,
    rank: 2,
    biggestWin: 6800,
  },
  {
    id: 3,
    walletAddress: '0xC3D4E5F6G7H8I9J0A1B2',
    netProfit: 8800,
    totalWagered: 39000,
    rank: 3,
    biggestWin: 7200,
  },
  {
    id: 4,
    walletAddress: '0xD4E5F6G7H8I9J0A1B2C3',
    netProfit: 7650,
    totalWagered: 34000,
    rank: 4,
    biggestWin: 6100,
  },
  {
    id: 5,
    walletAddress: '0xE5F6G7H8I9J0A1B2C3D4',
    netProfit: 7400,
    totalWagered: 32000,
    rank: 5,
    biggestWin: 5800,
  },
  {
    id: 6,
    walletAddress: '0xF6G7H8I9J0A1B2C3D4E5',
    netProfit: 6900,
    totalWagered: 29000,
    rank: 6,
    biggestWin: 5600,
  },
  {
    id: 7,
    walletAddress: '0xG7H8I9J0A1B2C3D4E5F6',
    netProfit: 6400,
    totalWagered: 27000,
    rank: 7,
    biggestWin: 5300,
  },
  {
    id: 8,
    walletAddress: '0xH8I9J0A1B2C3D4E5F6G7',
    netProfit: 6000,
    totalWagered: 25000,
    rank: 8,
    biggestWin: 5000,
  },
  {
    id: 9,
    walletAddress: '0xI9J0A1B2C3D4E5F6G7H8',
    netProfit: 5800,
    totalWagered: 24000,
    rank: 9,
    biggestWin: 4700,
  },
  {
    id: 10,
    walletAddress: '0xJ0A1B2C3D4E5F6G7H8I9',
    netProfit: 5500,
    totalWagered: 23000,
    rank: 10,
    biggestWin: 4500,
  },
];

const LeaderboardPage = () => {
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  console.log(getAvatarSrc(top3[0]?.walletAddress));
  return (
    <div className="flex flex-col h-screen items-center bg-zinc-950 text-zinc-200">
      <div className="flex mt-52 items-end">
        <div className="flex flex-col relative rounded-l-4xl items-center pt-20 bg-zinc-800/50 h-48 px-12">
          <div className="size-24 rounded-full bg-zinc-950 absolute -top-12 flex justify-center border-4 border-sky-500">
            <div className="size-6 text-xs rounded bg-sky-500 flex items-center justify-center rotate-45 -bottom-3 absolute">
              <div className="-rotate-45 text-black">2</div>
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
        <div className="flex flex-col relative rounded-t-4xl items-center pt-28 bg-zinc-800 h-64 px-12">
          <div className="size-32 rounded-full bg-zinc-950 absolute -top-16 flex justify-center border-4 border-yellow-500">
            <Image
              src={getAvatarSrc(top3[0]?.walletAddress)}
              alt=""
              height={100}
              width={100}
              className=""
            />
            <div className="size-6 text-xs rounded bg-yellow-500 flex items-center justify-center rotate-45 -bottom-3 absolute">
              <div className="-rotate-45 text-black">1</div>
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
            <div className="text-xl text-yellow-500">{top3[0]?.netProfit}</div>
            <div className="text-[9px] text-zinc-400">Net Profit</div>
          </div>
        </div>
        <div className="flex flex-col relative rounded-r-4xl items-center pt-20 bg-zinc-800/50 h-48 px-12">
          <div className="size-24 rounded-full bg-zinc-950 absolute -top-12 flex justify-center border-4 border-green-500">
            <div className="size-6 text-xs rounded bg-green-500 flex items-center justify-center rotate-45 -bottom-3 absolute">
              <div className="-rotate-45 text-black">3</div>
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
      </div>
      <div className="flex space-x-8 items-center py-8">
        <div className="w-32 h-px bg-zinc-700" />
        <div className="text-xs text-zinc-400 whitespace-nowrap">
          Leaderboard of the month
        </div>
        <div className="w-32 h-px bg-zinc-700" />
      </div>
      <LeaderboardTable data={rest} />
      <Image
        src={
          'data:image/jpeg;base64,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'
        }
        alt=""
        height={500}
        width={500}
        className="size-64"
      />
    </div>
  );
};

export default LeaderboardPage;

const LeaderboardTable = ({
  data,
}: {
  data: {
    id: number;
    walletAddress: string;
    netProfit: number;
    totalWagered: number;
    rank: number;
    biggestWin: number;
  }[];
}) => {
  return (
    <div className="text-xs bg-zinc-900 border border-zinc-800 rounded-xl ">
      <Table className="text-[10px] font-[400]">
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead className="text-center">Player</TableHead>
            <TableHead>Total Wagered</TableHead>
            <TableHead>Biggest Win</TableHead>
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
              <TableCell className="text-right">{row.netProfit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total Net Profit</TableCell>
            <TableCell className="text-right">
              {data.reduce((acc, row) => acc + row.netProfit, 0)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
