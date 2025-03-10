'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckersGamePage() {
  const router = useRouter();

  const handlePlayWithAI = () => {
    const gameId = crypto.randomUUID();
    router.push(`/game/checkers/ai`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Checkers Adventure</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* AI Game Card */}
        <div 
          onClick={handlePlayWithAI}
          className="cursor-pointer bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <h2 className="text-xl font-semibold mb-4">Play Checkers with AI</h2>
          <p className="text-gray-600">Test your skills against our intelligent AI opponent. Choose your difficulty level and improve your game!</p>
        </div>

        {/* Mini-games Card */}
        <Link
          href="/game/checkers/mini-games"
          className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <h2 className="text-xl font-semibold mb-4">Learn Strategy with Mini-Games</h2>
          <p className="text-gray-600">Master Checkers tactics through interactive challenges. Perfect for beginners and advanced players alike!</p>
        </Link>
        <Link
          href="/game/checkers/history/game"
          className="block bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <h2 className="text-xl font-semibold mb-4">Review your Past Games</h2>
          <p className="text-gray-600">Learn through your mistakes and Upgrade</p>
        </Link>
      </div>

      <div className="mt-12 text-center text-gray-600 max-w-2xl mx-auto">
        <p className="mb-4">Not sure which to choose?</p>
        <p>
          <span className="font-semibold">vs AI</span> is great for full-game practice, while 
          <span className="font-semibold"> Mini-Games</span> help with specific tactics and patterns.
        </p>
      </div>
    </div>
  );
}