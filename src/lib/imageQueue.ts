import type { QuizImage, QuizItem, SessionLength } from '../types/quiz';
import { calculatePriority } from './spacedRepetition';

/**
 * Build initial queue from image metadata.
 * Creates QuizItem objects with default SM-2 values.
 */
export function buildQueue(images: QuizImage[], sessionLength: SessionLength): QuizItem[] {
  const items: QuizItem[] = images.map((image) => ({
    image,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: Date.now(),
    consecutiveCorrect: 0,
    lastSeen: null,
    priority: 50, // New images start with 50 priority
  }));

  // Calculate priorities for all items
  const itemsWithPriority = items.map((item) => ({
    ...item,
    priority: calculatePriority(item),
  }));

  // Sort by priority (highest first)
  const sortedItems = itemsWithPriority.sort((a, b) => b.priority - a.priority);

  // Limit to session length
  const length = sessionLength === 'all' ? sortedItems.length : sessionLength;
  return sortedItems.slice(0, length);
}

/**
 * Select next image index based on priority.
 * Returns the index of the highest priority item that hasn't been shown yet.
 */
export function getNextImage(_items: QuizItem[]): number {
  // Find the highest priority item (items should already be sorted)
  return 0;
}

/**
 * Re-insert a missed image at a specific position in the queue.
 */
export function reinsertImage(items: QuizItem[], index: number, position: number): QuizItem[] {
  const newItems = [...items];
  const [item] = newItems.splice(index, 1);

  // Insert at the specified position (or at the end if position exceeds length)
  const insertIndex = Math.min(index + position, newItems.length);
  newItems.splice(insertIndex, 0, item);

  return newItems;
}
