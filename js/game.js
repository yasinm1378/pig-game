/* ============================================
   GAME MODULE - Core Game Logic
   ============================================ */

import { rollDiceValue, createConfetti, Storage } from './utils.js';
import * as UI from './ui.js';
import * as AI from './ai.js';

// Game State
let state = {
  scores: [0, 0],
  currentScore: 0,
  activePlayer: 0,
  playing: false,
  gameMode: 'classic',
  winningScore: 100,
  currentStreak: 0,
  isAITurn: false,
  timerCleanup: null,
  localPlayer: null // For online mode: 0 or 1
};

// Stats (persisted)
let stats = {
  gamesPlayed: 0,
  p1Wins: 0,
  p2Wins: 0,
  longestStreak: 0
};

// Callbacks for online mode
let onlineCallbacks = {
  onRoll: null,
  onHold: null,
  onNewGame: null
};

/**
 * Initialize/load stats from storage
 */
export function loadStats() {
  const savedStats = Storage.get('pigGameStats');
  if (savedStats) {
    stats = { ...stats, ...savedStats };
  }
  UI.updateStatsDisplay(stats);
}

/**
 * Save stats to storage
 */
function saveStats() {
  Storage.set('pigGameStats', stats);
  UI.updateStatsDisplay(stats);
}

/**
 * Get current game state
 */
export function getState() {
  return { ...state };
}

/**
 * Get current stats
 */
export function getStats() {
  return { ...stats };
}

/**
 * Set online callbacks
 */
export function setOnlineCallbacks(callbacks) {
  onlineCallbacks = { ...onlineCallbacks, ...callbacks };
}

/**
 * Set local player (for online mode)
 * @param {number|null} player - 0, 1, or null
 */
export function setLocalPlayer(player) {
  state.localPlayer = player;
  UI.showYouBadge(player);
}

/**
 * Check if it's local player's turn
 */
export function isLocalPlayerTurn() {
  if (state.localPlayer === null) return true; // Local game
  return state.activePlayer === state.localPlayer;
}

/**
 * Initialize new game
 * @param {object} options - Game options
 */
export function init(options = {}) {
  // Clean up previous timer
  if (state.timerCleanup) {
    state.timerCleanup();
    state.timerCleanup = null;
  }
  
  // Update state
  state.scores = [0, 0];
  state.currentScore = 0;
  state.activePlayer = 0;
  state.playing = true;
  state.currentStreak = 0;
  state.isAITurn = false;
  
  if (options.gameMode !== undefined) {
    state.gameMode = options.gameMode;
  }
  if (options.winningScore !== undefined) {
    state.winningScore = options.winningScore;
  }
  
  // Reset UI
  UI.resetUI();
  
  // Mode-specific setup
  UI.showAIBadge(state.gameMode === 'vsai');
  UI.showAIDifficulty(state.gameMode === 'vsai');
  UI.showOnlinePanel(state.gameMode === 'online');
  
  // Start timer for speed mode
  if (state.gameMode === 'speed') {
    startTurnTimer();
  }
  
  // Trigger online callback if set
  if (onlineCallbacks.onNewGame && state.gameMode === 'online') {
    onlineCallbacks.onNewGame(getState());
  }
}

/**
 * Start turn timer for speed mode
 */
function startTurnTimer() {
  if (state.timerCleanup) {
    state.timerCleanup();
  }
  
  state.timerCleanup = UI.startTimer(state.activePlayer, 30, () => {
    UI.showMessage('⏰', 'Time\'s up!');
    switchPlayer();
  });
}

/**
 * Switch to other player
 */
