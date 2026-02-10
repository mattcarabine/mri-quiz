import { describe, it, expect } from 'vitest';
import { buildQueue, getNextImage, reinsertImage } from '../imageQueue';
import type { QuizImage, SessionLength } from '../../types/quiz';

describe('imageQueue', () => {
  const createMockImages = (count: number): QuizImage[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `img-${i + 1}`,
      filename: `image-${i + 1}.jpg`,
      type: i % 2 === 0 ? ('T1' as const) : ('T2' as const),
      subject: `Subject${i + 1}`,
    }));
  };

  describe('buildQueue', () => {
    it('should create QuizItems with default SM-2 values', () => {
      const images = createMockImages(5);
      const queue = buildQueue(images, 5);

      expect(queue).toHaveLength(5);
      queue.forEach((item) => {
        expect(item).toHaveProperty('image');
        expect(item.easeFactor).toBe(2.5);
        expect(item.interval).toBe(0);
        expect(item.repetitions).toBe(0);
        expect(item.consecutiveCorrect).toBe(0);
        expect(item.lastSeen).toBeNull();
        // Priority is recalculated: new (50) + due for review (25) = 75
        expect(item.priority).toBe(75);
      });
    });

    it('should limit queue to sessionLength 20', () => {
      const images = createMockImages(100);
      const queue = buildQueue(images, 20);

      expect(queue).toHaveLength(20);
    });

    it('should limit queue to sessionLength 50', () => {
      const images = createMockImages(100);
      const queue = buildQueue(images, 50);

      expect(queue).toHaveLength(50);
    });

    it('should limit queue to sessionLength 100', () => {
      const images = createMockImages(150);
      const queue = buildQueue(images, 100);

      expect(queue).toHaveLength(100);
    });

    it('should return all images when sessionLength is "all"', () => {
      const images = createMockImages(25);
      const queue = buildQueue(images, 'all');

      expect(queue).toHaveLength(25);
    });

    it('should handle edge case of fewer images than sessionLength', () => {
      const images = createMockImages(10);
      const queue = buildQueue(images, 50);

      expect(queue).toHaveLength(10);
    });

    it('should sort items by priority (highest first)', () => {
      const images = createMockImages(10);
      const queue = buildQueue(images, 10);

      // All new items should have same priority (50)
      for (let i = 0; i < queue.length - 1; i++) {
        expect(queue[i].priority).toBeGreaterThanOrEqual(queue[i + 1].priority);
      }
    });

    it('should handle empty image array', () => {
      const queue = buildQueue([], 20);
      expect(queue).toHaveLength(0);
    });

    it('should preserve image type distribution', () => {
      const images = createMockImages(100); // 50 T1, 50 T2
      const queue = buildQueue(images, 100);

      const t1Count = queue.filter((item) => item.image.type === 'T1').length;
      const t2Count = queue.filter((item) => item.image.type === 'T2').length;

      expect(t1Count).toBe(50);
      expect(t2Count).toBe(50);
    });
  });

  describe('getNextImage', () => {
    it('should return 0 (highest priority item)', () => {
      const images = createMockImages(10);
      const queue = buildQueue(images, 10);

      const nextIndex = getNextImage(queue);
      expect(nextIndex).toBe(0);
    });

    it('should always return 0 for any non-empty queue', () => {
      const images = createMockImages(5);
      const queue = buildQueue(images, 5);

      // Call multiple times - should always be 0 since items are sorted by priority
      expect(getNextImage(queue)).toBe(0);
      expect(getNextImage(queue)).toBe(0);
      expect(getNextImage(queue)).toBe(0);
    });
  });

  describe('reinsertImage', () => {
    it('should move item from current position to specified position ahead', () => {
      const images = createMockImages(10);
      const queue = buildQueue(images, 10);
      const originalFirstItem = queue[0];

      // Reinsert first item 3 positions ahead
      const newQueue = reinsertImage(queue, 0, 3);

      // Original first item should now be at position 3
      expect(newQueue[3]).toEqual(originalFirstItem);
      expect(newQueue).toHaveLength(10);
    });

    it('should not modify original queue (immutable)', () => {
      const images = createMockImages(5);
      const queue = buildQueue(images, 5);
      const originalQueue = [...queue];

      reinsertImage(queue, 0, 2);

      // Original should be unchanged
      expect(queue).toEqual(originalQueue);
    });

    it('should handle reinsertion at the end if position exceeds length', () => {
      const images = createMockImages(5);
      const queue = buildQueue(images, 5);
      const firstItem = queue[0];

      // Try to insert 100 positions ahead (should go to end)
      const newQueue = reinsertImage(queue, 0, 100);

      expect(newQueue[newQueue.length - 1]).toEqual(firstItem);
      expect(newQueue).toHaveLength(5);
    });

    it('should reorder items correctly when moving from middle', () => {
      const images = createMockImages(5);
      const queue = buildQueue(images, 5);
      const itemIds = queue.map((q) => q.image.id);

      // Move item at index 2, 2 positions ahead
      const newQueue = reinsertImage(queue, 2, 2);
      const newIds = newQueue.map((q) => q.image.id);

      // Item originally at 2 should now be at 4 (2 + 2)
      expect(newIds[4]).toBe(itemIds[2]);
    });

    it('should handle single-item queue', () => {
      const images = createMockImages(1);
      const queue = buildQueue(images, 1);

      const newQueue = reinsertImage(queue, 0, 5);

      expect(newQueue).toHaveLength(1);
      expect(newQueue[0]).toEqual(queue[0]);
    });

    it('should maintain queue integrity after reinsertion', () => {
      const images = createMockImages(10);
      const queue = buildQueue(images, 10);
      const originalIds = new Set(queue.map((q) => q.image.id));

      const newQueue = reinsertImage(queue, 3, 4);
      const newIds = new Set(newQueue.map((q) => q.image.id));

      // All IDs should still be present
      expect(newIds).toEqual(originalIds);
      expect(newQueue).toHaveLength(10);
    });
  });
});
