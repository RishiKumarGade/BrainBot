// app/page.js
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// Static data example - strategy for winning with 3 pieces vs 10
const staticGameData = {
  title: "Corner Control Strategy: 3 vs 10 Pieces",
  description: "This strategy demonstrates how to win against superior numbers by controlling key diagonal paths and forcing your opponent into disadvantageous positions. By keeping your pieces in the corners and edges, you limit your opponent's movement while creating opportunities for kings.",
  initialState: {
    board: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 2, 0, 2],
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 2, 0],
      [0, 0, 0, 0, 0, 2, 0, 2],
      [4, 0, 4, 0, 0, 0, 0, 4],
    ],
    // 0: empty, 1: black, 2: red, 3: black king, 4: red king
  },
  moves: [
    {
      from: { row: 7, col: 0 },
      to: { row: 5, col: 2 },
      captures: [{ row: 6, col: 1 }],
      description: "The red king moves diagonally to capture an opponent's piece, beginning our attack"
    },
    {
      from: { row: 1, col: 4 },
      to: { row: 3, col: 6 },
      captures: [],
      description: "Opponent advances a piece, hoping to block our next move"
    },
    {
      from: { row: 7, col: 2 },
      to: { row: 6, col: 3 },
      captures: [],
      description: "Position second king for a double attack"
    },
    {
      from: { row: 3, col: 7 },
      to: { row: 5, col: 5 },
      captures: [],
      description: "Opponent tries to create a defensive formation"
    },
    {
      from: { row: 5, col: 2 },
      to: { row: 3, col: 0 },
      captures: [],
      description: "King moves to control the corner, creating a threat"
    },
    {
      from: { row: 5, col: 5 },
      to: { row: 7, col: 7 },
      captures: [],
      description: "Opponent tries to create a king"
    },
    {
      from: { row: 7, col: 7 },
      to: { row: 5, col: 5 },
      captures: [{ row: 6, col: 6 }],
      description: "Our third king captures, removing a piece from their formation"
    },
    {
      from: { row: 3, col: 0 },
      to: { row: 1, col: 2 },
      captures: [{ row: 2, col: 1 }],
      description: "King continues its path, capturing another piece"
    },
    {
      from: { row: 3, col: 6 },
      to: { row: 1, col: 4 },
      captures: [],
      description: "Opponent advances, trying to reclaim territory"
    },
    {
      from: { row: 1, col: 2 },
      to: { row: 3, col: 4 },
      captures: [{ row: 2, col: 3 }],
      description: "Our king captures another piece in the center"
    },
    {
      from: { row: 1, col: 4 },
      to: { row: 0, col: 3 },
      captures: [],
      description: "Opponent creates a king but it's too late"
    },
    {
      from: { row: 6, col: 3 },
      to: { row: 4, col: 1 },
      captures: [],
      description: "Our second king moves to control another diagonal"
    },
    {
      from: { row: 5, col: 5 },
      to: { row: 3, col: 3 },
      captures: [],
      description: "Our third king moves to dominate the center"
    },
    {
      from: { row: 0, col: 3 },
      to: { row: 2, col: 5 },
      captures: [],
      description: "Opponent tries to escape"
    },
    {
      from: { row: 3, col: 3 },
      to: { row: 1, col: 5 },
      captures: [{ row: 2, col: 4 }],
      description: "Another capture by our king, reducing their forces"
    }
  ]
}

