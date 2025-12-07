/* ============================================
   ONLINE MODULE - Firebase Multiplayer
   ============================================ */

import {
  generateRoomCode,
  generateInviteLink,
  getRoomCodeFromURL,
  updateURLWithRoom,
} from "./utils.js";
import * as UI from "./ui.js";
import * as Game from "./game.js";

/* =============================================
   🔥 FIREBASE CONFIGURATION
   =============================================
   Replace the values below with your Firebase config.
   Get these from: Firebase Console → Project Settings → Your Apps
   ============================================= */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCVoT1prV36dogEfuCUku48lQMIC8UBCLQ",
  authDomain: "pig-game-online.firebaseapp.com",
  databaseURL: "https://pig-game-online-default-rtdb.firebaseio.com",
  projectId: "pig-game-online",
  storageBucket: "pig-game-online.firebasestorage.app",
  messagingSenderId: "276078031386",
  appId: "1:276078031386:web:872bf3c27ea0b9344e57a3",
};

/* =============================================
   END OF FIREBASE CONFIGURATION
   ============================================= */

// Module state
let db = null;
let roomRef = null;
let currentRoom = null;
let localPlayerId = null; // 0 = host, 1 = guest
let isHost = false;
let initialized = false;
let cleanupListeners = [];
let lastProcessedAction = null; // Track last processed action to avoid duplicates

/**
 * Initialize Firebase
 * @returns {boolean} - Success status
 */
export function initFirebase() {
  try {
    // Check if Firebase SDK is loaded
    if (typeof firebase === "undefined") {
      console.error("Firebase SDK not loaded");
      UI.showToast(
        "Firebase not loaded. Check your internet connection.",
        "error"
      );
      return false;
    }

    // Check if config is still placeholder
    if (FIREBASE_CONFIG.apiKey === "PASTE_YOUR_API_KEY_HERE") {
      console.error("Firebase config not set up");
      UI.showToast("Firebase not configured. See js/online.js", "error");
      return false;
    }

    // Check if already initialized
    if (firebase.apps.length === 0) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    db = firebase.database();
    initialized = true;

    console.log("✅ Firebase initialized successfully");
    return true;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    UI.showToast(
      "Failed to initialize online features: " + error.message,
      "error"
    );
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
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
      },
      guest: null,
      gameState: {
        scores: [0, 0],
        currentScore: 0,
        activePlayer: 0,
        playing: false, // Wait for guest
        winningScore: UI.getWinningScore(),
      },
      lastAction: null,
    };

    roomRef = db.ref(`rooms/${roomCode}`);
    await roomRef.set(roomData);

    currentRoom = roomCode;
    localPlayerId = 0;
    isHost = true;
    lastProcessedAction = null; // Reset action tracking

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

    UI.showToast("Room created! Waiting for opponent...", "success");

    return roomCode;
  } catch (error) {
    console.error("Create room error:", error);
    UI.showToast("Failed to create room: " + error.message, "error");
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
    const snapshot = await roomRef.once("value");

    if (!snapshot.exists()) {
      UI.showToast("Room not found", "error");
      return false;
    }

    const roomData = snapshot.val();

    // Check if room already has a guest
    if (roomData.guest && roomData.guest.connected) {
      UI.showToast("Room is full", "error");
      return false;
    }

    // Join as guest
    await roomRef.child("guest").set({
      connected: true,
      lastSeen: firebase.database.ServerValue.TIMESTAMP,
    });

    currentRoom = roomCode;
    localPlayerId = 1;
    isHost = false;
    lastProcessedAction = null; // Reset action tracking

    // Set up presence
    setupPresence();

    // Listen for room changes
    setupRoomListeners();

    // Update URL
    updateURLWithRoom(roomCode);

    // Start the game
    await roomRef.child("gameState/playing").set(true);

    // Update UI
    const inviteLink = generateInviteLink(roomCode);
    UI.showInviteSection(inviteLink, false);
    UI.updateOnlineStatus(true, `Room: ${roomCode}`);
    UI.updateWaitingText("Game started!", true);
    setTimeout(() => UI.updateWaitingText("", false), 2000);

    Game.setLocalPlayer(1);

    UI.showToast("Joined room successfully!", "success");

    return true;
  } catch (error) {
    console.error("Join room error:", error);
    UI.showToast("Failed to join room: " + error.message, "error");
    return false;
  }
}

/**
 * Set up presence system for disconnect handling
 */
