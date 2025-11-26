import { describe, test, expect } from 'vitest';
import {
  calculateNextReview,
  getNextReviewDate,
  isDueForReview,
  INITIAL_INTERVALS,
  EASY_MULTIPLIER,
} from '@/lib/spaced-repetition/algorithm';

describe('calculateNextReview', () => {
  describe('First review (interval = 0)', () => {
    test('Hard: 5 minutes interval', () => {
      const result = calculateNextReview(0, 1.0, {
        difficulty: 'hard',
        wasCorrect: true,
      });

      expect(result.nextIntervalMinutes).toBe(INITIAL_INTERVALS.hard);
      expect(result.nextIntervalMinutes).toBe(5);
      expect(result.newEaseMultiplier).toBe(1.0);
    });

    test('Medium: 30 minutes interval', () => {
      const result = calculateNextReview(0, 1.0, {
        difficulty: 'medium',
        wasCorrect: true,
      });

      expect(result.nextIntervalMinutes).toBe(INITIAL_INTERVALS.medium);
      expect(result.nextIntervalMinutes).toBe(30);
      expect(result.newEaseMultiplier).toBe(1.0);
    });

    test('Easy: 1 hour interval', () => {
      const result = calculateNextReview(0, 1.0, {
        difficulty: 'easy',
        wasCorrect: true,
      });

      expect(result.nextIntervalMinutes).toBe(INITIAL_INTERVALS.easy);
      expect(result.nextIntervalMinutes).toBe(60);
      expect(result.newEaseMultiplier).toBe(EASY_MULTIPLIER);
      expect(result.newEaseMultiplier).toBe(4);
    });
  });

  describe('Subsequent reviews', () => {
    test('Applies ease multiplier to current interval', () => {
      const result = calculateNextReview(30, 2.0, {
        difficulty: 'medium',
        wasCorrect: true,
      });

      expect(result.nextIntervalMinutes).toBe(60); // 30 * 2.0
      expect(result.newEaseMultiplier).toBe(2.0);
    });

    test('Easy selection multiplies ease by 4', () => {
      const result = calculateNextReview(30, 1.0, {
        difficulty: 'easy',
        wasCorrect: true,
      });

      expect(result.nextIntervalMinutes).toBe(30); // 30 * 1.0
      expect(result.newEaseMultiplier).toBe(4.0); // 1.0 * 4
    });

    test('Maintains multiplier across reviews', () => {
      // First easy review
      const result1 = calculateNextReview(60, 1.0, {
        difficulty: 'easy',
        wasCorrect: true,
      });
      expect(result1.newEaseMultiplier).toBe(4.0);

      // Second review with new multiplier
      const result2 = calculateNextReview(60, result1.newEaseMultiplier, {
        difficulty: 'medium',
        wasCorrect: true,
      });
      expect(result2.nextIntervalMinutes).toBe(240); // 60 * 4.0
      expect(result2.newEaseMultiplier).toBe(4.0); // Stays the same
    });

    test('Multiple easy selections create exponential growth', () => {
      // First easy review
      const result1 = calculateNextReview(60, 1.0, {
        difficulty: 'easy',
        wasCorrect: true,
      });
      expect(result1.nextIntervalMinutes).toBe(60);
      expect(result1.newEaseMultiplier).toBe(4.0);

      // Second easy review
      const result2 = calculateNextReview(60, result1.newEaseMultiplier, {
        difficulty: 'easy',
        wasCorrect: true,
      });
      expect(result2.nextIntervalMinutes).toBe(240); // 60 * 4.0
      expect(result2.newEaseMultiplier).toBe(16.0); // 4.0 * 4

      // Third easy review
      const result3 = calculateNextReview(240, result2.newEaseMultiplier, {
        difficulty: 'easy',
        wasCorrect: true,
      });
      expect(result3.nextIntervalMinutes).toBe(3840); // 240 * 16.0
      expect(result3.newEaseMultiplier).toBe(64.0); // 16.0 * 4
    });
  });

  describe('Incorrect answers', () => {
    test('Resets to hard interval (5 min)', () => {
      const result = calculateNextReview(240, 4.0, {
        difficulty: 'medium',
        wasCorrect: false,
      });

      expect(result.nextIntervalMinutes).toBe(INITIAL_INTERVALS.hard);
      expect(result.nextIntervalMinutes).toBe(5);
    });

    test('Preserves ease multiplier', () => {
      const result = calculateNextReview(240, 16.0, {
        difficulty: 'easy',
        wasCorrect: false,
      });

      expect(result.nextIntervalMinutes).toBe(5);
      expect(result.newEaseMultiplier).toBe(64.0); // 16.0 * 4 (easy multiplier still applies)
    });

    test('Easy selection still multiplies ease even when incorrect', () => {
      const result = calculateNextReview(60, 4.0, {
        difficulty: 'easy',
        wasCorrect: false,
      });

      expect(result.nextIntervalMinutes).toBe(5); // Reset to hard
      expect(result.newEaseMultiplier).toBe(16.0); // 4.0 * 4
    });
  });

  describe('Edge cases', () => {
    test('Maximum interval cap (1 year)', () => {
      const maxInterval = 365 * 24 * 60; // 1 year in minutes
      const result = calculateNextReview(100000, 1000.0, {
        difficulty: 'medium',
        wasCorrect: true,
      });

      expect(result.nextIntervalMinutes).toBe(maxInterval);
    });

    test('Very large multipliers are capped', () => {
      const result = calculateNextReview(10000, 10000.0, {
        difficulty: 'easy',
        wasCorrect: true,
      });

      const maxInterval = 365 * 24 * 60;
      expect(result.nextIntervalMinutes).toBe(maxInterval);
      expect(result.newEaseMultiplier).toBe(40000.0); // 10000 * 4
    });
  });

  describe('Date calculations', () => {
    test('getNextReviewDate adds correct minutes', () => {
      const before = new Date();
      const nextDate = getNextReviewDate(60); // 1 hour
      const after = new Date(before.getTime() + 60 * 60 * 1000);

      // Allow 1 second tolerance for test execution time
      expect(Math.abs(nextDate.getTime() - after.getTime())).toBeLessThan(1000);
    });

    test('isDueForReview correctly identifies past dates', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      expect(isDueForReview(pastDate)).toBe(true);
    });

    test('isDueForReview correctly identifies future dates', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      expect(isDueForReview(futureDate)).toBe(false);
    });

    test('isDueForReview handles string dates', () => {
      const pastDateString = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      expect(isDueForReview(pastDateString)).toBe(true);

      const futureDateString = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      expect(isDueForReview(futureDateString)).toBe(false);
    });

    test('isDueForReview handles dates at exact current time', () => {
      const now = new Date();
      // Should be due (less than or equal)
      expect(isDueForReview(now)).toBe(true);
    });
  });

  describe('Return value structure', () => {
    test('Returns all required fields', () => {
      const result = calculateNextReview(60, 1.0, {
        difficulty: 'medium',
        wasCorrect: true,
      });

      expect(result).toHaveProperty('nextIntervalMinutes');
      expect(result).toHaveProperty('newEaseMultiplier');
      expect(result).toHaveProperty('nextReviewDate');
      expect(result.nextReviewDate).toBeInstanceOf(Date);
    });
  });
});
