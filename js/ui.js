/* ============================================
   UI MODULE - DOM Manipulation
   ============================================ */

import { DICE_PATTERNS } from './utils.js';

// DOM Element Cache
const elements = {
  // Players
  player0: document.getElementById('player-0'),
  player1: document.getElementById('player-1'),
  score0: document.getElementById('score-0'),
  score1: document.getElementById('score-1'),
  current0: document.getElementById('current-0'),
  current1: document.getElementById('current-1'),
  player0Name: document.getElementById('player-0-name'),
  player1Name: document.getElementById('player-1-name'),
  youBadge0: document.getElementById('you-badge-0'),
  youBadge1: document.getElementById('you-badge-1'),
  aiBadge: document.getElementById('ai-badge'),
  
  // Dice
  dice: document.getElementById('dice'),
  diceDots: document.getElementById('dice-dots'),
  
  // Buttons
  btnRoll: document.getElementById('btn-roll'),
  btnHold: document.getElementById('btn-hold'),
  btnNew: document.getElementById('btn-new'),
  
  // Timer
  timer0: document.getElementById('timer-0'),
  timer1: document.getElementById('timer-1'),
  timerBar0: document.getElementById('timer-bar-0'),
  timerBar1: document.getElementById('timer-bar-1'),
  
  // Message
  messageDisplay: document.getElementById('message-display'),
  messageEmoji: document.getElementById('message-emoji'),
  messageText: document.getElementById('message-text'),
  
  // Online
  onlinePanel: document.getElementById('online-panel'),
  onlineStatus: document.getElementById('online-status'),
  onlineActions: document.getElementById('online-actions'),
  inviteSection: document.getElementById('invite-section'),
  inviteLink: document.getElementById('invite-link'),
  roomCodeInput: document.getElementById('room-code-input'),
  waitingText: document.getElementById('waiting-text'),
  btnCreateRoom: document.getElementById('btn-create-room'),
  btnJoinRoom: document.getElementById('btn-join-room'),
  btnCopyLink: document.getElementById('btn-copy-link'),
  btnLeaveRoom: document.getElementById('btn-leave-room'),
  
  // Settings
  winningScoreInput: document.getElementById('winning-score'),
  aiDifficultySetting: document.getElementById('ai-difficulty-setting'),
  aiDifficultySelect: document.getElementById('ai-difficulty'),
  
  // Stats
  gamesPlayed: document.getElementById('games-played'),
  p1Wins: document.getElementById('p1-wins'),
  p2Wins: document.getElementById('p2-wins'),
  longestStreak: document.getElementById('longest-streak'),
  
  // Mode buttons
  modeButtons: document.querySelectorAll('.mode-btn'),
  
  // Toast
  toastContainer: document.getElementById('toast-container')
};

/**
 * Get cached DOM elements
 */
export function getElements() {
  return elements;
}

/**
 * Update player score display
 * @param {number} player - Player index (0 or 1)
 * @param {number} score - Score value
 * @param {boolean} animate - Whether to animate
 */
export function updateScore(player, score, animate = false) {
  const scoreEl = elements[`score${player}`];
  scoreEl.textContent = score;
  
  if (animate) {
    scoreEl.classList.add('bump');
    setTimeout(() => scoreEl.classList.remove('bump'), 300);
  }
}

/**
 * Update current score display
 * @param {number} player - Player index
 * @param {number} score - Current score
 */
export function updateCurrentScore(player, score) {
  elements[`current${player}`].textContent = score;
}

/**
 * Set active player visually
 * @param {number} player - Player index
 */
export function setActivePlayer(player) {
  elements.player0.classList.toggle('active', player === 0);
  elements.player1.classList.toggle('active', player === 1);
}

/**
 * Set winner state
 * @param {number} player - Winning player index
 */
export function setWinner(player) {
  elements[`player${player}`].classList.add('winner');
}

/**
 * Clear winner state from both players
 */
export function clearWinnerState() {
  elements.player0.classList.remove('winner');
  elements.player1.classList.remove('winner');
}

/**
 * Render dice with dot pattern
 * @param {number} value - Dice value (1-6)
 */
export function renderDice(value) {
  const pattern = DICE_PATTERNS[value];
  elements.diceDots.innerHTML = pattern.map((visible) => 
    `<div class="dot ${visible ? 'visible' : ''}"></div>`
  ).join('');
}

/**
 * Show dice element
 */
export function showDice() {
  elements.dice.classList.remove('hidden');
}

/**
 * Hide dice element
 */
export function hideDice() {
  elements.dice.classList.add('hidden');
}

/**
 * Trigger dice roll animation
 * @returns {Promise} - Resolves when animation completes
 */
export function animateDiceRoll() {
  return new Promise(resolve => {
    elements.dice.classList.remove('rolled-one');
    elements.dice.classList.add('rolling');
    setTimeout(() => {
      elements.dice.classList.remove('rolling');
      resolve();
    }, 600);
  });
}

/**
 * Trigger rolled-one animation
 */
export function animateRolledOne() {
  elements.dice.classList.add('rolled-one');
}

/**
 * Reset dice state
 */
export function resetDice() {
  elements.dice.classList.remove('rolled-one', 'rolling');
  hideDice();
}

/**
 * Enable/disable game buttons
 * @param {boolean} rollEnabled 
 * @param {boolean} holdEnabled 
 */
export function setButtonsEnabled(rollEnabled, holdEnabled) {
  elements.btnRoll.disabled = !rollEnabled;
  elements.btnHold.disabled = !holdEnabled;
}

