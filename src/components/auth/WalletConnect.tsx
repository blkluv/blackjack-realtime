import { useUser } from '@/hooks/useUser';
// import { truncateAddress } from '@/lib/utils';
import type React from 'react';
// import { Button } from '../ui/button';
import { ConnectKitButton } from 'connectkit';

const WalletConnect: React.FC = () => {
  const { user } = useUser();
  return <ConnectKitButton />;
};

export default WalletConnect;
