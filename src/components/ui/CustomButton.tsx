import type { FC } from 'react';
import { Button } from './button';

type TCustomBuuttonProps = {
  children: React.ReactNode;
};

const CustomButton: FC<TCustomBuuttonProps> = ({ children }) => {
  return (
    <Button className="relative inline-block px-4 py-2 font-medium group">
      <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0" />
      <span className="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black" />
      <span className="relative text-black group-hover:text-white">
        {children}
      </span>
    </Button>
  );
};

export default CustomButton;
