// app/chess/page.js
'use client'

import { useEffect, useRef, useState } from 'react'

export default function ChessPage() {
  const chessboardRef = useRef(null)
  const [board, setBoard] = useState(null)
  const [gameData, setGameData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1000) 
  const [scriptsLoaded, setScriptsLoaded] = useState(false)

  const chessScenarios = [
    {
      title: "King and Bishop vs King and Queen",
      description: "In this challenging endgame, you have only a king and bishop against your opponent's king and queen. The key strategy is to avoid quick checkmate by keeping your king and bishop close together while looking for opportunities to force a stalemate.",
      initialPosition: '8/8/8/3k4/8/2K2B2/8/5q2 w - - 0 1', 
      moves: [
        { from: 'f3', to: 'e4' }, // Bishop moves to create defense
        { from: 'f1', to: 'f2' }, // Queen advances
        { from: 'c3', to: 'd3' }, // King moves closer to bishop for protection
        { from: 'f2', to: 'e2' }, // Queen threatens bishop
        { from: 'e4', to: 'd5' }, // Bishop sacrifices itself to create stalemate possibility
        { from: 'e2', to: 'd5' }, // Queen captures bishop
        { from: 'd3', to: 'e3' }, // King moves to corner for stalemate
        { from: 'd5', to: 'e5' }, // Queen prepares checkmate
        { from: 'e3', to: 'f3' }, // King moves to final position
        { from: 'e5', to: 'f5' }  // Final move creating stalemate if played correctly
      ]
    },
    {
      title: "Bishop Pair vs Knight Pair",
      description: "This middlegame scenario explores the classic battle between two bishops vs two knights. The bishops excel in open positions with long diagonals, while knights are better in closed positions. The key is to use your bishops to control the center and create threats on both sides of the board.",
      initialPosition: 'r3k2r/ppp2ppp/2p5/4P3/2B5/2N5/PPP2PPP/R3K2R w KQkq - 0 1', 
      moves: [
        { from: 'c4', to: 'f7' },  
        { from: 'e8', to: 'f7' }, 
        { from: 'c3', to: 'd5' },
        { from: 'f7', to: 'e8' },
        { from: 'd5', to: 'f6' }, 
        { from: 'e8', to: 'd8' }, 
        { from: 'f6', to: 'e4' }, 
        { from: 'd8', to: 'c8' }, 
        { from: 'e4', to: 'c5' }, 
        { from: 'c8', to: 'b8' }  
      ]
    },
    {
      title: "Defending with Only King and Knights",
      description: "In this defensive scenario, you have only your king and two knights against a powerful attack. Knights are excellent defensive pieces due to their unique movement pattern. The key is to use your knights to create a fortress around your king while looking for counterattack opportunities.",
      initialPosition: '8/8/8/3NN3/4K3/8/5ppp/5rk1 w - - 0 1', 
      moves: [
        { from: 'd5', to: 'f4' }, 
        { from: 'f1', to: 'f4' }, 
        { from: 'e5', to: 'f3' }, 
        { from: 'g1', to: 'h1' }, 
        { from: 'e4', to: 'f4' }, 
        { from: 'g2', to: 'g1' }, 
        { from: 'f3', to: 'g1' }, 
        { from: 'h1', to: 'g1' }, 
        { from: 'f4', to: 'e3' }, 
        { from: 'f2', to: 'f1' }  
      ]
    },
    {
      title: "Attacking with Bishop and Rook",
      description: "This attack scenario demonstrates how to coordinate a bishop and rook to launch a powerful kingside attack. The bishop controls key diagonals while the rook applies pressure along files. Together they can create mating threats that are difficult to defend against.",
      initialPosition: 'r1bqk2r/ppp2ppp/2n5/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQR1K1 w kq - 0 1', // Custom position
      moves: [
        { from: 'f3', to: 'g5' }, 
        { from: 'c5', to: 'f2' }, 
        { from: 'e1', to: 'f1' }, 
        { from: 'c6', to: 'd4' }, 
        { from: 'c3', to: 'd5' }, 
        { from: 'e5', to: 'd5' }, 
        { from: 'c1', to: 'g5' }, 
        { from: 'f7', to: 'g5' }, 
        { from: 'd1', to: 'g4' }, 
        { from: 'e8', to: 'f8' }  
      ]
    },
    {
      title: "Bishop vs Knight Endgame",
      description: "This endgame explores the subtle differences between bishops and knights in pawn structures. Generally, bishops are stronger in open positions with pawns on both sides of the board, while knights excel with pawns on one side. The key is understanding how to exploit your piece's strengths.",
      initialPosition: '8/5p2/4k3/3p4/3P4/4KB2/5P2/8 w - - 0 1', // White: Ke3, Bf3, pawns on d4, f2, Black: Ke6, pawn on d5, f7
      moves: [
        { from: 'f3', to: 'e2' }, 
        { from: 'e6', to: 'd6' }, 
        { from: 'e3', to: 'd3' }, 
        { from: 'd6', to: 'c6' },
        { from: 'e2', to: 'b5' }, 
        { from: 'c6', to: 'b7' }, 
        { from: 'b5', to: 'c4' }, 
        { from: 'b7', to: 'c7' }, 
        { from: 'd3', to: 'c3' }, 
        { from: 'c7', to: 'd7' }  
      ]
    }
  ];

  useEffect(() => {
    const loadScripts = async () => {
      if (typeof window === 'undefined') return
      
      if (window.jQuery && window.Chess && window.Chessboard) {
        setScriptsLoaded(true)
        return
      }
      
      try {
        const jqueryScript = document.createElement('script')
        jqueryScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js'
        jqueryScript.async = false
        document.body.appendChild(jqueryScript)
        
        await new Promise((resolve) => {
          jqueryScript.onload = resolve
        })
        
        const chessboardCSS = document.createElement('link')
        chessboardCSS.rel = 'stylesheet'
        chessboardCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/chessboard-1.0.0.min.css'
        document.head.appendChild(chessboardCSS)
        
        const chessScript = document.createElement('script')
        chessScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js'
        chessScript.async = false
        document.body.appendChild(chessScript)
        
        await new Promise((resolve) => {
          chessScript.onload = resolve
        })
        
        const chessboardScript = document.createElement('script')
        chessboardScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/chessboard-1.0.0.min.js'
        chessboardScript.async = false
        document.body.appendChild(chessboardScript)
        
        await new Promise((resolve) => {
          chessboardScript.onload = resolve
        })
        
        setScriptsLoaded(true)
      } catch (err) {
        console.error('Failed to load scripts:', err)
        setError("Failed to load chessboard scripts")
      }
    }
    
    loadScripts()
  }, [])

  useEffect(() => {
    const getRandomScenario = () => {
      const randomIndex = Math.floor(Math.random() * chessScenarios.length);
      return chessScenarios[randomIndex];
    }
    const fetchGameData = async () => {
      try {
        const randomScenario = getRandomScenario();
        setGameData(randomScenario);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load chess game data");
        setIsLoading(false);
      }
    }

    fetchGameData();
  }, []);

  useEffect(() => {
    if (!scriptsLoaded || !gameData || !chessboardRef.current) return
    
    try {
      chessboardRef.current.innerHTML = ''
      
      const chess = new window.Chess(gameData.initialPosition)
      
      const newBoard = Chessboard(chessboardRef.current.id, {
        position: chess.fen(),
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
      })
      
      window.addEventListener('resize', () => {
        if (newBoard) newBoard.resize()
      })
      
      setBoard(newBoard)
      console.log('Chessboard initialized successfully')
    } catch (err) {
      console.error('Error initializing chessboard:', err)
      setError(`Failed to initialize chessboard: ${err.message}`)
    }
  }, [scriptsLoaded, gameData])

  useEffect(() => {
    if (!board || !gameData || !window.Chess || !scriptsLoaded) return
    
    const chess = new window.Chess(gameData.initialPosition)
    let animationTimer = null
    
    const animateMove = () => {
      if (currentMoveIndex >= gameData.moves.length) {
        chess.load(gameData.initialPosition)
        board.position(chess.fen())
        setCurrentMoveIndex(0)
        return
      }
      
      const move = gameData.moves[currentMoveIndex]
      try {
        chess.move({ from: move.from, to: move.to })
        board.position(chess.fen())
      } catch (err) {
        console.error('Invalid move:', move, err)
        setCurrentMoveIndex(prev => prev + 1)
        return
      }
      
      setCurrentMoveIndex(prev => prev + 1)
    }
    
    animationTimer = setTimeout(animateMove, animationSpeed)
    
    return () => {
      if (animationTimer) clearTimeout(animationTimer)
    }
  }, [board, gameData, currentMoveIndex, animationSpeed, scriptsLoaded])

  const handleSpeedChange = (e) => {
    setAnimationSpeed(Number(e.target.value))
  }
  
  const handleNewScenario = () => {
    const randomIndex = Math.floor(Math.random() * chessScenarios.length);
    setGameData(chessScenarios[randomIndex]);
    setCurrentMoveIndex(0);


  }

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{gameData?.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div 
            id="chessboard"
            ref={chessboardRef} 
            style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
          ></div>
          
          <div className="mt-4 flex flex-col gap-3">
            <label className="block">
              Animation Speed:
              <input 
                type="range" 
                min="200" 
                max="3000" 
                step="100" 
                value={animationSpeed} 
                onChange={handleSpeedChange} 
                className="w-full"
              />
              <span className="text-sm">{animationSpeed}ms</span>
            </label>
            
            <button 
              onClick={handleNewScenario}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
            >
              Show Next
            </button>
          </div>
          
          {!scriptsLoaded && (
            <div className="text-amber-600 mt-4">
              Loading chessboard libraries...
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Strategy Description</h2>
          <p className="mb-4">{gameData?.description}</p>
          
          <h2 className="text-xl font-semibold mb-2">Moves</h2>
          <div className="grid grid-cols-2 gap-2">
            {gameData?.moves.map((move, index) => (
              <div 
                key={index}
                className={`p-2 border rounded ${
                  index === currentMoveIndex - 1 ? 'bg-yellow-100 border-yellow-500' : ''
                }`}
              >
                {index % 2 === 0 ? (Math.floor(index / 2) + 1) + '. ' : ''}
                {move.from} → {move.to}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}