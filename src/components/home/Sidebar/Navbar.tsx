import { ChartNoAxesColumn } from 'lucide-react';
import Link from 'next/link';
import WalletConnect from '../../auth/WalletConnect';
import Logo from './Logo';

const Navbar = () => {
  return (
    <div className="flex justify-between p-4 items-center border-b border-zinc-900">
      <Logo />
      <div className="flex space-x-4 items-center">
        <Link href={'/leaderboard'}>
          <div className="flex items-center space-x-1 cursor-pointer">
            {/* <div className="text-sm text-zinc-200">Leaderboard</div> */}
            <ChartNoAxesColumn size={24} />
          </div>
        </Link>
        <WalletConnect />
      </div>
    </div>
  );
};
export default Navbar;
