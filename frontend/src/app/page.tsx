// app/page.js
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Choose Your Game
      </h1>
      
      <div className="flex gap-6">
        {/* Chess Card */}
        <Link 
          href="/game/chess"
          className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-64 text-center"
        >
          <div className="mb-4">
            <span className="text-6xl">♔</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Chess</h2>
          <p className="text-gray-500">Play against AI or friends</p>
        </Link>

        {/* Checkers Card */}
        <Link
          href="/game/checkers"
          className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-64 text-center"
        >
          <div className="mb-4">
            <span className="text-6xl">●</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Checkers</h2>
          <p className="text-gray-500">Classic draughts game</p>
        </Link>
      </div>

      <div className="mt-8 text-gray-500">
        <p>Select a game to start playing!</p>
      </div>
    </div>
  )
}