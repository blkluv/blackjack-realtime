import WalletConnect from '../../auth/WalletConnect';

const Navbar = () => {
  return (
    <div className="flex justify-between p-4 items-center border-b border-zinc-900">
      <div className="text-xl">GawkGawk</div>
      <WalletConnect />
    </div>
  );
};
export default Navbar;
