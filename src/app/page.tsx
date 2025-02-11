'use client';
import { Button } from '@/components/ui/button';
import { Card } from './components/Card';

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a4d0a] text-[#f0f0f0] p-4">
      <h1 className="text-3xl text-center text-yellow-400 mb-8">
        Retro Blackjack
      </h1>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl mb-2">Dealer</h2>
          <div className="flex justify-center">
            <Card value="?" />
            <Card value="10" />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl mb-2">Player</h2>
          <div className="flex justify-center">
            <Card value="7" />
            <Card value="K" />
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-xl mb-2">Player's Total: 17</p>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            Hit
          </Button>
          <Button
            variant="outline"
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            Stand
          </Button>
          <Button
            variant="outline"
            className="bg-red-600 text-white hover:bg-red-700"
          >
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
}
