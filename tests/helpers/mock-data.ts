import type { Database } from 'better-sqlite3';

export const mockLists = {
  basicPhrases: {
    name: 'Basic Phrases',
    description: 'Common Dutch phrases for beginners',
  },
  animals: {
    name: 'Animals',
    description: 'Dutch animal vocabulary',
  },
  numbers: {
    name: 'Numbers 1-10',
    description: null,
  },
};

export const mockWords = {
  hello: {
    dutch_word: 'hallo',
    english_translation: 'hello',
  },
  goodbye: {
    dutch_word: 'tot ziens',
    english_translation: 'goodbye',
  },
  cat: {
    dutch_word: 'kat',
    english_translation: 'cat',
  },
  dog: {
    dutch_word: 'hond',
    english_translation: 'dog',
  },
  thank_you: {
    dutch_word: 'dank je wel',
    english_translation: 'thank you',
  },
};

export function createTestList(
  db: Database,
  listData: { name: string; description?: string | null }
): number {
  const result = db
    .prepare(`INSERT INTO word_lists (name, description) VALUES (?, ?)`)
    .run(listData.name, listData.description || null);

  return result.lastInsertRowid as number;
}

export function createTestWord(
  db: Database,
  listId: number,
  wordData: { dutch_word: string; english_translation: string }
): number {
  const result = db
    .prepare(
      `INSERT INTO words (list_id, dutch_word, english_translation) VALUES (?, ?, ?)`
    )
    .run(listId, wordData.dutch_word, wordData.english_translation);

  return result.lastInsertRowid as number;
}
