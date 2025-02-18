import WalletConnect from "../auth/WalletConnect";

const Navbar = () => {
  return (
    <div className="absolute top-0 w-full z-10">
      <div className="w-full flex justify-center backdrop-blur bg-black/10">
        <div className="max-w-7xl flex left-0 w-full justify-between items-center p-4">
          <div className="text-white">BlackJack</div>
          <WalletConnect />
        </div>
      </div>
    </div>
  );
};
export { Navbar };