/**
 * Show AI badge
 * @param {boolean} show 
 */
export function showAIBadge(show) {
  elements.aiBadge.classList.toggle('hidden', !show);
}

/**
 * Show "YOU" badge for a player
 * @param {number|null} player - Player index or null to hide both
 */
export function showYouBadge(player) {
  elements.youBadge0.classList.toggle('hidden', player !== 0);
  elements.youBadge1.classList.toggle('hidden', player !== 1);
}

/**
 * Show AI difficulty setting
 * @param {boolean} show 
 */
export function showAIDifficulty(show) {
  elements.aiDifficultySetting.classList.toggle('hidden', !show);
}

/**
 * Show/hide online panel
 * @param {boolean} show 
 */
export function showOnlinePanel(show) {
  elements.onlinePanel.classList.toggle('visible', show);
}

/**
 * Update online status display
 * @param {boolean} connected 
 * @param {string} text 
 */
export function updateOnlineStatus(connected, text) {
  const statusDot = elements.onlineStatus.querySelector('.status-dot');
  const statusText = elements.onlineStatus.querySelector('.status-text');
  
  statusDot.classList.toggle('connected', connected);
  statusText.textContent = text;
}

/**
 * Show room creation/joining UI
 */
export function showOnlineActions() {
  elements.onlineActions.classList.remove('hidden');
  elements.inviteSection.classList.add('hidden');
}

/**
 * Show invite link section
 * @param {string} link - Invite link
 * @param {boolean} isHost - Whether current user is host
 */
export function showInviteSection(link, isHost) {
  elements.onlineActions.classList.add('hidden');
  elements.inviteSection.classList.remove('hidden');
  elements.inviteLink.value = link;
  elements.waitingText.classList.toggle('hidden', !isHost);
}

/**
 * Update waiting text
 * @param {string} text 
 * @param {boolean} show 
 */
export function updateWaitingText(text, show = true) {
  elements.waitingText.textContent = text;
  elements.waitingText.classList.toggle('hidden', !show);
}

/**
 * Set copy button state
 * @param {boolean} copied 
 */
export function setCopyButtonState(copied) {
  elements.btnCopyLink.classList.toggle('copied', copied);
  elements.btnCopyLink.textContent = copied ? '✓ Copied!' : '📋 Copy';
}

/**
 * Show message popup
 * @param {string} emoji 
 * @param {string} text 
 * @param {number} duration - Duration in ms
 */
export function showMessage(emoji, text, duration = 1500) {
  elements.messageEmoji.textContent = emoji;
  elements.messageText.textContent = text;
  elements.messageDisplay.classList.add('show');
  
  setTimeout(() => {
    elements.messageDisplay.classList.remove('show');
  }, duration);
}

/**
 * Show toast notification
 * @param {string} message 
 * @param {string} type - 'info', 'success', 'error', 'warning'
 */
export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Update stats display
 * @param {object} stats 
 */
export function updateStatsDisplay(stats) {
  elements.gamesPlayed.textContent = stats.gamesPlayed;
  elements.p1Wins.textContent = stats.p1Wins;
  elements.p2Wins.textContent = stats.p2Wins;
  elements.longestStreak.textContent = stats.longestStreak;
}

/**
 * Set active mode button
 * @param {string} mode 
 */
export function setActiveMode(mode) {
  elements.modeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

/**
 * Get winning score from input
 * @returns {number}
 */
export function getWinningScore() {
  return parseInt(elements.winningScoreInput.value) || 100;
}

/**
 * Get AI difficulty setting
 * @returns {string}
 */
export function getAIDifficulty() {
  return elements.aiDifficultySelect.value;
}

/**
 * Get room code from input
 * @returns {string}
 */
export function getRoomCodeInput() {
  return elements.roomCodeInput.value.toUpperCase().trim();
}

/**
 * Clear room code input
 */
export function clearRoomCodeInput() {
  elements.roomCodeInput.value = '';
}

/**
 * Start turn timer
 * @param {number} player - Player index
 * @param {number} duration - Duration in seconds
 * @param {Function} onExpire - Callback when timer expires
 * @returns {Function} - Cleanup function
 */
export function startTimer(player, duration, onExpire) {
  const timerEl = elements[`timer${player}`];
  const timerBar = elements[`timerBar${player}`];
  
  // Clear other timer
  document.querySelectorAll('.turn-timer').forEach(t => t.classList.remove('active'));
  
  timerEl.classList.add('active');
  timerBar.style.width = '100%';
  timerBar.classList.remove('warning');
  
  let timeLeft = duration;
  
  const interval = setInterval(() => {
    timeLeft -= 0.1;
    const percentage = (timeLeft / duration) * 100;
    timerBar.style.width = `${percentage}%`;
    
    if (percentage < 30) {
      timerBar.classList.add('warning');
    }
    
    if (timeLeft <= 0) {
      clearInterval(interval);
      timerEl.classList.remove('active');
      onExpire();
    }
  }, 100);
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
    timerEl.classList.remove('active');
  };
}

/**
 * Stop all timers
 */
export function stopAllTimers() {
  document.querySelectorAll('.turn-timer').forEach(t => t.classList.remove('active'));
}

/**
 * Reset entire UI to initial state
 */
export function resetUI() {
  updateScore(0, 0);
  updateScore(1, 0);
  updateCurrentScore(0, 0);
  updateCurrentScore(1, 0);
  setActivePlayer(0);
  clearWinnerState();
  resetDice();
  setButtonsEnabled(true, true);
  stopAllTimers();
  showYouBadge(null);
}
