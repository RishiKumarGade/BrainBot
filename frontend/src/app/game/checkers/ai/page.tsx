// app/checkers/page.tsx
"use client";

import { useState, useEffect } from 'react';
import styles from './checkers.module.css';

type PieceType = 'red' | 'black' | null;
type KingStatus = boolean;
type PieceState = { type: PieceType; isKing: KingStatus };
type BoardState = PieceState[][];
type Position = { row: number; col: number };
type Move = {
  from: Position;
  to: Position;
  player: 'red' | 'black';
  isCapture: boolean;
  notation: string;
};

// API response type
type SuggestionResponse = {
  success: boolean;
  suggestion?: {
    from: Position;
    to: Position;
  };
  message?: string;
};

export default function CheckersPage() {
  const [board, setBoard] = useState<BoardState>([]);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [playerTurn, setPlayerTurn] = useState<'red' | 'black'>('red');
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [message, setMessage] = useState<string>("Your turn! Select a piece to move.");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [coachMode, setCoachMode] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<{from: Position; to: Position} | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize the board
  useEffect(() => {
    initializeBoard();
  }, []);

  // AI move when it's AI's turn (black)
  useEffect(() => {
    if (playerTurn === 'black' && !gameOver) {
      setMessage("AI is thinking...");
      
      // Add small delay to make AI move feel more natural
      const timeoutId = setTimeout(() => {
        makeAIMove();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [playerTurn, gameOver]);

  // Get coach suggestion when coach mode is enabled and it's player's turn
  useEffect(() => {
    if (coachMode && playerTurn === 'red' && !gameOver) {
      getCoachSuggestion();
    } else {
      setSuggestion(null);
      setApiError(null);
    }
  }, [coachMode, playerTurn, gameOver, board]);

  const initializeBoard = () => {
    const newBoard: BoardState = Array(8).fill(null).map(() => 
      Array(8).fill(null).map(() => ({ type: null, isKing: false }))
    );
    
    // Place black pieces (AI)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { type: 'black', isKing: false };
        }
      }
    }
    
    // Place red pieces (player)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { type: 'red', isKing: false };
        }
      }
    }
    
    setBoard(newBoard);
    setMoveHistory([]);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver || playerTurn !== 'red') return;
    
    // If a piece is already selected
    if (selectedPiece !== null) {
      // Check if clicked on a valid move position
      const moveIndex = validMoves.findIndex(
        move => move.row === row && move.col === col
      );
      
      if (moveIndex >= 0) {
        // Make the move
        makeMove(selectedPiece, { row, col });
        return;
      }
      
      // Reset selection if clicked elsewhere
      setSelectedPiece(null);
      setValidMoves([]);
    }
    
    // Selecting a new piece
    const piece = board[row][col];
    if (piece.type === 'red') {
      setSelectedPiece({ row, col });
      const moves = getValidMoves({ row, col }, board);
      setValidMoves(moves);
      
      if (moves.length === 0) {
        setMessage("No valid moves for this piece. Try another.");
      } else {
        setMessage("Select where to move.");
      }
    }
  };

  const makeMove = (from: Position, to: Position) => {
    const newBoard = JSON.parse(JSON.stringify(board)) as BoardState;
    const piece = { ...newBoard[from.row][from.col] };
    
    // Check if this is a jump/capture
    const isCapture = Math.abs(to.row - from.row) === 2;
    
    // Clear the original position
    newBoard[from.row][from.col] = { type: null, isKing: false };
    
    if (isCapture) {
      const captureRow = (from.row + to.row) / 2;
      const captureCol = (from.col + to.col) / 2;
      newBoard[captureRow][captureCol] = { type: null, isKing: false };
    }
    
    // Place the piece in the new position
    newBoard[to.row][to.col] = piece;
    
    // Check for king promotion
    if (to.row === 0 && piece.type === 'red') {
      newBoard[to.row][to.col].isKing = true;
    } else if (to.row === 7 && piece.type === 'black') {
      newBoard[to.row][to.col].isKing = true;
    }
    
    // Record move in history
    const notation = `${String.fromCharCode(97 + from.col)}${8 - from.row} → ${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    const moveRecord: Move = {
      from,
      to,
      player: playerTurn,
      isCapture,
      notation
    };
    setMoveHistory(prev => [...prev, moveRecord]);
    
    setBoard(newBoard);
    setSelectedPiece(null);
    setValidMoves([]);
    
    // Check if game is over after the move
    const gameStatus = checkGameStatus(newBoard);
    if (gameStatus) {
      setGameOver(true);
      setMessage(gameStatus === 'red' ? "You win! 🎉" : "AI wins. Try again?");
      return;
    }
    
    // Switch turns
    setPlayerTurn('black');
    setMessage("AI is thinking...");
  };

  const makeAIMove = () => {
    // Simple AI: Find all possible moves and choose one randomly
    const allMoves: { from: Position; to: Position }[] = [];
    
    // Find all black pieces and their possible moves
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col].type === 'black') {
          const moves = getValidMoves({ row, col }, board);
          moves.forEach(move => {
            allMoves.push({
              from: { row, col },
              to: move
            });
          });
        }
      }
    }
    
    // Prioritize captures if available
    const captures = allMoves.filter(
      move => Math.abs(move.to.row - move.from.row) === 2
    );
    
    if (captures.length > 0) {
      const move = captures[Math.floor(Math.random() * captures.length)];
      makeMove(move.from, move.to);
    } else if (allMoves.length > 0) {
      const move = allMoves[Math.floor(Math.random() * allMoves.length)];
      makeMove(move.from, move.to);
    } else {
      // No valid moves, AI loses
      setGameOver(true);
      setMessage("You win! AI has no valid moves left. 🎉");
      return;
    }
    
    setPlayerTurn('red');
    setMessage("Your turn! Select a piece to move.");
  };
  
  // Generate a board state string for API calls
  const generateBoardState = () => {
    return board.map(row => 
      row.map(cell => {
        if (!cell.type) return 'e'; // empty
        if (cell.type === 'red') return cell.isKing ? 'R' : 'r';
        return cell.isKing ? 'B' : 'b';
      }).join('')
    ).join('|');
  };
  
  // Get local random suggestion as fallback
  const getRandomSuggestion = () => {
    const allMoves: { from: Position; to: Position }[] = [];
    
    // Find all red pieces and their possible moves
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col].type === 'red') {
          const moves = getValidMoves({ row, col }, board);
          moves.forEach(move => {
            allMoves.push({
              from: { row, col },
              to: move
            });
          });
        }
      }
    }
    
    // Prioritize captures if available
    const captures = allMoves.filter(
      move => Math.abs(move.to.row - move.from.row) === 2
    );
    
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    } else if (allMoves.length > 0) {
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    }
    
    return null;
  };
  
  // Fetch suggestion from API with fallback to random suggestion
  const getCoachSuggestion = async () => {
    setIsLoadingSuggestion(true);
    setApiError(null);
    
    try {
      // Get the current board state for the API
      const boardState = generateBoardState();
      
      // In a real app, this would be an actual API endpoint
      const apiUrl = `/api/checkers/suggestion?board=${encodeURIComponent(boardState)}`;
      
      // Add a timeout to the fetch to handle slow responses
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(apiUrl, { 
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data: SuggestionResponse = await response.json();
        
        if (data.success && data.suggestion) {
          setSuggestion(data.suggestion);
        } else {
          throw new Error(data.message || "Unknown API error");
        }
      } catch (error) {
        // API call failed, use random suggestion as fallback
        console.error("API fetch failed, using fallback", error);
        setApiError(error instanceof Error ? error.message : "Failed to fetch suggestion");
        
        // Use random suggestion as fallback
        const randomSuggestion = getRandomSuggestion();
        setSuggestion(randomSuggestion);
      }
    } catch (error) {
      console.error("Error in getCoachSuggestion", error);
      // Final fallback if something goes wrong with the entire process
      const randomSuggestion = getRandomSuggestion();
      setSuggestion(randomSuggestion);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const getValidMoves = (position: Position, currentBoard: BoardState): Position[] => {
    const { row, col } = position;
    const piece = currentBoard[row][col];
    if (!piece.type) return [];
    
    const isKing = piece.isKing;
    const moves: Position[] = [];
    const directions = [];
    
    // Red moves up (decreasing row)
    if (piece.type === 'red' || isKing) {
      directions.push({ rowDir: -1, colDir: -1 });
      directions.push({ rowDir: -1, colDir: 1 });
    }
    
    // Black moves down (increasing row)
    if (piece.type === 'black' || isKing) {
      directions.push({ rowDir: 1, colDir: -1 });
      directions.push({ rowDir: 1, colDir: 1 });
    }
    
    // Check for jumps first (captures have priority)
    for (const { rowDir, colDir } of directions) {
      const jumpRow = row + rowDir * 2;
      const jumpCol = col + colDir * 2;
      const midRow = row + rowDir;
      const midCol = col + colDir;
      
      if (
        jumpRow >= 0 && jumpRow < 8 && 
        jumpCol >= 0 && jumpCol < 8 && 
        currentBoard[midRow][midCol].type && 
        currentBoard[midRow][midCol].type !== piece.type && 
        !currentBoard[jumpRow][jumpCol].type
      ) {
        moves.push({ row: jumpRow, col: jumpCol });
      }
    }
    
    // If there are jumps available, only return those
    if (moves.length > 0) return moves;
    
    // Otherwise check for regular moves
    for (const { rowDir, colDir } of directions) {
      const newRow = row + rowDir;
      const newCol = col + colDir;
      
      if (
        newRow >= 0 && newRow < 8 && 
        newCol >= 0 && newCol < 8 && 
        !currentBoard[newRow][newCol].type
      ) {
        moves.push({ row: newRow, col: newCol });
      }
    }
    
    return moves;
  };

  const checkGameStatus = (currentBoard: BoardState): 'red' | 'black' | null => {
    let redCount = 0;
    let blackCount = 0;
    
    // Count pieces
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (currentBoard[row][col].type === 'red') redCount++;
        if (currentBoard[row][col].type === 'black') blackCount++;
      }
    }
    
    if (redCount === 0) return 'black';
    if (blackCount === 0) return 'red';
    
    return null;
  };

  const resetGame = () => {
    initializeBoard();
    setSelectedPiece(null);
    setValidMoves([]);
    setPlayerTurn('red');
    setMessage("Your turn! Select a piece to move.");
    setGameOver(false);
    setSuggestion(null);
    setApiError(null);
  };

  const applySuggestion = () => {
    if (suggestion && playerTurn === 'red') {
      setSelectedPiece(suggestion.from);
      setValidMoves([suggestion.to]);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Checkers Game</h1>
      
      <div className={styles.gameContainer}>
        <div className={styles.boardContainer}>
          <div className={styles.gameInfo}>
            <p className={styles.message}>{message}</p>
            <p className={styles.turn}>
              Current turn: {playerTurn === 'red' ? 'You (Red)' : 'AI (Black)'}
            </p>
            <div className={styles.coachToggleContainer}>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={coachMode}
                  onChange={() => setCoachMode(!coachMode)}
                />
                <span className={styles.slider}></span>
              </label>
              <span className={styles.coachLabel}>Coach Mode</span>
            </div>
            
            {coachMode && playerTurn === 'red' && (
              <div className={styles.coachSuggestion}>
                {isLoadingSuggestion ? (
                  <p>Loading suggestion...</p>
                ) : suggestion ? (
                  <>
                    <p>Coach suggests: Move from {String.fromCharCode(97 + suggestion.from.col)}{8 - suggestion.from.row} to {String.fromCharCode(97 + suggestion.to.col)}{8 - suggestion.to.row}</p>
                    {/* {apiError && (
                      <p className={styles.apiError}>API Error: {apiError} (Using fallback suggestion)</p>
                    )} */}
                    <button className={styles.applyButton} onClick={applySuggestion}>
                      Apply Suggestion
                    </button>
                  </>
                ) : (
                  <p>No suggestions available.</p>
                )}
              </div>
            )}
          </div>
          
          <div className={styles.board}>
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.row}>
                {row.map((cell, colIndex) => {
                  const isBlackSquare = (rowIndex + colIndex) % 2 === 1;
                  const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
                  const isValidMove = validMoves.some(move => move.row === rowIndex && move.col === colIndex);
                  const isSuggested = suggestion?.from.row === rowIndex && suggestion?.from.col === colIndex;
                  const isSuggestedMove = suggestion?.to.row === rowIndex && suggestion?.to.col === colIndex;
                  
                  return (
                    <div 
                      key={colIndex}
                      className={`
                        ${styles.square} 
                        ${isBlackSquare ? styles.blackSquare : styles.whiteSquare}
                        ${isSelected ? styles.selected : ''}
                        ${isValidMove ? styles.validMove : ''}
                        ${isSuggested && coachMode ? styles.suggested : ''}
                        ${isSuggestedMove && coachMode ? styles.suggestedMove : ''}
                      `}
                      onClick={() => isBlackSquare ? handleSquareClick(rowIndex, colIndex) : null}
                    >
                      {cell.type && (
                        <div 
                          className={`
                            ${styles.piece} 
                            ${styles[cell.type]} 
                            ${cell.isKing ? styles.king : ''}
                          `}
                        />
                      )}
                      <div className={styles.squareNotation}>
                        {(rowIndex === 7 || colIndex === 0) && (
                          <span className={styles.notation}>
                            {rowIndex === 7 && String.fromCharCode(97 + colIndex)}
                            {colIndex === 0 && (8 - rowIndex)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          {gameOver && (
            <button className={styles.resetButton} onClick={resetGame}>
              Play Again
            </button>
          )}
        </div>
        
        <div className={styles.historyContainer}>
          <h2 className={styles.historyTitle}>Move History</h2>
          <div className={styles.historyList}>
            {moveHistory.length === 0 ? (
              <p className={styles.emptyHistory}>No moves yet.</p>
            ) : (
              moveHistory.map((move, index) => (
                <div 
                  key={index} 
                  className={`${styles.historyItem} ${move.player === 'red' ? styles.redMove : styles.blackMove}`}
                >
                  <span className={styles.moveNumber}>{Math.floor(index / 2) + 1}.{move.player === 'red' ? '' : '...'}</span>
                  <span className={styles.movePlayer}>{move.player === 'red' ? 'You' : 'AI'}</span>
                  <span className={styles.moveNotation}>{move.notation}</span>
                  {move.isCapture && <span className={styles.captureIcon}>×</span>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}