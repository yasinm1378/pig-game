/* ============================================
   ONLINE MODULE - Firebase Multiplayer
   ============================================ */

import { generateRoomCode, generateInviteLink, getRoomCodeFromURL, updateURLWithRoom } from './utils.js';
import * as UI from './ui.js';
import * as Game from './game.js';

// Firebase configuration
// ⚠️ IMPORTANT: Replace with your own Firebase config!
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Module state
let db = null;
let roomRef = null;
let currentRoom = null;
let localPlayerId = null; // 0 = host, 1 = guest
let isHost = false;
let initialized = false;
let cleanupListeners = [];

/**
 * Initialize Firebase
 * @returns {boolean} - Success status
 */
export function initFirebase() {
  try {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK not loaded');
      UI.showToast('Firebase not loaded. Online mode unavailable.', 'error');
      return false;
    }
    
    // Check if already initialized
    if (firebase.apps.length === 0) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    
    db = firebase.database();
    initialized = true;
    
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    UI.showToast('Failed to initialize online features', 'error');
    return false;
  }
}

/**
 * Check if Firebase is ready
 */
export function isReady() {
  return initialized && db !== null;
}

/**
 * Create a new room
 * @returns {Promise<string|null>} - Room code or null on failure
 */
export async function createRoom() {
  if (!isReady()) {
    if (!initFirebase()) return null;
  }
  
  try {
    const roomCode = generateRoomCode();
    const roomData = {
      code: roomCode,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      host: {
        connected: true,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
      },
      guest: null,
      gameState: {
        scores: [0, 0],
        currentScore: 0,
        activePlayer: 0,
        playing: false, // Wait for guest
        winningScore: UI.getWinningScore()
      },
      lastAction: null
    };
    
    roomRef = db.ref(`rooms/${roomCode}`);
    await roomRef.set(roomData);
    
    currentRoom = roomCode;
    localPlayerId = 0;
    isHost = true;
    
    // Set up presence
    setupPresence();
    
    // Listen for room changes
    setupRoomListeners();
    
    // Update URL
    updateURLWithRoom(roomCode);
    
    // Update UI
    const inviteLink = generateInviteLink(roomCode);
    UI.showInviteSection(inviteLink, true);
    UI.updateOnlineStatus(true, `Room: ${roomCode}`);
    
    Game.setLocalPlayer(0);
    
    UI.showToast('Room created! Waiting for opponent...', 'success');
    
    return roomCode;
  } catch (error) {
    console.error('Create room error:', error);
    UI.showToast('Failed to create room', 'error');
    return null;
  }
}

/**
 * Join an existing room
 * @param {string} roomCode - Room code to join
 * @returns {Promise<boolean>} - Success status
 */
export async function joinRoom(roomCode) {
  if (!isReady()) {
    if (!initFirebase()) return false;
  }
  
  roomCode = roomCode.toUpperCase().trim();
  
  try {
    roomRef = db.ref(`rooms/${roomCode}`);
    const snapshot = await roomRef.once('value');
    
    if (!snapshot.exists()) {
      UI.showToast('Room not found', 'error');
      return false;
    }
    
    const roomData = snapshot.val();
    
    // Check if room already has a guest
    if (roomData.guest && roomData.guest.connected) {
      UI.showToast('Room is full', 'error');
      return false;
    }
    
    // Join as guest
    await roomRef.child('guest').set({
      connected: true,
      lastSeen: firebase.database.ServerValue.TIMESTAMP
    });
    
    currentRoom = roomCode;
    localPlayerId = 1;
    isHost = false;
    
    // Set up presence
    setupPresence();
    
    // Listen for room changes
    setupRoomListeners();
    
    // Update URL
    updateURLWithRoom(roomCode);
    
    // Start the game
    await roomRef.child('gameState/playing').set(true);
    
    // Update UI
    const inviteLink = generateInviteLink(roomCode);
    UI.showInviteSection(inviteLink, false);
    UI.updateOnlineStatus(true, `Room: ${roomCode}`);
    UI.updateWaitingText('Game started!', true);
    setTimeout(() => UI.updateWaitingText('', false), 2000);
    
    Game.setLocalPlayer(1);
    
    UI.showToast('Joined room successfully!', 'success');
    
    return true;
  } catch (error) {
    console.error('Join room error:', error);
    UI.showToast('Failed to join room', 'error');
    return false;
  }
}

/**
 * Set up presence system for disconnect handling
 */
function setupPresence() {
  if (!roomRef) return;
  
  const playerPath = isHost ? 'host' : 'guest';
  const presenceRef = roomRef.child(playerPath);
  
  // Update last seen periodically
  const presenceInterval = setInterval(() => {
    if (roomRef) {
      presenceRef.update({
        lastSeen: firebase.database.ServerValue.TIMESTAMP
      });
    }
  }, 10000);
  
  // Handle disconnect
  presenceRef.onDisconnect().update({
    connected: false
  });
  
  cleanupListeners.push(() => {
    clearInterval(presenceInterval);
    presenceRef.onDisconnect().cancel();
  });
}

/**
 * Set up room listeners for state sync
 */
