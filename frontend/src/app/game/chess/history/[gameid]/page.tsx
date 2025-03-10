// app/history/[gameid]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useParams } from 'next/navigation';

interface Move {
  from: string;
  to: string;
  promotion?: string;
}

interface HighlightedMove {
  moveIndex: number;
  situation: string;
  description: string;
}

interface Blunder {
  moveIndex: number;
  situation: string;
  description: string;
}

interface GameData {
  moves: Move[];
  finalFen: string;
  highlightedMoves: HighlightedMove[];
  blunders: Blunder[];
}

export default function GameHistoryPage() {
  const params = useParams();
  const gameId = params.gameid as string;
  
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [currentFen, setCurrentFen] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1000); // milliseconds per move
  const [currentDescription, setCurrentDescription] = useState('');
  const [error, setError] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data for demonstration
  const mockGameData: GameData = {
    moves: [
      { from: 'e2', to: 'e4' },
      { from: 'e7', to: 'e5' },
      { from: 'g1', to: 'f3' },
      { from: 'b8', to: 'c6' },
      { from: 'f1', to: 'c4' },
      { from: 'g8', to: 'f6' },
      { from: 'e1', to: 'g1' }, // castle kingside
      { from: 'f6', to: 'e4' }, // blunder
      { from: 'd2', to: 'd4' },
      { from: 'e4', to: 'd6' },
      { from: 'd4', to: 'e5' },
      { from: 'd6', to: 'f5' },
      { from: 'f3', to: 'g5' }, // highlight
      { from: 'f5', to: 'g4' }, // White attacks the pawn
      { from: 'c4', to: 'd5' }, // White threatens central control
      { from: 'g4', to: 'f3' }, // Black captures White's knight
      { from: 'g5', to: 'f3' }, // White recaptures the knight
      { from: 'f3', to: 'g1' }, // Knight back to g1
      { from: 'g1', to: 'h3' }, // White moves knight to h3, supporting pawn
      { from: 'h7', to: 'h5' }, // Black starts a pawn push on the queenside
      { from: 'f2', to: 'f4' }, // White pushes the pawn, gaining space
      { from: 'h5', to: 'h4' }, // Black advances pawn aggressively
      { from: 'f4', to: 'f5' }, // White pushes further
      { from: 'f3', to: 'g1' }, // Knight back to g1, retreating
    ],
    finalFen: 'r1bqkb1r/pppp1ppp/2n5/4Pn1N/2B5/8/PPP2PPP/RNBQ1RK1 b kq - 0 7',
    highlightedMoves: [
      {
        moveIndex: 12,
        situation: 'r1bqkb1r/pppp1ppp/2n5/4Pn1N/2B5/8/PPP2PPP/RNBQ1RK1 b kq - 0 7',
        description: 'White develops the knight to g5, putting pressure on f7 and threatening the fork.'
      },
      {
        moveIndex: 17,
        situation: 'r1bqkb1r/ppp1pppp/2n5/4Pn1N/2B5/8/PPP2PPP/RNBQ1RK1 b kq - 0 8',
        description: 'White pushes the f4 pawn, expanding on the kingside and aiming for central dominance.'
      },
      {
        moveIndex: 20,
        situation: 'r1bqkb1r/ppp1pppp/2n5/4Pn1N/2B5/8/PPP2PPP/RNBQ1RK1 b kq - 0 9',
        description: 'Black pushes the h5 pawn, attempting to create space on the queenside for future attacks.'
      }
    ],
    blunders: [
      {
        moveIndex: 7,
        situation: 'r1bqkb1r/pppp1ppp/2n5/8/2B1n3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 3 4',
        description: 'Black captures the e4 pawn, exposing their knight to attack and losing material.'
      },
      {
        moveIndex: 15,
        situation: 'r1bqkb1r/pppp1ppp/2n5/4Pn1N/2B5/8/PPP2PPP/RNBQ1RK1 b kq - 0 15',
        description: 'Black captures White\'s knight with the pawn, but loses control of the kingside, weakening their position.'
      },
      {
        moveIndex: 19,
        situation: 'r1bqkb1r/pppp1ppp/2n5/4Pn1N/2B5/8/PPP2PPP/RNBQ1RK1 b kq - 0 18',
        description: 'Black overextends with the h5 pawn, weakening their queenside and leaving their king vulnerable.'
      }
    ]
  };
  

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        // Replace this with actual API call when endpoint is ready
        // const response = await fetch(`/api/chess/games/${gameId}`);
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setGameData(mockGameData);
          const newGame = new Chess();
          setGame(newGame);
          setCurrentFen(newGame.fen());
          setLoading(false);
        }, 1000); // Simulate network delay
      } catch (err) {
        setError('Failed to load game data');
        setLoading(false);
      }
    };

    fetchGameData();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameId]);

  useEffect(() => {
    if (!gameData || !isPlaying) return;

    const playMove = () => {
      if (currentMoveIndex < gameData.moves.length) {
        const newGame = new Chess(game.fen());
        try {
          const move = gameData.moves[currentMoveIndex];
          newGame.move({ from: move.from, to: move.to, promotion: move.promotion });
          setGame(newGame);
          setCurrentFen(newGame.fen());
          
          // Check if current move is highlighted or a blunder
          const highlightedMove = gameData.highlightedMoves.find(
            hm => hm.moveIndex === currentMoveIndex
          );
          const blunder = gameData.blunders.find(
            b => b.moveIndex === currentMoveIndex
          );
          
          if (highlightedMove) {
            setCurrentDescription(`Highlight: ${highlightedMove.description}`);
          } else if (blunder) {
            setCurrentDescription(`Blunder: ${blunder.description}`);
          } else {
            setCurrentDescription('');
          }
          
          setCurrentMoveIndex(currentMoveIndex + 1);
        } catch (err) {
          console.error('Invalid move:', err);
        }
      } else {
        // Reset to start when all moves have been played
        setCurrentMoveIndex(0);
        setGame(new Chess());
        setCurrentFen(new Chess().fen());
        setCurrentDescription('');
      }
    };

    timerRef.current = setTimeout(playMove, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentMoveIndex, game, gameData, isPlaying, speed]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading game data...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  if (!gameData) {
    return <div className="flex items-center justify-center h-screen">Game not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chess Game History - Game #{gameId}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="w-full max-w-md mx-auto">
            <Chessboard 
              position={currentFen} 
              boardWidth={500}
              areArrowsAllowed={true}
            />
          </div>
          
          <div className="mt-4 flex justify-center space-x-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button 
              onClick={() => {
                setGame(new Chess());
                setCurrentFen(new Chess().fen());
                setCurrentMoveIndex(0);
                setCurrentDescription('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Reset
            </button>
            
            <div className="flex items-center space-x-2">
              <label htmlFor="speed">Speed:</label>
              <select 
                id="speed" 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="border rounded p-1"
              >
                <option value="2000">Slow</option>
                <option value="1000">Normal</option>
                <option value="500">Fast</option>
              </select>
            </div>
          </div>
          
          {currentDescription && (
            <div className="mt-4 p-3 bg-yellow-100 rounded">
              <p>{currentDescription}</p>
            </div>
          )}
        </div>
        
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Highlighted Moves</h2>
            {gameData.highlightedMoves.length > 0 ? (
              <ul className="space-y-2">
                {gameData.highlightedMoves.map((move, index) => (
                  <li key={`highlight-${index}`} className="p-2 bg-green-100 rounded">
                    <p className="font-medium">Move {Math.floor(move.moveIndex/2) + 1}{move.moveIndex % 2 === 0 ? ' (White)' : ' (Black)'}</p>
                    <p>{move.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No highlighted moves in this game</p>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Blunders</h2>
            {gameData.blunders.length > 0 ? (
              <ul className="space-y-2">
                {gameData.blunders.map((blunder, index) => (
                  <li key={`blunder-${index}`} className="p-2 bg-red-100 rounded">
                    <p className="font-medium">Move {Math.floor(blunder.moveIndex/2) + 1}{blunder.moveIndex % 2 === 0 ? ' (White)' : ' (Black)'}</p>
                    <p>{blunder.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No blunders in this game</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}