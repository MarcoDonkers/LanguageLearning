import { Difficulty } from '@/types';

export interface ReviewResult {
  difficulty: Difficulty;
  wasCorrect: boolean;
}

export interface NextReviewCalculation {
  nextIntervalMinutes: number;
  newEaseMultiplier: number;
  nextReviewDate: Date;
}
