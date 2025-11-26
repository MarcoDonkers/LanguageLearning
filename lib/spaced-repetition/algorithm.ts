import { type ReviewResult, type NextReviewCalculation } from './types';

// Initial intervals in minutes for first review
export const INITIAL_INTERVALS = {
  hard: 5,      // 5 minutes
  medium: 30,   // 30 minutes
  easy: 60,     // 1 hour
} as const;

// Easy multiplier - when user selects "Easy", multiply all future intervals by 4
export const EASY_MULTIPLIER = 4;

// Maximum interval to prevent overflow (1 year in minutes)
const MAX_INTERVAL_MINUTES = 365 * 24 * 60;

/**
 * Calculate the next review time based on current state and user's difficulty selection
 *
 * Algorithm Logic:
 * 1. For first review (interval = 0): Use initial intervals (Hard: 5min, Medium: 30min, Easy: 1hr)
 * 2. For subsequent reviews: Apply ease_multiplier to current interval
 * 3. CRITICAL: When user selects "Easy", multiply ease_multiplier by 4 for all future reviews
 * 4. If answer was incorrect: Reset to hard interval (5min) but keep the multiplier
 *
 * This creates exponential growth for mastered words:
 * Example progression (all Easy):
 * Review 1: 1hr (multiplier: 1.0)
 * Review 2: 1hr (multiplier: 4.0)
 * Review 3: 4hr (multiplier: 16.0)
 * Review 4: 16hr (multiplier: 64.0)
 * Review 5: 64hr (multiplier: 256.0)
 */
export function calculateNextReview(
  currentIntervalMinutes: number,
  currentEaseMultiplier: number,
  result: ReviewResult
): NextReviewCalculation {
  let nextIntervalMinutes: number;
  let newEaseMultiplier = currentEaseMultiplier;

  // First review: use initial intervals
  if (currentIntervalMinutes === 0) {
    nextIntervalMinutes = INITIAL_INTERVALS[result.difficulty];
  } else {
    // Apply multiplier to current interval
    nextIntervalMinutes = Math.round(currentIntervalMinutes * currentEaseMultiplier);
  }

  // CRITICAL: If user selected "Easy", multiply the ease multiplier by 4
  // This makes the word appear less frequently in future reviews
  if (result.difficulty === 'easy') {
    newEaseMultiplier = currentEaseMultiplier * EASY_MULTIPLIER;
  }

  // If answer was incorrect, reset to hard interval but keep the multiplier
  // This gives immediate practice while preserving long-term progress
  if (!result.wasCorrect) {
    nextIntervalMinutes = INITIAL_INTERVALS.hard;
  }

  // Cap at maximum interval to prevent overflow
  nextIntervalMinutes = Math.min(nextIntervalMinutes, MAX_INTERVAL_MINUTES);

  // Calculate the next review date
  const nextReviewDate = getNextReviewDate(nextIntervalMinutes);

  return {
    nextIntervalMinutes,
    newEaseMultiplier,
    nextReviewDate,
  };
}

/**
 * Get the next review date based on interval in minutes
 */
export function getNextReviewDate(intervalMinutes: number): Date {
  const now = new Date();
  return new Date(now.getTime() + intervalMinutes * 60 * 1000);
}

/**
 * Check if a word is due for review
 */
export function isDueForReview(nextReviewDate: string | Date): boolean {
  const reviewDate = typeof nextReviewDate === 'string'
    ? new Date(nextReviewDate)
    : nextReviewDate;

  return reviewDate <= new Date();
}