export default function CheckersStrategyPage() {
  const [gameData, setGameData] = useState(null)
  const [currentBoard, setCurrentBoard] = useState([])
  const [moveIndex, setMoveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const animationRef = useRef(null)
  const delayBetweenMoves = 1500 // ms
  
  // Fetch data (in a real app) or use static data
  useEffect(() => {
    // In a real app, this would be an API call:
    // const fetchData = async () => {
    //   const res = await fetch('/api/checkers/strategies/1')
    //   const data = await res.json()
    //   setGameData(data)
    //   setCurrentBoard(data.initialState.board)
    // }
    // fetchData()

    // Using static data for now
    setGameData(staticGameData)
    setCurrentBoard([...staticGameData.initialState.board])
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (!gameData || isPaused) return
    
    const executeMove = () => {
      const move = gameData.moves[moveIndex]
      
      // Create a new board with the move applied
      const newBoard = currentBoard.map(row => [...row])
      
      // Move the piece
      const pieceType = newBoard[move.from.row][move.from.col]
      newBoard[move.from.row][move.from.col] = 0
      newBoard[move.to.row][move.to.col] = pieceType
      
      // Handle captures
      if (move.captures && move.captures.length > 0) {
        move.captures.forEach(capture => {
          newBoard[capture.row][capture.col] = 0
        })
      }
      
      setCurrentBoard(newBoard)
      
      // Advance to next move or reset to beginning
      setMoveIndex((moveIndex + 1) % gameData.moves.length)
    }
    
    animationRef.current = setTimeout(executeMove, delayBetweenMoves)
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [gameData, moveIndex, currentBoard, isPaused])

  if (!gameData) {
    return <div className="p-4">Loading strategy...</div>
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{gameData.title}</h1>
      <p className="mb-6">{gameData.description}</p>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="w-full max-w-md aspect-square bg-stone-200 grid grid-cols-8 grid-rows-8 border-2 border-stone-800">
            {currentBoard.map((row, rowIndex) => (
              row.map((cell, colIndex) => {
                // Checkerboard pattern
                const isDark = (rowIndex + colIndex) % 2 === 1
                
                // Check if this cell is involved in the current move
                const currentMove = gameData.moves[moveIndex > 0 ? moveIndex - 1 : gameData.moves.length - 1]
                const isFromCell = currentMove && currentMove.from.row === rowIndex && currentMove.from.col === colIndex
                const isToCell = currentMove && currentMove.to.row === rowIndex && currentMove.to.col === colIndex
                const isCaptureCell = currentMove && currentMove.captures?.some(c => c.row === rowIndex && c.col === colIndex)
                
                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className={`relative ${isDark ? 'bg-stone-800' : 'bg-stone-300'} 
                      ${isFromCell ? 'from-cell' : ''} 
                      ${isToCell ? 'to-cell' : ''} 
                      ${isCaptureCell ? 'capture-cell' : ''}`}
                  >
                    {cell > 0 && (
                      <motion.div 
                        className={`absolute inset-2 rounded-full ${cell === 1 || cell === 3 ? 'bg-black' : 'bg-red-600'} 
                          ${(cell === 3 || cell === 4) ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>
                )
              })
            ))}
          </div>
          
          <div className="mt-4 flex justify-between">
            <button 
              onClick={() => setIsPaused(!isPaused)} 
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {isPaused ? 'Resume' : 'Pause'} Animation
            </button>
            
            <button 
              onClick={() => {
                if (animationRef.current) clearTimeout(animationRef.current)
                setMoveIndex((moveIndex + 1) % gameData.moves.length)
              }} 
              className="px-4 py-2 bg-gray-600 text-white rounded"
              disabled={isPaused}
            >
              Next Move
            </button>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Current Move:</h2>
            {gameData.moves[moveIndex > 0 ? moveIndex - 1 : gameData.moves.length - 1] && (
              <div>
                <p className="mb-2">
                  <strong>From:</strong> ({gameData.moves[moveIndex > 0 ? moveIndex - 1 : gameData.moves.length - 1].from.row}, {gameData.moves[moveIndex > 0 ? moveIndex - 1 : gameData.moves.length - 1].from.col})
                  <strong className="ml-2">To:</strong> ({gameData.moves[moveIndex > 0 ? moveIndex - 1 : gameData.moves.length - 1].to.row}, {gameData.moves[moveIndex > 0 ? moveIndex - 1 : gameData.moves.length - 1].to.col})
                </p>
                <p className="font-medium text-gray-700">
                  {gameData.moves[moveIndex > 0 ? moveIndex - 1 : gameData.moves.length - 1].description}
                </p>
                
                {gameData.moves[moveIndex > 0 ? moveIndex - 1 : gameData.moves.length - 1].captures && gameData.moves[moveIndex > 0 ? moveIndex - 1 : gameData.moves.length - 1].captures.length > 0 && (
                  <p className="mt-2 text-red-600">
                    Capture at: {gameData.moves[moveIndex > 0 ? moveIndex - 1 : gameData.moves.length - 1].captures.map(c => `(${c.row}, ${c.col})`).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Key Points:</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Control the corners and edges to limit opponent mobility</li>
              <li>Focus on creating kings early for greater movement options</li>
              <li>Force single pieces into positions where they must move into capture</li>
              <li>Always look several moves ahead for capture sequences</li>
              <li>When outnumbered, focus on reducing opponent pieces rather than advancement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}