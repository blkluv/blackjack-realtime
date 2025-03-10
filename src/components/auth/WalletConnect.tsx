"use client";
import {
  betStateAtom,
  setTriggerBalanceRefreshAtom,
} from "@/atoms/blackjack.atom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBlackjack } from "@/hooks/useBlackjack";
import { useUser } from "@/hooks/useUser";
import { useVault } from "@/hooks/useVault";
import { client } from "@/lib/client";
import { cn, truncateAddress } from "@/lib/utils";
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { useAtomValue, useSetAtom } from "jotai";
import { CircleUserRound, Coins, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// import { Button } from "../ui/button";
import CustomButton from "../ui/CustomButton";

const WalletConnect = () => {
  const { user } = useUser();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { address } = useAppKitAccount();
  const { balances, withdraw, deposit, transaction } = useVault();
  const [value, setValue] = useState<string>("");

  const handleWithdraw = async () => {
    const numericValue = Number(value);
    if (!address || !value || numericValue <= 0) return;

    if (numericValue % 1 !== 0) {
      console.error("Value must be a whole number");
      return;
    }

    await withdraw(String(numericValue));
  };

  const handleDeposit = async () => {
    const numericValue = Number(value);
    if (!address || !value || numericValue <= 0) return;

    await deposit(String(numericValue));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <CustomButton onClick={() => (!user.isAuthenticated ? open() : null)}>
            {user.walletAddress
              ? `Bal: ${balances.vaultBalance}`
              : "Connect Wallet"}
          </CustomButton>
          <GTAEarnings />
        </div>
      </PopoverTrigger>
      {user.isAuthenticated && (
        <PopoverContent
          className="p-0 mx-4 rounded-xl overflow-hidden border-zinc-700"
          sideOffset={10}
        >
          <div className="flex flex-col bg-zinc-900/60 backdrop-blur-2xl text-zinc-200 text-xs divide-y divide-zinc-700">
            <div className="flex justify-between items-center p-4">
              <div className="flex space-x-2 items-center">
                <CircleUserRound size={20} />
                <div>{truncateAddress(address)}</div>
              </div>
              <div>
                <LogOut
                  onClick={() => {
                    disconnect();
                    signOut({ redirect: false });
                  }}
                  className="text-red-500 cursor-pointer"
                  size={18}
                />
              </div>
            </div>
            <div className="flex justify-between items-center p-4">
              <div>Wallet Balance:</div>
              <div>{balances.tokenBalance} $BJT</div>
            </div>
            <div className="flex justify-between items-center p-4">
              <div>Vault Balance:</div>
              <div>{balances.vaultBalance} $BJT</div>
            </div>
            <Faucet />
            <div className="flex justify-between items-center p-4 space-x-4">
              <input
                placeholder="0"
                type="number"
                value={value}
                disabled={transaction.isLoading}
                onChange={(e) => {
                  const inputVal = e.target.value;
                  if (
                    inputVal === "" ||
                    (/^\d+$/.test(inputVal) && Number(inputVal) >= 0)
                  ) {
                    setValue(inputVal);
                  }
                }}
                className="w-full bg-zinc-200 font-bold text-zinc-900 rounded-md h-7 px-3 focus:outline-none disabled:bg-zinc-700"
              />
            </div>
            <div className="flex justify-between space-x-4 items-center p-4">
              <CustomButton
                onClick={handleWithdraw}
                disabled={transaction.isLoading}
                className="w-full"
              >
                Withdraw
              </CustomButton>

              <CustomButton
                disabled={transaction.isLoading}
                onClick={handleDeposit}
                className="w-full"
              >
                Deposit
              </CustomButton>
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default WalletConnect;

const Faucet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const setTriggerBalanceRefresh = useSetAtom(setTriggerBalanceRefreshAtom);
  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const data = await client.bjt.getBjtTokens.$get();
      const res = await data.json();
      if (res.success) {
        toast.success(res.message);
        setIsLoading(false);
        setTriggerBalanceRefresh();
      } else {
        toast.error(res.message);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("Failed to claim tokens from faucet");
      setIsLoading(false);
    }
  };
  return (
    <div
      onClick={handleClaim}
      onKeyDown={handleClaim}
      className="flex justify-between hover:bg-zinc-950/50 cursor-pointer items-center p-4"
    >
      <div>{isLoading ? "Getting tokens..." : "Get $BJT tokens"}</div>
      <div>
        <Coins size={16} />
      </div>
    </div>
  );
};

const GTAEarnings = () => {
  const { user } = useUser();
  const { getPlayer } = useBlackjack();
  const betState = useAtomValue(betStateAtom);
  const [showBetPlaced, setShowBetPlaced] = useState(true);

  useEffect(() => {
    if (betState === "bet-placed") {
      setShowBetPlaced(true);

      const timer = setTimeout(() => {
        setShowBetPlaced(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [betState]);

  if (!user.walletAddress) return null;
  const player = getPlayer(user?.walletAddress);
  if (!player) return null;
  const betAmount = player.bet;
  const result = player.roundResult?.state;

  if (!betAmount) return null;

  if (
    betState === "bet-placed" &&
    !showBetPlaced &&
    result !== "win" &&
    result !== "blackjack"
  )
    return null;

  if (
    betState !== "bet-placed" &&
    (!result || (result !== "win" && result !== "blackjack"))
  )
    return null;

  let value: string;
  if (betState === "bet-placed" && showBetPlaced) {
    value = `-${betAmount}`;
  } else if (result === "win") {
    value = `+${betAmount}`;
  } else if (result === "blackjack") {
    value = `+${(betAmount ?? 0) * 1.5}`;
  } else {
    return null;
  }

  const getColor = () => {
    if (betState === "bet-placed" && showBetPlaced) {
      return "text-red-400";
    }

    if (result === "win") {
      return "text-green-400";
    }
    if (result === "blackjack") {
      return "text-yellow-400";
    }

    return "";
  };

  return (
    <div className="absolute top-10 right-0 ">
      <div className={cn("text-3xl font-black font-serif", getColor())}>
        {value}
      </div>
    </div>
  );
};
