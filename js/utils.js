/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Dice dot patterns for 3x3 grid
 * Position indices: 
 * 0 1 2
 * 3 4 5
 * 6 7 8
 */
export const DICE_PATTERNS = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true]
};

/**
 * Generate a random dice roll (1-6)
 */
export function rollDiceValue() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Generate a random room code
 * @param {number} length - Length of the code
 * @returns {string} - Random alphanumeric code
 */
export function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, 1, I
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get room code from URL
 * @returns {string|null} - Room code if present
 */
export function getRoomCodeFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
}

/**
 * Update URL with room code
 * @param {string|null} roomCode - Room code to add or null to remove
 */
export function updateURLWithRoom(roomCode) {
  const url = new URL(window.location);
  if (roomCode) {
    url.searchParams.set('room', roomCode);
  } else {
    url.searchParams.delete('room');
  }
  window.history.replaceState({}, '', url);
}

/**
 * Generate invite link for a room
 * @param {string} roomCode - The room code
 * @returns {string} - Full invite URL
 */
export function generateInviteLink(roomCode) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('room', roomCode);
  return url.toString();
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

/**
 * Create confetti celebration effect
 */
export function createConfetti() {
  const colors = ['#ff6b9d', '#ffd93d', '#6bcb77', '#9d4edd', '#ff6b6b', '#4ea8de'];
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-20px';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.opacity = '1';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.width = (5 + Math.random() * 10) + 'px';
    confetti.style.height = (5 + Math.random() * 10) + 'px';
    document.body.appendChild(confetti);

    const animation = confetti.animate([
      { 
        top: '-20px', 
        opacity: 1,
        transform: `rotate(0deg) translateX(0)`
      },
      { 
        top: '100vh', 
        opacity: 0,
        transform: `rotate(${Math.random() * 720}deg) translateX(${(Math.random() - 0.5) * 200}px)`
      }
    ], {
      duration: 2000 + Math.random() * 2000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    animation.onfinish = () => confetti.remove();
  }
}

/**
 * Storage helper for localStorage with JSON support
 */
export const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Storage.get error:', e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage.set error:', e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep/delay helper
 * @param {number} ms - Milliseconds to wait
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
