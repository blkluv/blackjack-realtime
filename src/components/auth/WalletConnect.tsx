import { useUser } from '@/hooks/useUser';
import { truncateAddress } from '@/lib/utils';
import { useAppKit } from '@reown/appkit/react';
import { Button } from '../ui/button';

const WalletConnect = () => {
  const { open } = useAppKit();
  const { user } = useUser();

  return (
    <Button size={'sm'} onClick={() => open()}>
      {user.walletAddress
        ? truncateAddress(user.walletAddress)
        : 'Connect Wallet'}
    </Button>
  );
};

export default WalletConnect;
