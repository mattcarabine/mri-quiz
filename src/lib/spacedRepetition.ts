import type { QuizItem } from '../types/quiz';

/**
 * Calculate priority score for an image based on spaced repetition factors.
 * Higher priority = more likely to be shown next.
 */
export function calculatePriority(item: QuizItem): number {
  let priority = 0;
  const now = Date.now();

  // New images (never seen): 50 points
  if (item.lastSeen === null) {
    priority += 50;
  }

  // Recently seen penalty: reduce priority based on recency
  if (item.lastSeen !== null) {
    const hoursSinceLastSeen = (now - item.lastSeen) / (1000 * 60 * 60);
    if (hoursSinceLastSeen < 1) {
      priority -= 20;
    } else if (hoursSinceLastSeen < 24) {
      priority -= 10;
    }
  }

  // Consecutive correct penalty: -5 per streak
  priority -= item.consecutiveCorrect * 5;

  // Due for review: +25 points
  if (item.nextReview <= now) {
    priority += 25;
  }

  // Incorrect boost is applied via priority field after updateItem
  // (it's added there, not calculated here)

  return Math.max(0, priority);
}

/**
 * Update a quiz item after an answer, applying modified SM-2 algorithm.
 */
export function updateItem(item: QuizItem, correct: boolean): QuizItem {
  const now = Date.now();

  if (correct) {
    // Correct answer: increase interval and adjust ease factor
    const newRepetitions = item.repetitions + 1;
    let newInterval: number;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(item.interval * item.easeFactor);
    }

    const newEaseFactor = Math.max(1.3, item.easeFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)));

    return {
      ...item,
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReview: now + newInterval * 24 * 60 * 60 * 1000,
      consecutiveCorrect: item.consecutiveCorrect + 1,
      lastSeen: now,
      priority: calculatePriority({ ...item, lastSeen: now, consecutiveCorrect: item.consecutiveCorrect + 1 }),
    };
  } else {
    // Incorrect answer: reset interval, decrease ease factor, add incorrect boost
    const newEaseFactor = Math.max(1.3, item.easeFactor - 0.2);

    return {
      ...item,
      easeFactor: newEaseFactor,
      interval: 1,
      repetitions: 0,
      nextReview: now + 1 * 24 * 60 * 60 * 1000,
      consecutiveCorrect: 0,
      lastSeen: now,
      priority: calculatePriority({ ...item, lastSeen: now, consecutiveCorrect: 0 }) + 30, // +30 incorrect boost
    };
  }
}

/**
 * Get a random position between 3 and 7 for reinserting missed images.
 */
export function getReinsertionPosition(): number {
  return Math.floor(Math.random() * 5) + 3; // Random between 3 and 7
}