export function switchPlayer() {
  // Clean up timer
  if (state.timerCleanup) {
    state.timerCleanup();
    state.timerCleanup = null;
  }
  
  state.currentScore = 0;
  state.currentStreak = 0;
  UI.updateCurrentScore(state.activePlayer, 0);
  
  state.activePlayer = state.activePlayer === 0 ? 1 : 0;
  UI.setActivePlayer(state.activePlayer);
  
  // Speed mode timer
  if (state.gameMode === 'speed' && state.playing) {
    startTurnTimer();
  }
  
  // AI turn
  if (state.gameMode === 'vsai' && state.activePlayer === 1 && state.playing) {
    state.isAITurn = true;
    UI.setButtonsEnabled(false, false);
    setTimeout(executeAITurn, AI.getAIDelay());
  } else {
    state.isAITurn = false;
    
    // Online mode: disable controls if not your turn
    if (state.gameMode === 'online') {
      const canAct = isLocalPlayerTurn();
      UI.setButtonsEnabled(canAct, canAct);
    } else {
      UI.setButtonsEnabled(true, true);
    }
  }
}

/**
 * Roll dice action
 * @param {number|null} forcedValue - Force specific dice value (for online sync)
 * @returns {Promise<object>} - Roll result
 */
export async function roll(forcedValue = null) {
  if (!state.playing || state.isAITurn) {
    return null;
  }
  
  // Online mode: check if it's local player's turn
  if (state.gameMode === 'online' && !isLocalPlayerTurn()) {
    return null;
  }
  
  UI.setButtonsEnabled(false, false);
  UI.showDice();
  
  // Animate dice roll
  await UI.animateDiceRoll();
  
  // Get dice value
  const diceValue = forcedValue !== null ? forcedValue : rollDiceValue();
  UI.renderDice(diceValue);
  
  // Notify online opponent
  if (onlineCallbacks.onRoll && state.gameMode === 'online' && forcedValue === null) {
    onlineCallbacks.onRoll(diceValue);
  }
  
  if (diceValue !== 1) {
    // Good roll
    state.currentScore += diceValue;
    state.currentStreak++;
    
    // Update longest streak
    if (state.currentStreak > stats.longestStreak) {
      stats.longestStreak = state.currentStreak;
      saveStats();
    }
    
    UI.updateCurrentScore(state.activePlayer, state.currentScore);
    UI.setButtonsEnabled(isLocalPlayerTurn(), isLocalPlayerTurn());
    
    return { value: diceValue, busted: false };
  } else {
    // Rolled a 1 - bust!
    UI.animateRolledOne();
    UI.showMessage('😱', 'Rolled a 1!');
    state.currentStreak = 0;
    
    setTimeout(() => {
      switchPlayer();
    }, 1500);
    
    return { value: diceValue, busted: true };
  }
}

/**
 * Hold action - bank current score
 */
export function hold() {
  if (!state.playing || state.isAITurn || state.currentScore === 0) {
    return false;
  }
  
  // Online mode: check if it's local player's turn
  if (state.gameMode === 'online' && !isLocalPlayerTurn()) {
    return false;
  }
  
  // Add current score to total
  state.scores[state.activePlayer] += state.currentScore;
  UI.updateScore(state.activePlayer, state.scores[state.activePlayer], true);
  
  // Notify online opponent
  if (onlineCallbacks.onHold && state.gameMode === 'online') {
    onlineCallbacks.onHold(state.currentScore);
  }
  
  // Check for winner
  if (state.scores[state.activePlayer] >= state.winningScore) {
    endGame(state.activePlayer);
    return true;
  }
  
  state.currentStreak = 0;
  switchPlayer();
  return true;
}

/**
 * End game with winner
 * @param {number} winner - Winner player index
 */
function endGame(winner) {
  state.playing = false;
  
  // Clean up timer
  if (state.timerCleanup) {
    state.timerCleanup();
    state.timerCleanup = null;
  }
  
  UI.setWinner(winner);
  UI.setButtonsEnabled(false, false);
  UI.showMessage('🏆', `Player ${winner + 1} Wins!`, 3000);
  createConfetti();
  
  // Update stats
  stats.gamesPlayed++;
  if (winner === 0) {
    stats.p1Wins++;
  } else {
    stats.p2Wins++;
  }
  saveStats();
}

