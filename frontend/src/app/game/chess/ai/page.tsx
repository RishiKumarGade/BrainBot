'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

export default function ChessGame() {
  const [status, setStatus] = useState('Loading chess board...');
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [coachMode, setCoachMode] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);

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
      
      // Function to update move history
      const updateMoveHistory = () => {
        const history = game.history({ verbose: true }).map((move, index) => {
          return {
            index: index + 1,
            from: move.from,
            to: move.to,
            piece: move.piece,
            san: move.san,
            color: move.color
          };
        });
        setMoveHistory(history);
      };
      
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
      
      const getCoachSuggestion = async () => {
        if (game.game_over() || game.turn() !== 'w') return;
        
        try {
          const fen = game.fen();
          const possibleMoves = game.moves({ verbose: true });
          const suggestions = [
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'e4', explanation: "Move the pawn to e4 to control the center and prepare for further piece development." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'd4', explanation: "Move the pawn to d4 to control the center and create space for your bishop and queen." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'c4', explanation: "Move the pawn to c4 to control the center and prepare for future piece development." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'f4', explanation: "Move the pawn to f4 to prepare an aggressive king-side attack while controlling important squares." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'g4', explanation: "Move the pawn to g4 to gain space on the king-side and potentially support a future kingside attack." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'h4', explanation: "Move the pawn to h4 to prepare a potential kingside attack and gain space on that side." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'e5', explanation: "Move the pawn to e5 to control the center and prepare for piece development." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'd5', explanation: "Move the pawn to d5 to control the center and support your other pieces." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'c5', explanation: "Move the pawn to c5 to fight for the center and prepare for future piece activity." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'f5', explanation: "Move the pawn to f5 to prepare an aggressive king-side attack and control more space." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'g5', explanation: "Move the pawn to g5 to control the king-side and potentially disrupt your opponent’s position." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'h5', explanation: "Move the pawn to h5 to support a potential kingside attack and increase control on that side." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'a4', explanation: "Move the pawn to a4 to gain space on the queen's side and potentially prepare for b5." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'b4', explanation: "Move the pawn to b4 to control space on the queenside and prepare for further development." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'a5', explanation: "Move the pawn to a5 to gain space and restrict the opponent's b-pawn." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'b5', explanation: "Move the pawn to b5 to control more queenside space and potentially develop your pieces." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'f3', explanation: "Move the pawn to f3 to support your central pawns and prepare for knight development." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'g3', explanation: "Move the pawn to g3 to support your king-side development and provide a safe square for your bishop." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', move: 'h3', explanation: "Move the pawn to h3 to prevent any opponent’s pieces from invading your king-side." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'f6', explanation: "Move the pawn to f6 to help support the center and prepare for piece development." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'g6', explanation: "Move the pawn to g6 to prepare for fianchettoing your bishop and controlling key squares." },
            { position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1', move: 'h6', explanation: "Move the pawn to h6 to prepare for a kingside expansion and restrict your opponent's options." },
        
            { position: 'default', move: 'pawn move', explanation: "Moving pawns one step forward helps control the center, open lines for your pieces, and create a solid foundation for your game." }
        ];
        
          
          const specificSuggestion = suggestions[Math.random() * suggestions.length];
          
          if (specificSuggestion) {
            setSuggestion(`Suggested move: ${specificSuggestion.move}. ${specificSuggestion.explanation}`);
          } else if (game.in_check()) {
            setSuggestion("You're in check! Find a move to protect your king or move it to safety.");
          } else if (possibleMoves.some(move => move.captured)) {
            const capturingMoves = possibleMoves.filter(move => move.captured);
            const bestCapture = capturingMoves[0];
            setSuggestion(`Consider capturing with ${bestCapture.piece.toUpperCase()} from ${bestCapture.from} to ${bestCapture.to}`);
          } else {
            // Default suggestion
            setSuggestion(suggestions.find(s => s.position === 'default').explanation);
          }
        } catch (error) {
          console.error('Error getting coach suggestion:', error);
          setSuggestion("Focus on developing your pieces and controlling the center.");
        }
      };
      
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
          updateMoveHistory();
          
          // Check if game is over after AI move
          if (game.game_over()) {
            saveGameToMongoDB();
          } else if (coachMode) {
            // Get suggestion for the next move if coach mode is on
            getCoachSuggestion();
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
        getCoachSuggestion();
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
            promotion: 'q' 
          });
          
          if (move === null) return 'snapback';
          
          updateStatus();
          updateMoveHistory();
          
          setSuggestion('');
          
          if (game.game_over()) {
            return;
          }
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
      
      // If coach mode is enabled, get initial suggestion
      if (coachMode) {
        getCoachSuggestion();
      }
      
      // Add a reset button function
      window.resetGame = () => {
        game.reset();
        board.position('start');
        
        // Generate a new game ID
        const newGameId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        setGameId(newGameId);
        
        setStatus('New game started. White to move.');
        setSuggestion('');
        setMoveHistory([]);
        
        // If coach mode is enabled, get initial suggestion
        if (coachMode) {
          getCoachSuggestion();
        }
      };
      
      // Add a function to toggle coach mode
      window.toggleCoachMode = (enabled) => {
        setCoachMode(enabled);
        if (enabled && game.turn() === 'w' && !game.game_over()) {
          getCoachSuggestion();
        } else {
          setSuggestion('');
        }
      };
    });
  };

  // Format move number for display
  const formatMoveNumber = (index, color) => {
    return color === 'w' ? `${Math.ceil(index/2)}.` : '';
  };

  return (
    <div className="min-h-screen py-8 bg-gray-100">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Chess Game</h1>
        <p className="mb-6 text-center">(You play as White against an AI)</p>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main game area with chessboard */}
          <div className="lg:w-2/3">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div id="chessboard" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}></div>
              
              <div className="mt-4 text-xl font-semibold">
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
              
              <div className="mt-4 flex items-center">
                <button 
                  onClick={() => {
                    if (window.resetGame) {
                      window.resetGame();
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded mr-4"
                >
                  New Game
                </button>
                
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={coachMode}
                    onChange={(e) => {
                      setCoachMode(e.target.checked);
                      if (window.toggleCoachMode) {
                        window.toggleCoachMode(e.target.checked);
                      }
                    }}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-lg font-medium">Coach Mode</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Side panel with coach suggestions and move history */}
          <div className="lg:w-1/3">
            {/* Coach Suggestions */}
            {coachMode && (
              <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
                <h2 className="text-xl font-bold mb-3 text-blue-800 border-b pb-2">Coach Suggestions</h2>
                
                {suggestion ? (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-blue-700">{suggestion}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Make a move to get suggestions</p>
                )}
              </div>
            )}
            
            {/* Move History */}
            <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-3 border-b pb-2">Move History</h2>
              
              {moveHistory.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <tbody>
                      {moveHistory.map((move, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-1 px-2 w-10 text-gray-500 font-medium">
                            {formatMoveNumber(move.index, move.color)}
                          </td>
                          <td className="py-1 px-2">
                            <span className={move.color === 'w' ? 'text-blue-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {move.san}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">No moves yet</p>
              )}
            </div>
            
            {/* Instructions */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-2">Instructions:</h2>
              <ul className="list-disc ml-6">
                <li className="mb-1">You play as White</li>
                <li className="mb-1">Drag pieces to make your move</li>
                <li className="mb-1">Toggle Coach Mode for suggestions</li>
                <li className="mb-1">Games are saved automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
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
    </div>
  );
}