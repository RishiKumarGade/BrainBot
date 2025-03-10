// app/history/[gameid]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Types for our data
interface CheckersMove {
  from: number;
  to: number;
  isJump: boolean;
  description: string;
}

interface HighlightedMove {
  moveIndex: number;
  boardState: string[][]; // 2D array representing the board
  description: string;
}

interface Blunder {
  moveIndex: number;
  boardState: string[][]; // 2D array representing the board
  description: string;
}

interface GameHistory {
  moves: CheckersMove[];
  finalState: string[][];
  highlights: HighlightedMove[];
  blunders: Blunder[];
}

// Component to render the checkers board
const CheckersBoard = ({ 
  boardState, 
  highlightSquare = null,
}: { 
  boardState: string[][],
  highlightSquare?: number | null 
}) => {
  return (
    <div className="aspect-square w-full max-w-md mx-auto border-4 border-amber-800 rounded-lg overflow-hidden shadow-xl">
      <div className="grid grid-cols-8 h-full w-full">
        {boardState.flat().map((piece, index) => {
          const row = Math.floor(index / 8);
          const col = index % 8;
          const isBlackSquare = (row + col) % 2 === 1;
          const isHighlighted = index === highlightSquare;
          
          return (
            <div
              key={index}
              className={`flex items-center justify-center ${
                isBlackSquare ? 'bg-amber-900' : 'bg-amber-200'
              } ${isHighlighted ? 'ring-4 ring-yellow-400 ring-inset' : ''}`}
            >
              {piece === 'r' && (
                <div className="w-4/5 h-4/5 rounded-full bg-red-600 shadow-md border border-red-800" />
              )}
              {piece === 'b' && (
                <div className="w-4/5 h-4/5 rounded-full bg-gray-900 shadow-md border border-gray-700" />
              )}
              {piece === 'R' && (
                <div className="w-4/5 h-4/5 rounded-full bg-red-600 shadow-md border-2 border-yellow-300 flex items-center justify-center">
                  <div className="w-1/2 h-1/2 text-yellow-300 font-bold flex items-center justify-center">K</div>
                </div>
              )}
              {piece === 'B' && (
                <div className="w-4/5 h-4/5 rounded-full bg-gray-900 shadow-md border-2 border-yellow-300 flex items-center justify-center">
                  <div className="w-1/2 h-1/2 text-yellow-300 font-bold flex items-center justify-center">K</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function GameHistoryPage() {
  const params = useParams();
  const gameId = params.gameid as string;
  
  const [gameHistory, setGameHistory] = useState<GameHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [currentBoardState, setCurrentBoardState] = useState<string[][]>([]);
  const [highlightSquare, setHighlightSquare] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'replay' | 'highlights' | 'blunders'>('replay');
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [currentBlunderIndex, setCurrentBlunderIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Mock data for testing - replace with actual API call
  const mockGameHistory: GameHistory = {
    moves: [
      { from: 21, to: 17, isJump: false, description: "Black moves from 21 to 17" },
      { from: 40, to: 35, isJump: false, description: "Red moves from 40 to 35" },
      { from: 22, to: 18, isJump: false, description: "Black moves from 22 to 18" },
      { from: 35, to: 22, isJump: true, description: "Red jumps black piece at 26" },
      { from: 9, to: 13, isJump: false, description: "Black moves from 9 to 13" },
      { from: 31, to: 26, isJump: false, description: "Red moves from 31 to 26" },
      { from: 5, to: 9, isJump: false, description: "Black moves from 5 to 9" },
      { from: 26, to: 17, isJump: true, description: "Red jumps black piece at 21" },
      { from: 10, to: 15, isJump: false, description: "Black moves from 10 to 15" },
      { from: 24, to: 19, isJump: false, description: "Red moves from 24 to 19" },
      { from: 15, to: 24, isJump: true, description: "Black jumps red piece at 19" },
      { from: 28, to: 19, isJump: true, description: "Red jumps black piece at 24" },
      { from: 6, to: 10, isJump: false, description: "Black moves from 6 to 10" },
      { from: 32, to: 28, isJump: false, description: "Red moves from 32 to 28" },
      { from: 2, to: 6, isJump: false, description: "Black moves from 2 to 6" },
      { from: 19, to: 15, isJump: false, description: "Red moves from 19 to 15" },
      { from: 10, to: 19, isJump: true, description: "Black jumps red piece at 15" },
      { from: 23, to: 16, isJump: true, description: "Red jumps black piece at 19" },
      { from: 13, to: 22, isJump: true, description: "Black jumps red piece at 17" },
      { from: 27, to: 18, isJump: true, description: "Red jumps black piece at 22" },
      { from: 6, to: 10, isJump: false, description: "Black moves from 6 to 10" },
      { from: 25, to: 21, isJump: false, description: "Red moves from 25 to 21" },
      { from: 1, to: 6, isJump: false, description: "Black moves from 1 to 6" },
      { from: 30, to: 25, isJump: false, description: "Red moves from 30 to 25" },
      { from: 10, to: 15, isJump: false, description: "Black moves from 10 to 15" },
      { from: 21, to: 17, isJump: false, description: "Red moves from 21 to 17" },
      { from: 15, to: 24, isJump: true, description: "Black jumps red piece at 19" },
      { from: 28, to: 19, isJump: true, description: "Red jumps black piece at 24" },
      { from: 9, to: 14, isJump: false, description: "Black moves from 9 to 14" },
      { from: 18, to: 9, isJump: true, description: "Red jumps black piece at 14" }
    ],
    finalState: [
      [' ', ' ', ' ', 'b', ' ', ' ', ' ', 'b'],
      [' ', ' ', ' ', ' ', ' ', ' ', 'b', ' '],
      [' ', ' ', ' ', ' ', ' ', 'b', ' ', ' '],
      [' ', 'r', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
      [' ', ' ', 'r', ' ', 'r', ' ', ' ', ' '],
      [' ', 'r', ' ', ' ', ' ', 'r', ' ', 'r'],
      ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
    ],
    highlights: [
      {
        moveIndex: 3,
        boardState: [
          [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
          ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
          [' ', ' ', ' ', ' ', ' ', 'b', ' ', 'b'],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', 'r', ' ', ' ', ' ', ' ', ' '],
          ['r', ' ', ' ', ' ', 'r', ' ', 'r', ' '],
          [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
          ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
        ],
        description: "Red captures black piece with an important jump, opening up the middle of the board"
      },
      {
        moveIndex: 7,
        boardState: [
          [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
          ['b', ' ', ' ', ' ', 'b', ' ', 'b', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'b'],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', 'r', ' ', ' ', ' ', ' ', ' '],
          ['r', ' ', ' ', ' ', ' ', ' ', 'r', ' '],
          [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
          ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
        ],
        description: "Red makes a second capture, establishing dominance on the left side"
      },
      {
        moveIndex: 11,
        boardState: [
          [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
          ['b', ' ', ' ', ' ', 'b', ' ', 'b', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          ['r', ' ', ' ', ' ', ' ', ' ', 'r', ' '],
          [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
          ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
        ],
        description: "Red counters Black's jump with another capture, maintaining piece advantage"
      },
      {
        moveIndex: 17,
        boardState: [
          [' ', 'b', ' ', 'b', ' ', ' ', ' ', 'b'],
          ['b', ' ', ' ', ' ', ' ', ' ', 'b', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          ['r', ' ', ' ', ' ', ' ', ' ', 'r', ' '],
          [' ', 'r', ' ', ' ', ' ', 'r', ' ', 'r'],
          ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
        ],
        description: "Red makes a strong counter-jump after Black's capture, controlling the center"
      },
      {
        moveIndex: 19,
        boardState: [
          [' ', 'b', ' ', 'b', ' ', ' ', ' ', 'b'],
          ['b', ' ', ' ', ' ', ' ', ' ', 'b', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', 'r', ' '],
          [' ', 'r', ' ', ' ', ' ', 'r', ' ', 'r'],
          ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
        ],
        description: "Red jumps another of Black's pieces, increasing piece advantage to +3"
      }
    ],
    blunders: [
      {
        moveIndex: 2,
        boardState: [
          [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
          ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
          [' ', 'b', ' ', ' ', ' ', 'b', ' ', 'b'],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', 'r', ' ', ' ', ' '],
          ['r', ' ', 'r', ' ', ' ', ' ', 'r', ' '],
          [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
          ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
        ],
        description: "Black's move to 18 leaves piece vulnerable to capture - should have moved to 15 instead"
      },
      {
        moveIndex: 10,
        boardState: [
          [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
          ['b', ' ', ' ', ' ', 'b', ' ', 'b', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'b'],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', 'b', ' ', ' ', ' ', ' '],
          ['r', ' ', ' ', ' ', ' ', ' ', 'r', ' '],
          [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
          ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
        ],
        description: "Black's jump leaves the piece exposed to immediate counter-capture"
      },
      {
        moveIndex: 16,
        boardState: [
          [' ', 'b', ' ', 'b', ' ', ' ', ' ', 'b'],
          ['b', ' ', ' ', ' ', ' ', ' ', 'b', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', 'b', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          ['r', ' ', ' ', ' ', ' ', ' ', 'r', ' '],
          [' ', 'r', ' ', ' ', ' ', 'r', ' ', 'r'],
          ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
        ],
        description: "Black jumps Red's piece but fails to see the counter-jump possibility two moves ahead"
      },
      {
        moveIndex: 25,
        boardState: [
          [' ', ' ', ' ', 'b', ' ', ' ', ' ', 'b'],
          [' ', ' ', ' ', ' ', ' ', ' ', 'b', ' '],
          [' ', ' ', ' ', ' ', ' ', 'b', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', 'r', ' ', ' ', ' '],
          [' ', 'r', ' ', ' ', ' ', 'r', ' ', 'r'],
          ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
        ],
        description: "Red moves to 17 instead of 14, missing an opportunity to prevent Black's next jump"
      },
      {
        moveIndex: 26,
        boardState: [
          [' ', ' ', ' ', 'b', ' ', ' ', ' ', 'b'],
          [' ', ' ', ' ', ' ', ' ', ' ', 'b', ' '],
          [' ', ' ', ' ', ' ', ' ', 'b', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', 'b', ' ', ' ', ' ', ' '],
          [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
          [' ', 'r', ' ', ' ', ' ', 'r', ' ', 'r'],
          ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
        ],
        description: "Black jumps the Red piece but fails to anticipate the immediate counter-jump"
      }
    ],
    gameMetadata: {
      players: {
        black: {
          name: "Alexander Smith",
          rating: 1842
        },
        red: {
          name: "Maria Chen",
          rating: 1903
        }
      },
      event: "Regional Checkers Championship 2025",
      date: "2025-02-15",
      result: "1-0", // Red wins
      timeControl: "15+5", // 15 minutes with 5 second increment
      totalMoves: 30,
      averageTimePerMove: {
        black: 28.4, // seconds
        red: 31.2 // seconds
      }
    },
    boardStates: [
      // Initial board state
      [
        [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
        ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
        [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' '],
        [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
        ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
      ],
      // After move 1: Black moves from 21 to 17
      [
        [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
        ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
        [' ', 'b', ' ', ' ', ' ', 'b', ' ', 'b'],
        [' ', ' ', ' ', ' ', 'b', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' '],
        [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
        ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
      ],
      // After move 2: Red moves from 40 to 35
      [
        [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
        ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
        [' ', 'b', ' ', ' ', ' ', 'b', ' ', 'b'],
        [' ', ' ', ' ', ' ', 'b', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['r', ' ', 'r', ' ', ' ', ' ', 'r', ' '],
        [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
        ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
      ],
      // After move 3: Black moves from 22 to 18
      [
        [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
        ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
        [' ', ' ', ' ', ' ', ' ', 'b', ' ', 'b'],
        [' ', ' ', 'b', ' ', 'b', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['r', ' ', 'r', ' ', ' ', ' ', 'r', ' '],
        [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
        ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
      ],
      // After move 4: Red jumps black piece at 26
      [
        [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
        ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
        [' ', ' ', 'r', ' ', ' ', 'b', ' ', 'b'],
        [' ', ' ', ' ', ' ', 'b', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['r', ' ', ' ', ' ', ' ', ' ', 'r', ' '],
        [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
        ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
      ],
      // After move 5: Black moves from 9 to 13
      [
        [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
        ['b', ' ', ' ', ' ', 'b', ' ', 'b', ' '],
        [' ', ' ', 'r', ' ', ' ', 'b', ' ', 'b'],
        ['b', ' ', ' ', ' ', 'b', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['r', ' ', ' ', ' ', ' ', ' ', 'r', ' '],
        [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
        ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
      ],
      // After move 30: Final state
      [
        [' ', ' ', ' ', 'b', ' ', ' ', ' ', 'b'],
        [' ', ' ', ' ', ' ', ' ', ' ', 'b', ' '],
        [' ', ' ', ' ', ' ', ' ', 'b', ' ', ' '],
        [' ', 'r', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', 'r', ' ', 'r', ' ', ' ', ' '],
        [' ', 'r', ' ', ' ', ' ', 'r', ' ', 'r'],
        ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' ']
      ]
    ],
    statistics: {
      jumpsMade: {
        red: 7,
        black: 3
      },
      piecesLost: {
        red: 3,
        black: 7
      },
      captureRatio: {
        red: 2.33, // 7 jumps / 3 pieces lost
        black: 0.43 // 3 jumps / 7 pieces lost
      },
      moveDistribution: {
        defensiveMoves: 14,
        offensiveMoves: 12,
        neutralMoves: 4
      }
    }
  };
  
  // Initial empty board
  const emptyBoard: string[][] = Array(8).fill(0).map(() => Array(8).fill(' '));
  
  // Generate board state based on moves
  const generateBoardState = (moveIndex: number) => {
    // In a real implementation, this would calculate the board state after each move
    // For now, we'll use the final state as a placeholder
    if (moveIndex >= mockGameHistory.moves.length) {
      return mockGameHistory.finalState;
    }
    
    // Simplified for demonstration - in a real app, you'd compute the actual board state
    return mockGameHistory.finalState;
  };
  
  // Fetch game history
  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch(`/api/game-history/${gameId}`);
        // const data = await response.json();
        
        // Using mock data for now
        setTimeout(() => {
          setGameHistory(mockGameHistory);
          setCurrentBoardState(emptyBoard);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load game history');
        setLoading(false);
      }
    };
    
    fetchGameHistory();
  }, [gameId]);
  
  // Animation loop for replay mode
  useEffect(() => {
    if (!gameHistory || viewMode !== 'replay' || !isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentMoveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % (gameHistory.moves.length + 1);
        
        // Update board state based on the current move
        if (nextIndex < gameHistory.moves.length) {
          const move = gameHistory.moves[nextIndex];
          setHighlightSquare(move.to);
          setCurrentBoardState(generateBoardState(nextIndex));
        } else {
          // When we reach the end, show the final state
          setHighlightSquare(null);
          setCurrentBoardState(gameHistory.finalState);
        }
        
        return nextIndex;
      });
    }, 2000); // Change move every 2 seconds
    
    return () => clearInterval(interval);
  }, [gameHistory, viewMode, isPlaying]);
  
  // Animation loop for highlights mode
  useEffect(() => {
    if (!gameHistory || viewMode !== 'highlights' || !isPlaying || gameHistory.highlights.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentHighlightIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % gameHistory.highlights.length;
        const highlight = gameHistory.highlights[nextIndex];
        
        setCurrentBoardState(highlight.boardState);
        setHighlightSquare(gameHistory.moves[highlight.moveIndex].to);
        
        return nextIndex;
      });
    }, 3000); // Change highlight every 3 seconds
    
    return () => clearInterval(interval);
  }, [gameHistory, viewMode, isPlaying]);
  
  // Animation loop for blunders mode
  useEffect(() => {
    if (!gameHistory || viewMode !== 'blunders' || !isPlaying || gameHistory.blunders.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBlunderIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % gameHistory.blunders.length;
        const blunder = gameHistory.blunders[nextIndex];
        
        setCurrentBoardState(blunder.boardState);
        setHighlightSquare(gameHistory.moves[blunder.moveIndex].to);
        
        return nextIndex;
      });
    }, 3000); // Change blunder every 3 seconds
    
    return () => clearInterval(interval);
  }, [gameHistory, viewMode, isPlaying]);
  
  // Get current description based on view mode
  const getCurrentDescription = () => {
    if (!gameHistory) return '';
    
    if (viewMode === 'replay') {
      if (currentMoveIndex < gameHistory.moves.length) {
        return gameHistory.moves[currentMoveIndex].description;
      }
      return 'Final board position';
    } else if (viewMode === 'highlights') {
      if (gameHistory.highlights.length > 0) {
        return gameHistory.highlights[currentHighlightIndex].description;
      }
      return 'No highlights available';
    } else if (viewMode === 'blunders') {
      if (gameHistory.blunders.length > 0) {
        return gameHistory.blunders[currentBlunderIndex].description;
      }
      return 'No blunders available';
    }
    
    return '';
  };
  
  // Handle play/pause toggle
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center bg-gradient-to-b from-amber-50 to-amber-100">
        <div className="text-2xl text-amber-800 animate-pulse">Loading game history...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen justify-center items-center bg-gradient-to-b from-amber-50 to-amber-100">
        <div className="text-2xl text-red-600">{error}</div>
      </div>
    );
  }
  
  if (!gameHistory) {
    return (
      <div className="flex h-screen justify-center items-center bg-gradient-to-b from-amber-50 to-amber-100">
        <div className="text-2xl text-amber-800">Game not found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-amber-900 text-center">Checkers Game #{gameId}</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <button
                  onClick={() => setViewMode('replay')}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    viewMode === 'replay' 
                      ? 'bg-amber-700 text-white shadow-md' 
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  Replay Game
                </button>
                <button
                  onClick={() => setViewMode('highlights')}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    viewMode === 'highlights' 
                      ? 'bg-amber-700 text-white shadow-md' 
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  Highlights ({gameHistory.highlights.length})
                </button>
                <button
                  onClick={() => setViewMode('blunders')}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    viewMode === 'blunders' 
                      ? 'bg-amber-700 text-white shadow-md' 
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  Blunders ({gameHistory.blunders.length})
                </button>
                <button
                  onClick={togglePlayPause}
                  className="px-4 py-2 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-md"
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
              </div>
              
              <CheckersBoard 
                boardState={currentBoardState} 
                highlightSquare={highlightSquare} 
              />
            </div>
            
            <div className="p-4 bg-white rounded-xl shadow-md min-h-24">
              <h3 className="text-xl font-semibold mb-2 text-amber-900">
                {viewMode === 'replay' 
                  ? `Move ${currentMoveIndex + 1} of ${gameHistory.moves.length}` 
                  : viewMode === 'highlights' 
                    ? `Highlight ${currentHighlightIndex + 1} of ${gameHistory.highlights.length}` 
                    : `Blunder ${currentBlunderIndex + 1} of ${gameHistory.blunders.length}`}
              </h3>
              <p className="text-amber-800">{getCurrentDescription()}</p>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-md p-6 h-full">
              <h2 className="text-2xl font-semibold mb-4 text-amber-900">Game Moves</h2>
              <div className="overflow-y-auto max-h-96 border rounded-lg border-amber-200">
                <table className="w-full border-collapse">
                  <thead className="bg-amber-100 sticky top-0">
                    <tr>
                      <th className="p-2 text-left text-amber-900">#</th>
                      <th className="p-2 text-left text-amber-900">Move</th>
                      <th className="p-2 text-left text-amber-900">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameHistory.moves.map((move, index) => (
                      <tr 
                        key={index}
                        className={`border-t border-amber-100 hover:bg-amber-50 ${
                          currentMoveIndex === index ? 'bg-amber-100' : ''
                        }`}
                      >
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">{move.from} → {move.to}</td>
                        <td className="p-2">{move.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}