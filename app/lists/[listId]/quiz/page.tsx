'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Word, QuizResult, Difficulty, QuizDirection, QuizWord } from '@/types';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listId = parseInt(params.listId as string);
  const direction = (searchParams.get('direction') || 'dutch-to-english') as QuizDirection;

  const [dueWords, setDueWords] = useState<QuizWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDueWords();
  }, [listId]);

  const fetchDueWords = async () => {
    try {
      const response = await fetch(`/api/words/due?listId=${listId}`);
      if (response.ok) {
        const data: Word[] = await response.json();

        // If mixed mode, randomly assign direction to each word
        const wordsWithDirection: QuizWord[] = direction === 'mixed'
          ? data.map(word => ({
              ...word,
              currentDirection: Math.random() < 0.5
                ? 'dutch-to-english'
                : 'english-to-dutch'
            }))
          : data;

        setDueWords(wordsWithDirection);

        if (data.length === 0) {
          router.push(`/lists/${listId}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch due words:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for direction logic
  const getWordDirection = (word: QuizWord): 'dutch-to-english' | 'english-to-dutch' => {
    if (direction === 'mixed') {
      return word.currentDirection || 'dutch-to-english';
    }
    return direction;
  };

  const getQuestionText = (word: QuizWord): string => {
    const wordDirection = getWordDirection(word);
    return wordDirection === 'dutch-to-english'
      ? word.dutch_word
      : word.english_translation;
  };

  const getPromptText = (word: QuizWord): string => {
    const wordDirection = getWordDirection(word);
    return wordDirection === 'dutch-to-english'
      ? 'Translate to English'
      : 'Translate to Dutch';
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || submitting) return;

    setSubmitting(true);

    try {
      const wordDirection = getWordDirection(currentWord);

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentWord.id,
          userAnswer,
          difficulty: 'medium', // Default, will be updated after user selects
          direction: wordDirection,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDifficultySelection = async (difficulty: Difficulty) => {
    if (!result) return;

    try {
      const wordDirection = getWordDirection(currentWord);

      // Submit again with the selected difficulty
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentWord.id,
          userAnswer,
          difficulty,
          direction: wordDirection,
        }),
      });

      if (response.ok) {
        // Move to next word
        if (currentIndex < dueWords.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setUserAnswer('');
          setResult(null);
        } else {
          // Quiz complete
          router.push(`/lists/${listId}`);
        }
      }
    } catch (error) {
      console.error('Failed to save difficulty:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !result) {
      handleSubmitAnswer();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600">Loading quiz...</p>
        </div>
      </main>
    );
  }

  if (dueWords.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-xl text-gray-600 mb-4">
                No words due for review! Come back later.
              </p>
              <Link href={`/lists/${listId}`}>
                <Button>Back to List</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const currentWord = dueWords[currentIndex];

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <Link href={`/lists/${listId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Exit Quiz
            </Button>
          </Link>
          <div className="text-sm font-semibold text-gray-600">
            {currentIndex + 1} / {dueWords.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / dueWords.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Quiz Card */}
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-sm uppercase tracking-wide text-gray-500 mb-4">
              {getPromptText(currentWord)}
            </CardTitle>
            <div className="text-5xl font-heading font-bold text-primary-600">
              {getQuestionText(currentWord)}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!result ? (
              <>
                <Input
                  type="text"
                  placeholder="Type your answer..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg h-14 text-center"
                  autoFocus
                  disabled={submitting}
                />
                <Button
                  onClick={handleSubmitAnswer}
                  className="w-full h-14 text-lg"
                  disabled={!userAnswer.trim() || submitting}
                >
                  {submitting ? 'Checking...' : 'Check Answer'}
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                {/* Result */}
                <div
                  className={`p-6 rounded-2xl text-center ${
                    result.correct
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-red-50 border-2 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {result.correct ? (
                      <>
                        <Check className="w-8 h-8 text-green-600" />
                        <span className="text-2xl font-bold text-green-700">
                          Correct!
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-8 h-8 text-red-600" />
                        <span className="text-2xl font-bold text-red-700">
                          Not quite!
                        </span>
                      </>
                    )}
                  </div>
                  {!result.correct && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-1">
                        Correct answer:
                      </div>
                      <div className="text-xl font-semibold text-gray-800">
                        {result.correctAnswer}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        You wrote: {userAnswer}
                      </div>
                    </div>
                  )}
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-3">
                  <p className="text-center text-gray-700 font-medium">
                    How difficult was this word?
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="h-16 flex-col border-2 hover:border-red-400 hover:bg-red-50"
                      onClick={() => handleDifficultySelection('hard')}
                    >
                      <span className="font-bold text-red-600">Hard</span>
                      <span className="text-xs text-gray-500">5 min</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col border-2 hover:border-yellow-400 hover:bg-yellow-50"
                      onClick={() => handleDifficultySelection('medium')}
                    >
                      <span className="font-bold text-yellow-600">Medium</span>
                      <span className="text-xs text-gray-500">30 min</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col border-2 hover:border-green-400 hover:bg-green-50"
                      onClick={() => handleDifficultySelection('easy')}
                    >
                      <span className="font-bold text-green-600">Easy</span>
                      <span className="text-xs text-gray-500">1 hour</span>
                    </Button>
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Easy: 4x multiplier for future reviews
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        {!result && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Press Enter to submit your answer
          </p>
        )}
      </div>
    </main>
  );
}