/**
 * Execute AI turn
 */
async function executeAITurn() {
  if (!state.playing || state.activePlayer !== 1) {
    return;
  }
  
  const difficulty = UI.getAIDifficulty();
  const decision = AI.getAIDecision(difficulty, {
    scores: state.scores,
    currentScore: state.currentScore,
    activePlayer: state.activePlayer,
    winningScore: state.winningScore
  });
  
  if (decision === 'roll') {
    await aiRoll();
  } else {
    aiHold();
  }
}

/**
 * AI rolls the dice
 */
async function aiRoll() {
  UI.showDice();
  await UI.animateDiceRoll();
  
  const diceValue = rollDiceValue();
  UI.renderDice(diceValue);
  
  if (diceValue !== 1) {
    state.currentScore += diceValue;
    UI.updateCurrentScore(1, state.currentScore);
    
    // Continue AI turn after delay
    setTimeout(executeAITurn, AI.getAIDelay());
  } else {
    // AI busted
    UI.animateRolledOne();
    UI.showMessage('🤖', 'AI rolled a 1!');
    
    setTimeout(() => {
      state.isAITurn = false;
      switchPlayer();
    }, 1500);
  }
}

/**
 * AI holds
 */
function aiHold() {
  state.scores[1] += state.currentScore;
  UI.updateScore(1, state.scores[1], true);
  
  // Check for winner
  if (state.scores[1] >= state.winningScore) {
    endGame(1);
    UI.showMessage('🤖', 'AI Wins!', 3000);
    return;
  }
  
  state.isAITurn = false;
  switchPlayer();
}

/**
 * Apply state from online sync
 * @param {object} newState - State from server
 */
export function applyOnlineState(newState) {
  state.scores = [...newState.scores];
  state.currentScore = newState.currentScore;
  state.activePlayer = newState.activePlayer;
  state.playing = newState.playing;
  
  // Update UI
  UI.updateScore(0, state.scores[0]);
  UI.updateScore(1, state.scores[1]);
  UI.updateCurrentScore(state.activePlayer, state.currentScore);
  UI.setActivePlayer(state.activePlayer);
  
  // Update button states
  const canAct = isLocalPlayerTurn() && state.playing;
  UI.setButtonsEnabled(canAct, canAct);
  
  if (!state.playing && newState.winner !== undefined) {
    UI.setWinner(newState.winner);
  }
}

/**
 * Handle opponent's roll in online mode
 * @param {number} diceValue - The value opponent rolled
 */
export async function handleOpponentRoll(diceValue) {
  UI.showDice();
  await UI.animateDiceRoll();
  UI.renderDice(diceValue);
  
  if (diceValue !== 1) {
    state.currentScore += diceValue;
    UI.updateCurrentScore(state.activePlayer, state.currentScore);
  } else {
    UI.animateRolledOne();
    UI.showMessage('😱', 'Opponent rolled a 1!');
    
    setTimeout(() => {
      switchPlayer();
    }, 1500);
  }
}

/**
 * Handle opponent's hold in online mode
 * @param {number} heldScore - Score that was held
 */
export function handleOpponentHold(heldScore) {
  state.scores[state.activePlayer] += heldScore;
  UI.updateScore(state.activePlayer, state.scores[state.activePlayer], true);
  
  if (state.scores[state.activePlayer] >= state.winningScore) {
    endGame(state.activePlayer);
  } else {
    switchPlayer();
  }
}

/**
 * Set game mode
 * @param {string} mode - 'classic', 'speed', 'vsai', 'online'
 */
export function setGameMode(mode) {
  state.gameMode = mode;
  UI.setActiveMode(mode);
}

/**
 * Get current game mode
 */
export function getGameMode() {
  return state.gameMode;
}
