export interface WordList {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: number;
  list_id: number;
  dutch_word: string;
  english_translation: string;
  created_at: string;
  next_review_date: string;
  interval_minutes: number;
  ease_multiplier: number;
  review_count: number;
  correct_count: number;
  last_reviewed_at: string | null;
}

export interface WordListWithStats extends WordList {
  word_count: number;
  due_count: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizSubmission {
  wordId: number;
  userAnswer: string;
  difficulty: Difficulty;
}

export interface QuizResult {
  correct: boolean;
  correctAnswer: string;
  nextReviewDate: string;
}
