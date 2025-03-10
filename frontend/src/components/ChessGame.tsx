// app/chess/page.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import Head from 'next/head';

export default function ChessGame() {
  const [gameState, setGameState] = useState({
    board: null,
    chess: null,
    gameOver: false,
    result: null,
    moves: [],
    loading: false,
    playerColor: 'w',
    gameStarted: false,
    error: null,
    scriptsLoaded: {
      jquery: false,
      chessjs: false,
      chessboard: false
    }
  });
  
  const boardRef = useRef(null);
  const router = useRouter();
  
  // Check if all scripts are loaded and initialize the board
  useEffect(() => {
    const { scriptsLoaded, board } = gameState;
    
    if (scriptsLoaded.jquery && scriptsLoaded.chessjs && scriptsLoaded.chessboard && !board) {
      // Small timeout to ensure DOM is ready
      setTimeout(initializeBoard, 100);
    }
  }, [gameState.scriptsLoaded]);
  
  // Initialize the board once scripts are loaded
  const initializeBoard = () => {
    if (!window.Chess || !window.$ || !window.Chessboard) {
      console.error("Chess libraries not loaded properly");
      setGameState(prev => ({
        ...prev,
        error: "Failed to load chess libraries. Please refresh the page."
      }));
      return;
    }
    
    if (!boardRef.current) {
      console.error("Board reference not found");
      return;
    }
    
    try {
      // Initialize the chess instance
      const chess = new window.Chess();
      
      // Board configuration
      const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
      };
      
      // Create the board
      const board = window.Chessboard('chessboard', config);
      
      setGameState(prev => ({
        ...prev,
        board,
        chess
      }));
      
      // Resize board to fit container
      window.$(window).resize(() => {
        board.resize();
      });
      
      console.log("Chess board initialized successfully");
    } catch (error) {
      console.error("Error initializing chess board:", error);
      setGameState(prev => ({
        ...prev,
        error: "Failed to initialize chess board. Please refresh the page."
      }));
    }
  };
  
  // Check if a move is valid
  const onDragStart = (source, piece) => {
    const { chess, gameOver, playerColor } = gameState;
    
    // Game is over or it's not the player's turn
    if (gameOver || 
        (chess.turn() === 'w' && piece.search(/^b/) !== -1) || 
        (chess.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (chess.turn() !== playerColor[0])) {
      return false;
    }
  };
  
  // Handle when the player drops a piece
  const onDrop = (source, target) => {
    const { chess } = gameState;
    
    // Try to make the move
    const move = chess.move({
      from: source,
      to: target,
      promotion: 'q' // Always promote to queen for simplicity
    });
    
    // If invalid move
    if (move === null) return 'snapback';
    
    // Update moves list
    const newMoves = [...gameState.moves, move];
    setGameState(prev => ({
      ...prev,
      moves: newMoves
    }));
    
    // Check game state
    checkGameState();
    
    // Get AI move unless the game is over
    if (!chess.game_over()) {
      getAIMove();
    }
  };
  
  // Update the board position after the piece snap animation
  const onSnapEnd = () => {
    const { board, chess } = gameState;
    if (board && chess) {
      board.position(chess.fen());
    }
  };
  
  // Check if the game is over
  const checkGameState = () => {
    const { chess } = gameState;
    if (!chess) return;
    
    let result = null;
    
    if (chess.in_checkmate()) {
      result = chess.turn() === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate';
    } else if (chess.in_draw()) {
      if (chess.in_stalemate()) {
        result = 'Draw by stalemate';
      } else if (chess.in_threefold_repetition()) {
        result = 'Draw by repetition';
      } else if (chess.insufficient_material()) {
        result = 'Draw by insufficient material';
      } else {
        result = 'Draw by the 50-move rule';
      }
    }
    
    if (result) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        result
      }));
    }
  };
  
  // Get AI move from API
  const getAIMove = async () => {
    const { chess } = gameState;
    if (!chess) return;
    
    setGameState(prev => ({ ...prev, loading: true }));
    
    try {
      // Make API call to get AI move
      const response = await fetch('/api/chess/ai-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen: chess.fen(),
          moves: gameState.moves
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI move');
      }
      
      const data = await response.json();
      
      // Make the AI move
      const aiMove = chess.move(data.move);
      
      // Update moves list
      const newMoves = [...gameState.moves, aiMove];
      
      // Update board
      if (gameState.board) {
        gameState.board.position(chess.fen());
      }
      
      setGameState(prev => ({
        ...prev,
        moves: newMoves,
        loading: false
      }));
      
      // Check if game is over after AI move
      checkGameState();
      
    } catch (error) {
      console.error('Error getting AI move:', error);
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to get AI move. Please try again.'
      }));
    }
  };
  
  // Submit game results when the game is over
  const submitGameResults = async () => {
    const { chess, moves } = gameState;
    if (!chess) return;
    
    try {
      const response = await fetch('/api/chess/save-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          finalFen: chess.fen(),
          pgn: chess.pgn(),
          moves: moves,
          result: gameState.result
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save game');
      }
      
      // Redirect to the game history page or some confirmation page
      router.push('/chess/history');
      
    } catch (error) {
      console.error('Error saving game:', error);
      setGameState(prev => ({
        ...prev,
        error: 'Failed to save game. Please try again.'
      }));
    }
  };
  
  // Reset the game
  const resetGame = () => {
    const { chess, board } = gameState;
    if (!chess || !board) return;
    
    chess.reset();
    board.start();
    
    setGameState(prev => ({
      ...prev,
      gameOver: false,
      result: null,
      moves: [],
      error: null
    }));
  };
  
  // Choose player color and start game
  const startGame = (color) => {
    setGameState(prev => ({
      ...prev,
      playerColor: color,
      gameStarted: true
    }));
    
    // If player chooses black, AI (white) makes first move
    if (color === 'b') {
      setTimeout(() => getAIMove(), 500);
    }
  };
  
  // Script load handlers
  const handleJQueryLoaded = () => {
    console.log('jQuery loaded');
    setGameState(prev => ({
      ...prev,
      scriptsLoaded: {
        ...prev.scriptsLoaded,
        jquery: true
      }
    }));
  };
  
  const handleChessJsLoaded = () => {
    console.log('Chess.js loaded');
    setGameState(prev => ({
      ...prev,
      scriptsLoaded: {
        ...prev.scriptsLoaded,
        chessjs: true
      }
    }));
  };
  
  const handleChessboardJsLoaded = () => {
    console.log('Chessboard.js loaded');
    setGameState(prev => ({
      ...prev,
      scriptsLoaded: {
        ...prev.scriptsLoaded,
        chessboard: true
      }
    }));
  };
  
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto p-4">
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css"
        />
      </Head>
      
      {/* Load scripts with explicit onLoad handlers */}
      <Script 
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
        onLoad={handleJQueryLoaded}
      />
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"
        strategy="beforeInteractive"
        onLoad={handleChessJsLoaded}
      />
      <Script 
        src="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js"
        strategy="beforeInteractive"
        onLoad={handleChessboardJsLoaded}
      />
      
      <h1 className="text-3xl font-bold mb-6">Chess vs AI</h1>
      
      {gameState.error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {gameState.error}
        </div>
      )}
      
      {!gameState.gameStarted ? (
        <div className="mb-6 text-center">
          <h2 className="text-xl mb-4">Choose your color:</h2>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => startGame('w')}
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded"
            >
              White
            </button>
            <button
              onClick={() => startGame('b')}
              className="px-4 py-2 bg-gray-800 text-white border border-gray-300 rounded"
            >
              Black
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div 
              id="chessboard" 
              ref={boardRef} 
              style={{ width: '400px', height: '400px' }}
            ></div>
          </div>
          
          {gameState.loading && (
            <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
              AI is thinking...
            </div>
          )}
          
          {gameState.gameOver ? (
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold mb-2">Game Over</h2>
              <p className="mb-4">{gameState.result}</p>
              <div className="flex gap-4">
                <button
                  onClick={submitGameResults}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save Game
                </button>
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                >
                  Play Again
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-6">
              <p className="mb-2">
                Playing as: {gameState.playerColor === 'w' ? 'White' : 'Black'}
              </p>
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
              >
                Reset Game
              </button>
            </div>
          )}
          
          <div className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Move History:</h3>
            <div className="bg-gray-100 p-3 rounded max-h-60 overflow-y-auto">
              {gameState.moves.length > 0 ? (
                <ol className="list-decimal pl-5">
                  {gameState.moves.map((move, index) => (
                    <li key={index} className="mb-1">
                      {index % 2 === 0 ? 
                        `${Math.floor(index/2) + 1}. ${move.san}` : 
                        move.san}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No moves yet</p>
              )}
            </div>
          </div>
        </>
      )}
      
      <Link href="/chess/history" className="mt-6 text-blue-500 hover:underline">
        View Game History
      </Link>
    </div>
  );
}