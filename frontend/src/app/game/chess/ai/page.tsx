'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';



export default function ChessGame() {
  const [status, setStatus] = useState('Loading chess board...');
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    // Create a global initialization function that Next.js can call
    window.initChessGame = () => {
      if (
        typeof window.jQuery !== 'undefined' &&
        typeof window.Chess !== 'undefined' &&
        typeof window.Chessboard !== 'undefined' &&
        !initialized
      ) {
        setInitialized(true);
        setupChessGame();
      }
    };

    // Clean up function
    return () => {
      delete window.initChessGame;
    };
  }, [initialized]);

  const setupChessGame = () => {
    const $ = window.jQuery;
    const Chess = window.Chess;
    const Chessboard = window.Chessboard;

    // Wait until DOM is fully loaded
    $(function() {
      // Initialize the chess game
      const game = new Chess();
      
      // Generate a unique ID for this game session
      const newGameId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      setGameId(newGameId);
      
      // Function to save game to MongoDB
      const saveGameToMongoDB = async () => {
        try {
          const response = await fetch('/api/save-game', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              gameId: gameId,
              finalFen: game.fen(),
              pgn: game.pgn(),
              moves: game.history({ verbose: true }),
              result: getGameResult(),
              timestamp: new Date().toISOString()
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to save game: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Game saved successfully:', data);
          setStatus(prevStatus => prevStatus + ' (Game saved to database)');
        } catch (error) {
          console.error('Error saving game to database:', error);
        }
      };
      
      // Function to determine game result
      const getGameResult = () => {
        if (game.in_checkmate()) {
          return game.turn() === 'w' ? 'black_win' : 'white_win';
        } else if (game.in_draw()) {
          if (game.in_stalemate()) return 'draw_stalemate';
          if (game.in_threefold_repetition()) return 'draw_repetition';
          if (game.insufficient_material()) return 'draw_insufficient';
          return 'draw_other';
        }
        return 'incomplete';
      };
      
      // Function to get move from API
      const getMoveFromAPI = async () => {
        if (game.game_over()) return;
        
        setLoading(true);
        setStatus('AI is thinking...');
        
        try {
          // Get the game state and move history
          const fen = game.fen();
          const history = game.history();

          const MOVE_PROMPT = `
You are a chess AI tasked with analyzing the current state of the game and providing the best move for Black (the AI). The game state is provided in Forsyth-Edwards Notation (FEN) and the history of the moves made so far. Your goal is to return your best move while ensuring that the game is still enjoyable for the user, so you should avoid making overly aggressive or unbeatable moves.

Your response should be in the following JSON format:

\`\`\`json
{
  "move": "e7e5"
}
\`\`\`

Where \`"move"\` is the AI's best move represented in standard algebraic notation (e.g., "e7e5" for a pawn move or "Ng8f6" for a knight move). You should take into account the game history, the current FEN, and ensure that the move is legal.

Please analyze the provided FEN and move history, and return the best move for the AI. Consider the following:

1. **The game is still ongoing**: Do not make moves that will immediately end the game (like checkmate, unless it's unavoidable).
2. **The AI should not make a move that is overly difficult for the user**: While the AI is strong, ensure that it does not play in a way that makes it impossible for the user to enjoy the game.
3. **The move should be well-formed**: It should be in standard algebraic notation and should not include unnecessary information.

### Input:
- **FEN**: The current state of the game in Forsyth-Edwards Notation.
- **Moves history**: A list of all moves made so far.

### Example:
- FEN: \`"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"\`
- Moves history: \`[`+  history.map(move=> " "+ move + " ") + `]\`

### Response:
\`\`\`json
{
  "move": "b1c3"
}
\`\`\`
`;
          
          // Send the data to the API
          const response = await fetch('/api/users/aimove', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fen: fen,
              history: history,
              prompt : MOVE_PROMPT
            }),
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log(data);
          // Make the move returned by the API
          if (data.move) {
            game.move(data.move);
            board.position(game.fen());
          } else {
            // Fallback to random move if API doesn't return a move
            makeRandomMove();
          }
        } catch (error) {
          console.error('Error fetching move from API:', error);
          // Fallback to random move on error
          makeRandomMove();
        } finally {
          setLoading(false);
          updateStatus();
          
          // Check if game is over after AI move
          if (game.game_over()) {
            saveGameToMongoDB();
          }
        }
      };
      
      // Fallback random move function
      const makeRandomMove = () => {
        if (game.game_over()) return;
        
        const possibleMoves = game.moves();
        if (possibleMoves.length === 0) return;
        
        // Select a random move
        const randomIdx = Math.floor(Math.random() * possibleMoves.length);
        const move = possibleMoves[randomIdx];
        
        // Make the move
        game.move(move);
        board.position(game.fen());
      };
      
      // Function to update game status
      const updateStatus = () => {
        let statusText = '';
        
        // Check if the game is over
        if (game.game_over()) {
          if (game.in_checkmate()) {
            statusText = game.turn() === 'w' ? 'Game over, black wins by checkmate' : 'Game over, white wins by checkmate';
          } else if (game.in_draw()) {
            if (game.in_stalemate()) {
              statusText = 'Game over, drawn by stalemate';
            } else if (game.in_threefold_repetition()) {
              statusText = 'Game over, drawn by repetition';
            } else if (game.insufficient_material()) {
              statusText = 'Game over, drawn by insufficient material';
            } else {
              statusText = 'Game over, drawn position';
            }
          } else {
            statusText = 'Game over';
          }
          
          // Save the game to MongoDB when it's over
          saveGameToMongoDB();
        } else {
          statusText = game.turn() === 'w' ? 'White to move' : 'Black to move';
          
          if (game.in_check()) {
            statusText += ', ' + (game.turn() === 'w' ? 'White' : 'Black') + ' is in check';
          }
        }
        
        setStatus(statusText);
      };
      
      // Board configuration
      const config = {
        draggable: true,
        position: 'start',
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: (source, piece) => {
          // Do not pick up pieces if the game is over
          if (game.game_over()) return false;
          
          // Only allow white pieces to be dragged (player always plays white)
          if (piece.search(/^b/) !== -1) return false;
          
          // Only allow dragging if it's white's turn
          if (game.turn() !== 'w') return false;
          
          // Don't allow dragging while AI is thinking
          if (loading) return false;
        },
        onDrop: (source, target) => {
          // See if the move is legal
          const move = game.move({
            from: source,
            to: target,
            promotion: 'q' // Always promote to a queen for simplicity
          });
          
          // Illegal move
          if (move === null) return 'snapback';
          
          // Update the board position
          updateStatus();
          
          // Check if game is over after player move
          if (game.game_over()) {
            return;
          }
          
          // Get AI move from API
          setTimeout(getMoveFromAPI, 250);
        }
      };
      
      // Initialize the board
      const board = Chessboard('chessboard', config);
      
      // Adjust board size responsively
      $(window).resize(() => {
        board.resize();
      });
      
      // Set the initial status
      updateStatus();
      
      // Add a reset button function
      window.resetGame = () => {
        game.reset();
        board.position('start');
        
        // Generate a new game ID
        const newGameId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        setGameId(newGameId);
        
        setStatus('New game started. White to move.');
      };
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 bg-gray-100">
      {/* Load jQuery first */}
      <Script 
        src="https://code.jquery.com/jquery-3.7.1.min.js"
        strategy="beforeInteractive"
        onLoad={() => window.initChessGame && window.initChessGame()}
      />
      
      {/* Then load chess.js */}
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"
        strategy="afterInteractive"
        onLoad={() => window.initChessGame && window.initChessGame()}
      />
      
      {/* Finally load chessboard.js */}
      <Script 
        src="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js"
        strategy="afterInteractive"
        onLoad={() => window.initChessGame && window.initChessGame()}
      />
      
      {/* CSS for chessboard */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css"
      />
      
      <h1 className="text-3xl font-bold mb-6">Chess Game</h1>
      <p className="mb-4">(You play as White against an AI)</p>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
        <div id="chessboard" style={{ width: '400px', height: '400px' }}></div>
      </div>
      
      <div className="text-xl font-semibold mt-4">
        {loading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            AI is thinking...
          </div>
        ) : (
          status
        )}
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-lg max-w-md">
        <h2 className="text-xl font-bold mb-2">Instructions:</h2>
        <ul className="list-disc ml-6">
          <li className="mb-1">You play as White</li>
          <li className="mb-1">Drag pieces to make your move</li>
          <li className="mb-1">The AI opponent will fetch a move from the API</li>
          <li className="mb-1">If the API fails, it will fall back to random moves</li>
          <li className="mb-1">Game results are automatically saved to the database</li>
        </ul>
      </div>
      
      <button 
        onClick={() => {
          if (window.resetGame) {
            window.resetGame();
          }
        }}
        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        New Game
      </button>
    </div>
  );
}