import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { MessagesSquare } from 'lucide-react';
import BottomBar from './Sidebar/BottomBar/BottomBar';
import GameLog from './Sidebar/GameLog';

const MobileDrawer = () => {
  return (
    <Drawer>
      <DrawerTrigger>
        <MessagesSquare className="cursor-pointer text-zinc-300 lg:hidden" />
      </DrawerTrigger>
      <DrawerContent className="bg-zinc-950/50 backdrop-blur-lg border-zinc-800">
        {/* <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader> */}
        <GameLog />
        <BottomBar />
        {/* <DrawerFooter>
          <DrawerClose className="flex justify-center">
            <X className="cursor-pointer" />
          </DrawerClose>
        </DrawerFooter> */}
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
