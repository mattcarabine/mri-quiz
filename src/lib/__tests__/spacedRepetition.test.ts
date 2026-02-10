import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculatePriority, updateItem, getReinsertionPosition } from '../spacedRepetition';
import type { QuizItem, QuizImage } from '../../types/quiz';

describe('spacedRepetition', () => {
  let mockImage: QuizImage;
  let baseItem: QuizItem;

  beforeEach(() => {
    mockImage = {
      id: 'test-1',
      filename: 'test.jpg',
      type: 'T1',
      subject: 'TestSubject',
    };

    baseItem = {
      image: mockImage,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: Date.now(),
      consecutiveCorrect: 0,
      lastSeen: null,
      priority: 50,
    };

    // Use fake timers to control Date.now()
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  describe('calculatePriority', () => {
    it('should give 50 priority to new images (never seen)', () => {
      const item = { ...baseItem, lastSeen: null };
      const priority = calculatePriority(item);
      expect(priority).toBe(50);
    });

    it('should reduce priority for recently seen images (< 1 hour)', () => {
      const oneHourAgo = Date.now() - 30 * 60 * 1000; // 30 minutes ago
      const item = { ...baseItem, lastSeen: oneHourAgo, nextReview: Date.now() };
      const priority = calculatePriority(item);
      // Base 0 (not new), minus 20 for recent, plus 25 for due review = 5
      expect(priority).toBe(5);
    });

    it('should reduce priority slightly for images seen 1-24 hours ago', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      const item = { ...baseItem, lastSeen: twoHoursAgo, nextReview: Date.now() };
      const priority = calculatePriority(item);
      // Base 0 (not new), minus 10 for recent, plus 25 for due review = 15
      expect(priority).toBe(15);
    });

    it('should not penalize images seen more than 24 hours ago', () => {
      const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
      const item = { ...baseItem, lastSeen: twoDaysAgo, nextReview: Date.now() };
      const priority = calculatePriority(item);
      // Base 0 (not new), no recent penalty, plus 25 for due review = 25
      expect(priority).toBe(25);
    });

    it('should reduce priority based on consecutive correct answers', () => {
      const item = { ...baseItem, consecutiveCorrect: 3, lastSeen: null, nextReview: Date.now() };
      const priority = calculatePriority(item);
      // New: 50, minus 3 * 5, plus 25 for due review = 60
      expect(priority).toBe(60);
    });

    it('should boost priority for items due for review', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      const item = { ...baseItem, nextReview: yesterday, lastSeen: yesterday };
      const priority = calculatePriority(item);
      // Not new: 0, no recent penalty (24h ago), due for review: +25 = 25
      expect(priority).toBe(25);
    });

    it('should never return negative priority', () => {
      const item = {
        ...baseItem,
        lastSeen: Date.now() - 30 * 60 * 1000, // 30 min ago = -20
        consecutiveCorrect: 10, // -50
      };
      const priority = calculatePriority(item);
      expect(priority).toBeGreaterThanOrEqual(0);
    });
  });

  describe('updateItem', () => {
    it('should increase interval and update stats on correct answer (first repetition)', () => {
      const updated = updateItem(baseItem, true);

      expect(updated.repetitions).toBe(1);
      expect(updated.interval).toBe(1);
      expect(updated.consecutiveCorrect).toBe(1);
      expect(updated.lastSeen).toBe(Date.now());
      expect(updated.easeFactor).toBeCloseTo(2.5); // Should adjust slightly
    });

    it('should increase interval on correct answer (second repetition)', () => {
      const item = { ...baseItem, repetitions: 1, interval: 1 };
      const updated = updateItem(item, true);

      expect(updated.repetitions).toBe(2);
      expect(updated.interval).toBe(6);
    });

    it('should use ease factor for subsequent repetitions', () => {
      const item = { ...baseItem, repetitions: 2, interval: 6, easeFactor: 2.5 };
      const updated = updateItem(item, true);

      expect(updated.repetitions).toBe(3);
      expect(updated.interval).toBe(Math.round(6 * 2.5)); // 15
    });

    it('should maintain minimum ease factor of 1.3', () => {
      const item = { ...baseItem, easeFactor: 1.3 };
      const updated = updateItem(item, false);

      // Ease factor - 0.2 = 1.1, but min is 1.3
      expect(updated.easeFactor).toBe(1.3);
    });

    it('should reset interval and decrease ease factor on incorrect answer', () => {
      const item = { ...baseItem, repetitions: 5, interval: 20, easeFactor: 2.8, nextReview: Date.now() + 1000 };
      const updated = updateItem(item, false);

      expect(updated.repetitions).toBe(0);
      expect(updated.interval).toBe(1);
      expect(updated.consecutiveCorrect).toBe(0);
      expect(updated.easeFactor).toBeCloseTo(2.6, 1); // 2.8 - 0.2, allow floating point imprecision
    });

    it('should add incorrect boost (+30) to priority on wrong answer', () => {
      const item = { ...baseItem, lastSeen: null };
      const updated = updateItem(item, false);

      // Priority calculation for incorrect: base priority + 30 boost
      // New item: 50 base (but lastSeen is now set, so 0) + 30 = 30
      expect(updated.priority).toBeGreaterThanOrEqual(30);
    });

    it('should update nextReview timestamp based on new interval', () => {
      const now = Date.now();
      const updated = updateItem(baseItem, true);

      const expectedReview = now + 1 * 24 * 60 * 60 * 1000; // 1 day
      expect(updated.nextReview).toBe(expectedReview);
    });
  });

  describe('getReinsertionPosition', () => {
    it('should return a value between 3 and 7', () => {
      // Test multiple times to check randomness bounds
      for (let i = 0; i < 100; i++) {
        const position = getReinsertionPosition();
        expect(position).toBeGreaterThanOrEqual(3);
        expect(position).toBeLessThanOrEqual(7);
      }
    });

    it('should return integers only', () => {
      for (let i = 0; i < 50; i++) {
        const position = getReinsertionPosition();
        expect(Number.isInteger(position)).toBe(true);
      }
    });
  });
});
