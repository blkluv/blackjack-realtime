import { cn } from '@/lib/utils';
import WalletConnect from '../../auth/WalletConnect';
import Leaderboard from '../Leaderboard';
import Logo from './Logo';

const Navbar = ({ forMobile = false }: { forMobile?: boolean }) => {
  return (
    <div
      className={cn(
        'justify-between p-4 items-center border-b border-zinc-900 flex',
        forMobile && 'lg:hidden',
      )}
    >
      <Logo />
      <div className="flex space-x-4 items-center">
        <Leaderboard />
        <WalletConnect />
      </div>
    </div>
  );
};
export default Navbar;
