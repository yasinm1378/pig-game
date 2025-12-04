/* ============================================
   AI MODULE - Computer Opponent Logic
   ============================================ */

/**
 * AI Difficulty configurations
 * Each has a different strategy for when to hold
 */
const AI_CONFIGS = {
  cautious: {
    name: 'Cautious Carl',
    baseHoldThreshold: 12,
    description: 'Plays it safe, holds early'
  },
  balanced: {
    name: 'Balanced Betty',
    baseHoldThreshold: 18,
    description: 'Balanced risk/reward approach'
  },
  risky: {
    name: 'Risky Rick',
    baseHoldThreshold: 28,
    description: 'Aggressive, keeps rolling'
  },
  optimal: {
    name: 'Optimal Otto',
    baseHoldThreshold: 20,
    description: 'Uses optimal strategy based on game state'
  }
};

/**
 * Get AI configuration
 * @param {string} difficulty 
 * @returns {object}
 */
export function getAIConfig(difficulty) {
  return AI_CONFIGS[difficulty] || AI_CONFIGS.balanced;
}

/**
 * Calculate the hold threshold for the AI
 * @param {string} difficulty - AI difficulty level
 * @param {object} gameState - Current game state
 * @returns {number} - Score threshold at which AI should hold
 */
export function calculateHoldThreshold(difficulty, gameState) {
  const { scores, currentScore, activePlayer, winningScore } = gameState;
  const aiScore = scores[activePlayer];
  const opponentScore = scores[1 - activePlayer];
  const config = AI_CONFIGS[difficulty];
  
  let threshold = config.baseHoldThreshold;
  
  if (difficulty === 'optimal') {
    // Optimal strategy adjusts based on multiple factors
    const scoreDiff = opponentScore - aiScore;
    const distanceToWin = winningScore - aiScore;
    
    // If behind, be more aggressive
    if (scoreDiff > 30) {
      threshold = 25;
    } else if (scoreDiff > 15) {
      threshold = 22;
    }
    // If ahead, be more conservative
    else if (scoreDiff < -30) {
      threshold = 15;
    } else if (scoreDiff < -15) {
      threshold = 17;
    }
    
    // If close to winning, adjust threshold to exactly what's needed
    if (currentScore + aiScore >= winningScore) {
      threshold = 0; // Hold immediately if we can win
    } else if (distanceToWin <= 20) {
      // Near the end, be more conservative
      threshold = Math.min(threshold, distanceToWin);
    }
    
    // If opponent is close to winning, be more aggressive
    if (winningScore - opponentScore <= 20) {
      threshold = Math.max(threshold, 22);
    }
  } else {
    // For non-optimal strategies, still check if we can win
    if (currentScore + aiScore >= winningScore) {
      threshold = 0;
    }
  }
  
  return threshold;
}

/**
 * Determine if AI should roll or hold
 * @param {string} difficulty - AI difficulty
 * @param {object} gameState - Current game state
 * @returns {string} - 'roll' or 'hold'
 */
export function getAIDecision(difficulty, gameState) {
  const threshold = calculateHoldThreshold(difficulty, gameState);
  
  // Small random factor for variability (except optimal)
  let adjustedThreshold = threshold;
  if (difficulty !== 'optimal') {
    adjustedThreshold += Math.floor(Math.random() * 5) - 2; // ±2 randomness
  }
  
  if (gameState.currentScore >= adjustedThreshold) {
    return 'hold';
  }
  
  return 'roll';
}

/**
 * Get delay before AI action (for more natural feel)
 * @returns {number} - Delay in milliseconds
 */
export function getAIDelay() {
  // Random delay between 800ms and 1500ms
  return 800 + Math.random() * 700;
}

/**
 * Get AI taunt/comment based on situation
 * @param {string} situation - 'rolled_one', 'big_roll', 'holding', 'winning'
 * @returns {string|null}
 */
export function getAIComment(situation) {
  const comments = {
    rolled_one: [
      '🤖 Oops!',
      '🤖 Bad luck!',
      '🤖 The dice betrayed me!'
    ],
    big_roll: [
      '🤖 Nice!',
      '🤖 Keep it coming!',
      '🤖 I\'m on fire!'
    ],
    holding: [
      '🤖 Playing it safe...',
      '🤖 I\'ll take that!',
      '🤖 Banking my points!'
    ],
    winning: [
      '🤖 Victory is mine!',
      '🤖 Better luck next time!',
      '🤖 GG!'
    ]
  };
  
  const options = comments[situation];
  if (!options) return null;
  
  return options[Math.floor(Math.random() * options.length)];
}
