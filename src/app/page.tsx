'use client';
import { Button } from '@/components/ui/button';
import { nanoid } from 'nanoid';
import { Card } from './components/Card';

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a4d0a] text-[#f0f0f0] p-4">
      <h1 className="text-3xl text-center text-yellow-400 mb-8">
        Retro Blackjack
      </h1>

      <div className="flex flex-col space-y-16 items-center w-full">
        {/* dealer */}
        <div className="flex flex-col w-fit items-center">
          <h2 className="text-xl mb-2">Dealer</h2>
          <div className="flex justify-center">
            <Card value="?" />
            <Card value="10" />
          </div>
        </div>
        {/* players */}
        <div className="flex space-x-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={nanoid()}
              className="flex flex-col space-y-2 items-center"
            >
              <div className="text-sm">Player {i + 1}</div>
              <div className="flex space-x-8">
                <Card value="7" />
                <Card value="K" />
              </div>
              <div className="flex space-x-2">
                <Button
                  size={'sm'}
                  variant="outline"
                  className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer"
                >
                  Hit
                </Button>
                <Button
                  size={'sm'}
                  variant="outline"
                  className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer"
                >
                  Stand
                </Button>
              </div>
            </div>
          ))}
        </div>
        {/* extra buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
          >
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
}
