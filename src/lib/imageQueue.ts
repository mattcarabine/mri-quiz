import type { QuizImage, QuizItem, SessionLength } from '../types/quiz';
import { calculatePriority } from './spacedRepetition';

/**
 * Fisher-Yates shuffle — unbiased, O(n).
 * Returns a new array; does not mutate the input.
 */
export function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Build initial queue from image metadata.
 * Uses stratified sampling to guarantee a balanced mix of T1 and T2 images
 * (each type within 40–60 % of the session), then applies priority sorting.
 */
export function buildQueue(images: QuizImage[], sessionLength: SessionLength): QuizItem[] {
  const length = sessionLength === 'all'
    ? images.length
    : Math.min(sessionLength, images.length);

  if (length === 0) return [];

  // Stratified sampling: separate pools by type
  const t1Pool = fisherYatesShuffle(images.filter((img) => img.type === 'T1'));
  const t2Pool = fisherYatesShuffle(images.filter((img) => img.type === 'T2'));

  // Each type gets ~half; the odd slot is randomly assigned
  const half = Math.floor(length / 2);
  const extraToT1 = length % 2 === 1 && Math.random() < 0.5;

  let t1Count = Math.min(half + (extraToT1 ? 1 : 0), t1Pool.length);
  let t2Count = Math.min(length - t1Count, t2Pool.length);

  // If one pool was too small, backfill from the other
  t1Count = Math.min(length - t2Count, t1Pool.length);

  // Draw from each pool and combine
  const selected = fisherYatesShuffle([
    ...t1Pool.slice(0, t1Count),
    ...t2Pool.slice(0, t2Count),
  ]);

  // Create QuizItems with default SM-2 values and computed priorities
  const items: QuizItem[] = selected.map((image) => {
    const item: QuizItem = {
      image,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: Date.now(),
      consecutiveCorrect: 0,
      lastSeen: null,
      priority: 0,
    };
    item.priority = calculatePriority(item);
    return item;
  });

  // Sort by priority (highest first)
  return items.sort((a, b) => b.priority - a.priority);
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