function setupRoomListeners() {
  if (!roomRef) return;
  
  // Listen for guest joining (host only)
  if (isHost) {
    const guestListener = roomRef.child('guest').on('value', (snapshot) => {
      const guest = snapshot.val();
      if (guest && guest.connected) {
        UI.updateWaitingText('Opponent connected! Starting game...', true);
        setTimeout(() => UI.updateWaitingText('', false), 2000);
        
        // Initialize game
        Game.init({
          gameMode: 'online',
          winningScore: UI.getWinningScore()
        });
      } else if (guest && !guest.connected && currentRoom) {
        UI.showToast('Opponent disconnected', 'warning');
      }
    });
    
    cleanupListeners.push(() => roomRef.child('guest').off('value', guestListener));
  }
  
  // Listen for game state changes
  const stateListener = roomRef.child('gameState').on('value', (snapshot) => {
    const state = snapshot.val();
    if (state) {
      // Only apply if game has started
      if (state.playing || state.winner !== undefined) {
        Game.applyOnlineState(state);
      }
    }
  });
  
  cleanupListeners.push(() => roomRef.child('gameState').off('value', stateListener));
  
  // Listen for actions from opponent
  const actionListener = roomRef.child('lastAction').on('value', async (snapshot) => {
    const action = snapshot.val();
    if (!action) return;
    
    // Ignore own actions
    if (action.player === localPlayerId) return;
    
    // Ignore old actions
    const now = Date.now();
    if (action.timestamp && now - action.timestamp > 5000) return;
    
    // Process opponent's action
    if (action.type === 'roll') {
      await Game.handleOpponentRoll(action.diceValue);
    } else if (action.type === 'hold') {
      Game.handleOpponentHold(action.heldScore);
    } else if (action.type === 'newGame') {
      Game.init({ gameMode: 'online', winningScore: UI.getWinningScore() });
      UI.showToast('Opponent started a new game', 'info');
    }
  });
  
  cleanupListeners.push(() => roomRef.child('lastAction').off('value', actionListener));
  
  // Listen for host disconnect (guest only)
  if (!isHost) {
    const hostListener = roomRef.child('host/connected').on('value', (snapshot) => {
      if (snapshot.val() === false) {
        UI.showToast('Host disconnected', 'warning');
      }
    });
    
    cleanupListeners.push(() => roomRef.child('host/connected').off('value', hostListener));
  }
}

/**
 * Send roll action to opponent
 * @param {number} diceValue - The dice value rolled
 */
export async function sendRoll(diceValue) {
  if (!roomRef) return;
  
  try {
    const gameState = Game.getState();
    
    await roomRef.update({
      'lastAction': {
        type: 'roll',
        player: localPlayerId,
        diceValue: diceValue,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      },
      'gameState/currentScore': gameState.currentScore,
      'gameState/activePlayer': gameState.activePlayer
    });
  } catch (error) {
    console.error('Send roll error:', error);
  }
}

/**
 * Send hold action to opponent
 * @param {number} heldScore - The score that was held
 */
export async function sendHold(heldScore) {
  if (!roomRef) return;
  
  try {
    const gameState = Game.getState();
    
    const updates = {
      'lastAction': {
        type: 'hold',
        player: localPlayerId,
        heldScore: heldScore,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      },
      'gameState/scores': gameState.scores,
      'gameState/currentScore': 0,
      'gameState/activePlayer': gameState.activePlayer
    };
    
    // Check for winner
    if (gameState.scores[localPlayerId] >= gameState.winningScore) {
      updates['gameState/playing'] = false;
      updates['gameState/winner'] = localPlayerId;
    }
    
    await roomRef.update(updates);
  } catch (error) {
    console.error('Send hold error:', error);
  }
}

/**
 * Send new game request
 */
export async function sendNewGame() {
  if (!roomRef) return;
  
  try {
    await roomRef.update({
      'lastAction': {
        type: 'newGame',
        player: localPlayerId,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      },
      'gameState': {
        scores: [0, 0],
        currentScore: 0,
        activePlayer: 0,
        playing: true,
        winningScore: UI.getWinningScore()
      }
    });
  } catch (error) {
    console.error('Send new game error:', error);
  }
}

/**
 * Leave current room
 */
export async function leaveRoom() {
  if (!roomRef) return;
  
  try {
    // Clean up listeners
    cleanupListeners.forEach(cleanup => cleanup());
    cleanupListeners = [];
    
    // Update connection status
    const playerPath = isHost ? 'host' : 'guest';
    await roomRef.child(`${playerPath}/connected`).set(false);
    
    // If host, optionally delete room
    // await roomRef.remove(); // Uncomment to delete room when host leaves
    
    roomRef = null;
    currentRoom = null;
    localPlayerId = null;
    isHost = false;
    
    // Update URL
    updateURLWithRoom(null);
    
    // Update UI
    UI.showOnlineActions();
    UI.updateOnlineStatus(false, 'Not Connected');
    UI.clearRoomCodeInput();
    
    Game.setLocalPlayer(null);
    
    UI.showToast('Left room', 'info');
  } catch (error) {
    console.error('Leave room error:', error);
  }
}

/**
 * Check URL for room code and auto-join
 */
export async function checkURLForRoom() {
  const roomCode = getRoomCodeFromURL();
  if (roomCode) {
    UI.showToast(`Joining room ${roomCode}...`, 'info');
    const success = await joinRoom(roomCode);
    if (!success) {
      updateURLWithRoom(null);
    }
    return success;
  }
  return false;
}

/**
 * Get current room info
 */
export function getRoomInfo() {
  return {
    roomCode: currentRoom,
    isHost,
    localPlayerId,
    isConnected: roomRef !== null
  };
}

/**
 * Clean up all connections (call on page unload)
 */
export function cleanup() {
  cleanupListeners.forEach(cleanup => cleanup());
  cleanupListeners = [];
  
  if (roomRef) {
    const playerPath = isHost ? 'host' : 'guest';
    roomRef.child(`${playerPath}/connected`).set(false);
  }
}

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}
