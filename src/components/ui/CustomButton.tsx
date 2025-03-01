import type { FC } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type TCustomButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  dark?: boolean;
  bgColor?: string;
};

const CustomButton: FC<TCustomButtonProps> = ({
  children,
  className,
  onClick,
  disabled,
  dark,
  bgColor,
}) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "relative inline-block px-4 py-2 font-medium group",
        className,
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "absolute inset-0 w-full rounded-lg h-full transition duration-200 ease-out transform translate-x-0.5 translate-y-0.5",
          dark
            ? "bg-zinc-800 group-hover:-translate-x-0 group-hover:-translate-y-0"
            : "bg-zinc-500 group-hover:-translate-x-0 group-hover:-translate-y-0"
          // bgColor
        )}
      />
      <span
        className={cn(
          "absolute inset-0 w-full h-full rounded-lg border-2 border-zinc-900",
          dark
            ? "bg-zinc-900 group-hover:bg-zinc-700 border-zinc-900"
            : "bg-zinc-100 group-hover:bg-zinc-300",
          bgColor ? `${bgColor} group-hover:${bgColor} border-zinc-800` : ""
        )}
      />
      <span
        className={cn(
          "relative rounded-lg",
          dark ? "text-zinc-100" : "text-zinc-900",
          bgColor ? "text-zinc-100" : ""
        )}
      >
        {children}
      </span>
    </Button>
  );
};
export default CustomButton;
