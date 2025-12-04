/* ============================================
   MAIN.JS - Application Entry Point
   ============================================ */

import * as Game from "./game.js";
import * as UI from "./ui.js";
import * as Online from "./online.js";
import { copyToClipboard } from "./utils.js";

// Get DOM elements
const elements = UI.getElements();

/**
 * Initialize the application
 */
async function init() {
  console.log("🐷 Pig Game Deluxe - Initializing...");

  // Load saved stats
  Game.loadStats();

  // Set up event listeners
  setupEventListeners();

  // Check URL for room code (auto-join)
  const urlRoomCode = new URLSearchParams(window.location.search).get("room");
  if (urlRoomCode) {
    // Switch to online mode and try to join
    Game.setGameMode("online");
    UI.setActiveMode("online");
    UI.showOnlinePanel(true);

    // Initialize Firebase and try to join
    if (Online.initFirebase()) {
      await Online.checkURLForRoom();
    }
  } else {
    // Start with classic mode (no broadcast needed for local game)
    Game.init({ gameMode: "classic", winningScore: UI.getWinningScore() });
  }

  console.log("🐷 Pig Game Deluxe - Ready!");
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Game buttons
  elements.btnRoll.addEventListener("click", handleRoll);
  elements.btnHold.addEventListener("click", handleHold);
  elements.btnNew.addEventListener("click", handleNewGame);

  // Mode selection
  elements.modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => handleModeChange(btn.dataset.mode));
  });

  // Online buttons
  elements.btnCreateRoom.addEventListener("click", handleCreateRoom);
  elements.btnJoinRoom.addEventListener("click", handleJoinRoom);
  elements.btnCopyLink.addEventListener("click", handleCopyLink);
  elements.btnLeaveRoom.addEventListener("click", handleLeaveRoom);

  // Room code input - allow Enter to join
  elements.roomCodeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleJoinRoom();
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboard);

  // Settings changes
  elements.winningScoreInput.addEventListener("change", () => {
    const mode = Game.getGameMode();
    if (mode !== "online") {
      Game.init({ gameMode: mode, winningScore: UI.getWinningScore() });
    }
  });

  // Set up online callbacks
  Game.setOnlineCallbacks({
    onRoll: (diceValue) => Online.sendRoll(diceValue),
    onHold: (heldScore) => Online.sendHold(heldScore),
    onNewGame: () => Online.sendNewGame(),
  });
}

/**
 * Handle roll button click
 */
async function handleRoll() {
  await Game.roll();
}

/**
 * Handle hold button click
 */
function handleHold() {
  Game.hold();
}

/**
 * Handle new game button click
 */
function handleNewGame() {
  const mode = Game.getGameMode();

  if (mode === "online") {
    const roomInfo = Online.getRoomInfo();
    if (roomInfo.isConnected) {
      // User explicitly clicked New Game - broadcast to opponent
      Game.init({
        gameMode: mode,
        winningScore: UI.getWinningScore(),
        broadcast: true, // This will send "newGame" to opponent
      });
    } else {
      // Not connected, just reset locally
      Game.init({ gameMode: mode, winningScore: UI.getWinningScore() });
    }
  } else {
    // Local game - no broadcast needed
    Game.init({ gameMode: mode, winningScore: UI.getWinningScore() });
  }
}

/**
 * Handle game mode change
 * @param {string} mode - New game mode
 */
function handleModeChange(mode) {
  const currentMode = Game.getGameMode();

  // Leave online room if switching away from online
  if (currentMode === "online" && mode !== "online") {
    const roomInfo = Online.getRoomInfo();
    if (roomInfo.isConnected) {
      Online.leaveRoom();
    }
  }

  Game.setGameMode(mode);

  // Show/hide online panel
  UI.showOnlinePanel(mode === "online");
  UI.showAIDifficulty(mode === "vsai");
  UI.showAIBadge(mode === "vsai");

  // Initialize Firebase for online mode
  if (mode === "online") {
    Online.initFirebase();
    UI.showOnlineActions();
    UI.updateOnlineStatus(false, "Not Connected");
  } else {
    // Initialize local game (no broadcast)
    Game.init({ gameMode: mode, winningScore: UI.getWinningScore() });
  }
}

/**
 * Handle create room button
 */
async function handleCreateRoom() {
  elements.btnCreateRoom.disabled = true;
  elements.btnCreateRoom.innerHTML = "<span>Creating...</span>";

  const roomCode = await Online.createRoom();

  elements.btnCreateRoom.disabled = false;
  elements.btnCreateRoom.innerHTML =
    '<span class="icon">🎮</span><span>Create Room</span>';

  if (roomCode) {
    // Initialize game in waiting state (no broadcast - waiting for guest)
    Game.init({ gameMode: "online", winningScore: UI.getWinningScore() });
    UI.setButtonsEnabled(false, false);
    UI.showMessage("🎮", "Room created! Share the link.", 2000);
  }
}

/**
 * Handle join room button
 */
async function handleJoinRoom() {
  const roomCode = UI.getRoomCodeInput();

  if (!roomCode || roomCode.length < 4) {
    UI.showToast("Please enter a valid room code", "warning");
    return;
  }

  elements.btnJoinRoom.disabled = true;
  elements.btnJoinRoom.innerHTML = "<span>Joining...</span>";

  const success = await Online.joinRoom(roomCode);

  elements.btnJoinRoom.disabled = false;
  elements.btnJoinRoom.innerHTML = "<span>Join</span>";

  if (success) {
    // Initialize game (no broadcast - host will see guest connected)
    Game.init({ gameMode: "online", winningScore: UI.getWinningScore() });
  }
}

/**
 * Handle copy link button
 */
async function handleCopyLink() {
  const link = elements.inviteLink.value;
  const success = await copyToClipboard(link);

  if (success) {
    UI.setCopyButtonState(true);
    UI.showToast("Link copied to clipboard!", "success");

    setTimeout(() => {
      UI.setCopyButtonState(false);
    }, 2000);
  } else {
    UI.showToast("Failed to copy link", "error");
  }
}

/**
 * Handle leave room button
 */
function handleLeaveRoom() {
  Online.leaveRoom();
  Game.setGameMode("online");
  UI.showOnlineActions();
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e
 */
function handleKeyboard(e) {
  // Don't trigger if typing in an input
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
    return;
  }

  switch (e.code) {
    case "Space":
      e.preventDefault();
      handleRoll();
      break;
    case "Enter":
      e.preventDefault();
      handleHold();
      break;
    case "KeyN":
      handleNewGame();
      break;
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