function setupPresence() {
  if (!roomRef) return;

  const playerPath = isHost ? "host" : "guest";
  const presenceRef = roomRef.child(playerPath);

  // Update last seen periodically
  const presenceInterval = setInterval(() => {
    if (roomRef) {
      presenceRef
        .update({
          lastSeen: firebase.database.ServerValue.TIMESTAMP,
        })
        .catch(() => {}); // Ignore errors if room is gone
    }
  }, 10000);

  // Handle disconnect
  presenceRef.onDisconnect().update({
    connected: false,
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
    const guestListener = roomRef.child("guest").on("value", (snapshot) => {
      const guest = snapshot.val();
      if (guest && guest.connected) {
        UI.updateWaitingText("Opponent connected! Starting game...", true);
        setTimeout(() => UI.updateWaitingText("", false), 2000);

        // Initialize game locally - NO broadcast!
        Game.init({
          gameMode: "online",
          winningScore: UI.getWinningScore(),
          broadcast: false,
        });
      } else if (guest && !guest.connected && currentRoom) {
        UI.showToast("Opponent disconnected", "warning");
      }
    });

    cleanupListeners.push(() =>
      roomRef.child("guest").off("value", guestListener)
    );
  }

  // Listen for game state changes (only for initial sync and winner detection)
  const stateListener = roomRef.child("gameState").on("value", (snapshot) => {
    const state = snapshot.val();
    if (state) {
      // Only apply state sync in specific cases to avoid double-updates:
      // 1. Game just started (initial sync)
      // 2. Winner detected (game ended)
      // Action-based updates are handled by the lastAction listener
      if (state.winner !== undefined) {
        Game.applyOnlineState(state);
      }
    }
  });

  cleanupListeners.push(() =>
    roomRef.child("gameState").off("value", stateListener)
  );

  // Listen for actions from opponent
  const actionListener = roomRef.child("lastAction").on("value", (snapshot) => {
    const action = snapshot.val();
    if (!action) return;

    // Ignore own actions
    if (action.player === localPlayerId) return;

    // Create unique action ID using timestamp to prevent duplicate processing
    // This ensures consecutive identical rolls (e.g., two 6s) are both processed
    const actionId = `${action.type}-${action.player}-${action.timestamp}`;

    // Skip if we already processed this action
    if (lastProcessedAction === actionId) return;
    lastProcessedAction = actionId;

    // Process opponent's action
    if (action.type === "roll") {
      Game.handleOpponentRoll(action.diceValue);
    } else if (action.type === "hold") {
      Game.handleOpponentHold(action.heldScore);
    } else if (action.type === "newGame") {
      // Opponent started new game - init locally WITHOUT broadcasting back
      Game.init({
        gameMode: "online",
        winningScore: UI.getWinningScore(),
        broadcast: false,
      });
      UI.showToast("Opponent started a new game", "info");
    }
  });

  cleanupListeners.push(() =>
    roomRef.child("lastAction").off("value", actionListener)
  );

  // Listen for host disconnect (guest only)
  if (!isHost) {
    const hostListener = roomRef
      .child("host/connected")
      .on("value", (snapshot) => {
        if (snapshot.val() === false) {
          UI.showToast("Host disconnected", "warning");
        }
      });

    cleanupListeners.push(() =>
      roomRef.child("host/connected").off("value", hostListener)
    );
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
      lastAction: {
        type: "roll",
        player: localPlayerId,
        diceValue: diceValue,
        timestamp: Date.now(), // Use client timestamp for uniqueness
      },
      "gameState/currentScore": gameState.currentScore,
      "gameState/activePlayer": gameState.activePlayer,
    });
  } catch (error) {
    console.error("Send roll error:", error);
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
      lastAction: {
        type: "hold",
        player: localPlayerId,
        heldScore: heldScore,
        timestamp: Date.now(),
      },
      "gameState/scores": gameState.scores,
      "gameState/currentScore": 0,
      "gameState/activePlayer": gameState.activePlayer,
    };

    // Check for winner
    if (gameState.scores[localPlayerId] >= gameState.winningScore) {
      updates["gameState/playing"] = false;
      updates["gameState/winner"] = localPlayerId;
    }

    await roomRef.update(updates);
  } catch (error) {
    console.error("Send hold error:", error);
  }
}

/**
 * Send new game request
 */
export async function sendNewGame() {
  if (!roomRef) return;

  try {
    await roomRef.update({
      lastAction: {
        type: "newGame",
        player: localPlayerId,
        timestamp: Date.now(),
      },
      gameState: {
        scores: [0, 0],
        currentScore: 0,
        activePlayer: 0,
        playing: true,
        winningScore: UI.getWinningScore(),
      },
    });
  } catch (error) {
    console.error("Send new game error:", error);
  }
}

/**
 * Leave current room
 */
export async function leaveRoom() {
  if (!roomRef) return;

  try {
    // Clean up listeners
    cleanupListeners.forEach((cleanup) => cleanup());
    cleanupListeners = [];

    // Update connection status
    const playerPath = isHost ? "host" : "guest";
    await roomRef.child(`${playerPath}/connected`).set(false);

    roomRef = null;
    currentRoom = null;
    localPlayerId = null;
    isHost = false;
    lastProcessedAction = null;

    // Update URL
    updateURLWithRoom(null);

    // Update UI
    UI.showOnlineActions();
    UI.updateOnlineStatus(false, "Not Connected");
    UI.clearRoomCodeInput();

    Game.setLocalPlayer(null);

    UI.showToast("Left room", "info");
  } catch (error) {
    console.error("Leave room error:", error);
  }
}

/**
 * Check URL for room code and auto-join
 */
export async function checkURLForRoom() {
  const roomCode = getRoomCodeFromURL();
  if (roomCode) {
    UI.showToast(`Joining room ${roomCode}...`, "info");
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
    isConnected: roomRef !== null,
  };
}

/**
 * Clean up all connections (call on page unload)
 */
export function cleanup() {
  cleanupListeners.forEach((cleanup) => cleanup());
  cleanupListeners = [];

  if (roomRef) {
    const playerPath = isHost ? "host" : "guest";
    roomRef.child(`${playerPath}/connected`).set(false);
  }
}

// Clean up on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", cleanup);
}
