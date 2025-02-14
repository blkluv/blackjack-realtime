import { Button } from '../ui/button';
import { useUser } from '@/hooks/useUser';
import { truncateAddress } from '@/lib/utils';
import { useAppKit, useAppKitEvents } from '@reown/appkit/react';

const WalletConnect = () => {
  const { open, close } = useAppKit();
  const events = useAppKitEvents();

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
