import { useCallback } from 'react';
import type { QuizItem } from '../types/quiz';
import { updateItem, getReinsertionPosition } from '../lib/spacedRepetition';
import { getNextImage, reinsertImage } from '../lib/imageQueue';

/**
 * Hook that wraps the spaced repetition library for React.
 *
 * @param items - Current quiz items
 * @returns Methods to get next image, record answers, and reinsert items
 */
export function useSpacedRepetition(items: QuizItem[]) {
  /**
   * Get the index of the next image to show based on priority.
   */
  const getNext = useCallback((): number => {
    return getNextImage(items);
  }, [items]);

  /**
   * Record an answer and update the quiz items.
   * On incorrect answer: updates item with SM-2 algorithm, then reinserts 3-7 positions ahead.
   *
   * @param index - Index of the answered item
   * @param correct - Whether the answer was correct
   * @returns Updated items array
   */
  const recordAnswer = useCallback(
    (index: number, correct: boolean): QuizItem[] => {
      const item = items[index];
      if (!item) return items;

      // Update item using SM-2 algorithm
      const updatedItem = updateItem(item, correct);

      // Create new items array with updated item
      const newItems = [...items];
      newItems[index] = updatedItem;

      // If incorrect, reinsert 3-7 positions ahead
      if (!correct) {
        const position = getReinsertionPosition();
        return reinsertImage(newItems, index, position);
      }

      return newItems;
    },
    [items]
  );

  /**
   * Manually reinsert an item at a specific position.
   *
   * @param items - Current items array
   * @param index - Index of item to reinsert
   * @returns Updated items array
   */
  const reinsert = useCallback(
    (itemsToUpdate: QuizItem[], index: number): QuizItem[] => {
      const position = getReinsertionPosition();
      return reinsertImage(itemsToUpdate, index, position);
    },
    []
  );

  return {
    getNext,
    recordAnswer,
    reinsert,
  };
}
