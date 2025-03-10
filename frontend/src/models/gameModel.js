const mongoose = require('mongoose');

// Define the schema for a chess game
const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true, // Ensures gameId is unique
  },
  finalFen: {
    type: String,
    required: true,
  },
  pgn: {
    type: String,
    required: true,
  },
  moves: {
    type: [String],  // Array of moves in the game
    required: true,
  },
  result: {
    type: String,  // Can be '1-0', '0-1', '1/2-1/2', 'unknown'
    required: true,
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString(), // Default to the current date if not provided
  },
  playerSide: {
    type: String,
    enum: ['white', 'black'],
    required: true,
    default: 'white',  
  },
  aiSide: {
    type: String,
    enum: ['white', 'black'],
    required: true,
    default: 'black', // AI is always black
  },
});

// Create a model for the game schema
const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
