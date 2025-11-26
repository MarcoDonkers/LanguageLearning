import { NextResponse } from 'next/server';
import { getWordById, updateWordAfterReview } from '@/lib/db/queries';
import { calculateNextReview } from '@/lib/spaced-repetition/algorithm';
import { isAnswerCorrect } from '@/lib/utils';
import type { QuizSubmission, QuizResult, QuizDirection } from '@/types';

// POST /api/quiz/submit - Submit quiz answer with difficulty
export async function POST(request: Request) {
  try {
    const body: QuizSubmission = await request.json();
    const { wordId, userAnswer, difficulty, direction } = body;

    // Validation
    if (!wordId || typeof wordId !== 'number') {
      return NextResponse.json(
        { error: 'Word ID is required' },
        { status: 400 }
      );
    }

    if (!userAnswer || typeof userAnswer !== 'string') {
      return NextResponse.json(
        { error: 'User answer is required' },
        { status: 400 }
      );
    }

    if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Valid difficulty is required (easy, medium, or hard)' },
        { status: 400 }
      );
    }

    const validDirections: QuizDirection[] = ['dutch-to-english', 'english-to-dutch', 'mixed'];
    if (!direction || !validDirections.includes(direction)) {
      return NextResponse.json(
        { error: 'Valid direction is required' },
        { status: 400 }
      );
    }

    // Get the word
    const word = getWordById(wordId);
    if (!word) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      );
    }

    // Determine correct answer based on direction
    const correctAnswer = direction === 'english-to-dutch'
      ? word.dutch_word
      : word.english_translation;

    // Check if answer is correct
    const correct = isAnswerCorrect(userAnswer, correctAnswer);

    // Calculate next review using spaced repetition algorithm
    const { nextIntervalMinutes, newEaseMultiplier, nextReviewDate } = calculateNextReview(
      word.interval_minutes,
      word.ease_multiplier,
      { difficulty, wasCorrect: correct }
    );

    // Update word in database
    updateWordAfterReview(
      wordId,
      nextReviewDate,
      nextIntervalMinutes,
      newEaseMultiplier,
      correct
    );

    // Return result
    const result: QuizResult = {
      correct,
      correctAnswer,
      nextReviewDate: nextReviewDate.toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
