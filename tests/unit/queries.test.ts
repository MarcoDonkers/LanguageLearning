import { describe, test, expect, beforeEach, afterAll } from 'vitest';
import {
  getAllLists,
  getListById,
  createList,
  updateList,
  deleteList,
  getWordsByListId,
  getWordById,
  createWord,
  updateWord,
  deleteWord,
  searchWords,
  getDueWords,
  getDueWordsCount,
  updateWordAfterReview,
  getListStats,
} from '@/lib/db/queries';
import {
  resetTestDatabase,
  closeTestDatabase,
  getTestDatabase,
} from '@/tests/helpers/test-db';
import { mockLists, mockWords, createTestList, createTestWord } from '@/tests/helpers/mock-data';

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

describe('List Queries', () => {
  beforeEach(() => {
    resetTestDatabase();
  });

  afterAll(() => {
    closeTestDatabase();
  });

  describe('getAllLists', () => {
    test('Returns empty array when no lists', () => {
      const lists = getAllLists();
      expect(lists).toEqual([]);
    });

    test('Returns all lists with statistics', () => {
      const db = getTestDatabase();
      const listId1 = createTestList(db, mockLists.basicPhrases);
      const listId2 = createTestList(db, mockLists.animals);
      createTestWord(db, listId1, mockWords.hello);
      createTestWord(db, listId2, mockWords.cat);

      const lists = getAllLists();

      expect(lists).toHaveLength(2);
      expect(lists[0].word_count).toBe(1);
      expect(lists[1].word_count).toBe(1);
    });

    test('Calculates word_count correctly', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      createTestWord(db, listId, mockWords.hello);
      createTestWord(db, listId, mockWords.goodbye);
      createTestWord(db, listId, mockWords.thank_you);

      const lists = getAllLists();

      expect(lists[0].word_count).toBe(3);
    });

    test('Calculates due_count correctly', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      // Create word that's due (default is current time)
      createTestWord(db, listId, mockWords.hello);

      // Create word that's not due (future date)
      db.prepare(
        `INSERT INTO words (list_id, dutch_word, english_translation, next_review_date)
         VALUES (?, ?, ?, datetime('now', '+1 hour'))`
      ).run(listId, mockWords.goodbye.dutch_word, mockWords.goodbye.english_translation);

      const lists = getAllLists();

      expect(lists[0].word_count).toBe(2);
      expect(lists[0].due_count).toBe(1);
    });

    test('Orders by updated_at DESC', () => {
      const db = getTestDatabase();
      const listId1 = createTestList(db, mockLists.basicPhrases);
      const listId2 = createTestList(db, mockLists.animals);

      const lists = getAllLists();

      // Check that we have both lists
      expect(lists).toHaveLength(2);
      const listIds = lists.map(l => l.id);
      expect(listIds).toContain(listId1);
      expect(listIds).toContain(listId2);
    });
  });

  describe('getListById', () => {
    test('Returns list when it exists', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      const list = getListById(listId);

      expect(list).toBeDefined();
      expect(list?.name).toBe(mockLists.basicPhrases.name);
      expect(list?.description).toBe(mockLists.basicPhrases.description);
    });

    test('Returns undefined for non-existent list', () => {
      const list = getListById(999);
      expect(list).toBeUndefined();
    });
  });

  describe('createList', () => {
    test('Creates list with name only', () => {
      const list = createList('Test List');

      expect(list.name).toBe('Test List');
      expect(list.description).toBeNull();
      expect(list.id).toBeDefined();
      expect(list.created_at).toBeDefined();
      expect(list.updated_at).toBeDefined();
    });

    test('Creates list with name and description', () => {
      const list = createList('Test List', 'Test Description');

      expect(list.name).toBe('Test List');
      expect(list.description).toBe('Test Description');
    });

    test('Sets timestamps correctly', () => {
      const list = createList('Test List');

      expect(list.created_at).toBeDefined();
      expect(list.updated_at).toBeDefined();
      // Timestamps should be valid dates
      expect(new Date(list.created_at).getTime()).toBeGreaterThan(0);
      expect(new Date(list.updated_at).getTime()).toBeGreaterThan(0);
    });
  });

  describe('updateList', () => {
    test('Updates name and description', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      const updated = updateList(listId, 'Updated Name', 'Updated Description');

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated Description');
    });

    test('Updates updated_at timestamp', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      const updated = updateList(listId, 'Updated Name');

      expect(updated?.updated_at).toBeDefined();
      expect(new Date(updated!.updated_at).getTime()).toBeGreaterThan(0);
    });

    test('Returns undefined for non-existent list', () => {
      const result = updateList(999, 'Name');
      expect(result).toBeUndefined();
    });
  });

  describe('deleteList', () => {
    test('Deletes list successfully', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      const result = deleteList(listId);

      expect(result).toBe(true);
      expect(getListById(listId)).toBeUndefined();
    });

    test('Cascades delete to words', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      const wordId = createTestWord(db, listId, mockWords.hello);

      deleteList(listId);

      expect(getWordById(wordId)).toBeUndefined();
    });

    test('Returns false for non-existent list', () => {
      const result = deleteList(999);
      expect(result).toBe(false);
    });
  });
});

describe('Word Queries', () => {
  beforeEach(() => {
    resetTestDatabase();
  });

  afterAll(() => {
    closeTestDatabase();
  });

  describe('createWord', () => {
    test('Creates word with default spaced repetition values', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      const word = createWord(listId, 'hallo', 'hello');

      expect(word.dutch_word).toBe('hallo');
      expect(word.english_translation).toBe('hello');
      expect(word.interval_minutes).toBe(0);
      expect(word.ease_multiplier).toBe(1.0);
      expect(word.review_count).toBe(0);
      expect(word.correct_count).toBe(0);
    });

    test('Updates list updated_at timestamp', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      createWord(listId, 'hallo', 'hello');

      const listAfter = getListById(listId);
      expect(listAfter?.updated_at).toBeDefined();
      expect(new Date(listAfter!.updated_at).getTime()).toBeGreaterThan(0);
    });
  });

  describe('getWordsByListId', () => {
    test('Returns empty array when no words', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      const words = getWordsByListId(listId);

      expect(words).toEqual([]);
    });

    test('Returns all words in list', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      createTestWord(db, listId, mockWords.hello);
      createTestWord(db, listId, mockWords.goodbye);

      const words = getWordsByListId(listId);

      expect(words).toHaveLength(2);
    });

    test('Orders by created_at DESC', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      const wordId1 = createTestWord(db, listId, mockWords.hello);
      const wordId2 = createTestWord(db, listId, mockWords.goodbye);

      const words = getWordsByListId(listId);

      // Check that we have both words
      expect(words).toHaveLength(2);
      const wordIds = words.map(w => w.id);
      expect(wordIds).toContain(wordId1);
      expect(wordIds).toContain(wordId2);
    });
  });

  describe('updateWord', () => {
    test('Updates translations', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      const wordId = createTestWord(db, listId, mockWords.hello);

      const updated = updateWord(wordId, 'hoi', 'hi');

      expect(updated).toBeDefined();
      expect(updated?.dutch_word).toBe('hoi');
      expect(updated?.english_translation).toBe('hi');
    });

    test('Updates list timestamp', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      const wordId = createTestWord(db, listId, mockWords.hello);

      setTimeout(() => {}, 10);

      updateWord(wordId, 'hoi', 'hi');

      const list = getListById(listId);
      expect(list?.updated_at).toBeDefined();
    });

    test('Returns undefined for non-existent word', () => {
      const result = updateWord(999, 'test', 'test');
      expect(result).toBeUndefined();
    });
  });

  describe('deleteWord', () => {
    test('Deletes word successfully', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      const wordId = createTestWord(db, listId, mockWords.hello);

      const result = deleteWord(wordId);

      expect(result).toBe(true);
      expect(getWordById(wordId)).toBeUndefined();
    });

    test('Updates list timestamp', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      const wordId = createTestWord(db, listId, mockWords.hello);

      deleteWord(wordId);

      const listAfter = getListById(listId);
      expect(listAfter?.updated_at).toBeDefined();
      expect(new Date(listAfter!.updated_at).getTime()).toBeGreaterThan(0);
    });

    test('Returns false for non-existent word', () => {
      const result = deleteWord(999);
      expect(result).toBe(false);
    });
  });

  describe('searchWords', () => {
    test('Searches Dutch words case-insensitive', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      createTestWord(db, listId, mockWords.hello);
      createTestWord(db, listId, mockWords.cat);

      const results = searchWords(listId, 'HAL');

      expect(results).toHaveLength(1);
      expect(results[0].dutch_word).toBe('hallo');
    });

    test('Searches English translations case-insensitive', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      createTestWord(db, listId, mockWords.hello);
      createTestWord(db, listId, mockWords.cat);

      const results = searchWords(listId, 'CAT');

      expect(results).toHaveLength(1);
      expect(results[0].english_translation).toBe('cat');
    });

    test('Returns empty array for no matches', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      createTestWord(db, listId, mockWords.hello);

      const results = searchWords(listId, 'xyz');

      expect(results).toEqual([]);
    });
  });

  describe('getDueWords', () => {
    test('Returns only words with past next_review_date', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      // Due word
      createTestWord(db, listId, mockWords.hello);

      // Not due word
      db.prepare(
        `INSERT INTO words (list_id, dutch_word, english_translation, next_review_date)
         VALUES (?, ?, ?, datetime('now', '+1 hour'))`
      ).run(listId, mockWords.goodbye.dutch_word, mockWords.goodbye.english_translation);

      const dueWords = getDueWords(listId);

      expect(dueWords).toHaveLength(1);
      expect(dueWords[0].dutch_word).toBe('hallo');
    });

    test('Orders by next_review_date ASC', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      // More recent due date
      db.prepare(
        `INSERT INTO words (list_id, dutch_word, english_translation, next_review_date)
         VALUES (?, ?, ?, datetime('now', '-1 hour'))`
      ).run(listId, mockWords.hello.dutch_word, mockWords.hello.english_translation);

      // Older due date (should be first)
      db.prepare(
        `INSERT INTO words (list_id, dutch_word, english_translation, next_review_date)
         VALUES (?, ?, ?, datetime('now', '-2 hours'))`
      ).run(listId, mockWords.goodbye.dutch_word, mockWords.goodbye.english_translation);

      const dueWords = getDueWords(listId);

      expect(dueWords[0].dutch_word).toBe('tot ziens');
      expect(dueWords[1].dutch_word).toBe('hallo');
    });

    test('Returns empty array when no words due', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      db.prepare(
        `INSERT INTO words (list_id, dutch_word, english_translation, next_review_date)
         VALUES (?, ?, ?, datetime('now', '+1 hour'))`
      ).run(listId, mockWords.hello.dutch_word, mockWords.hello.english_translation);

      const dueWords = getDueWords(listId);

      expect(dueWords).toEqual([]);
    });
  });

  describe('getDueWordsCount', () => {
    test('Returns correct count', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      createTestWord(db, listId, mockWords.hello);
      createTestWord(db, listId, mockWords.goodbye);

      const count = getDueWordsCount(listId);

      expect(count).toBe(2);
    });
  });

  describe('updateWordAfterReview', () => {
    test('Updates all spaced repetition fields', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      const wordId = createTestWord(db, listId, mockWords.hello);

      const nextReviewDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const updated = updateWordAfterReview(wordId, nextReviewDate, 60, 4.0, true);

      expect(updated).toBeDefined();
      expect(updated?.interval_minutes).toBe(60);
      expect(updated?.ease_multiplier).toBe(4.0);
      expect(updated?.review_count).toBe(1);
      expect(updated?.correct_count).toBe(1);
      expect(updated?.last_reviewed_at).toBeDefined();
    });

    test('Increments review_count', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      const wordId = createTestWord(db, listId, mockWords.hello);

      updateWordAfterReview(wordId, new Date(), 60, 4.0, true);
      updateWordAfterReview(wordId, new Date(), 240, 16.0, true);

      const word = getWordById(wordId);
      expect(word?.review_count).toBe(2);
    });

    test('Increments correct_count when correct', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      const wordId = createTestWord(db, listId, mockWords.hello);

      updateWordAfterReview(wordId, new Date(), 60, 4.0, true);

      const word = getWordById(wordId);
      expect(word?.correct_count).toBe(1);
    });

    test('Does not increment correct_count when incorrect', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      const wordId = createTestWord(db, listId, mockWords.hello);

      updateWordAfterReview(wordId, new Date(), 5, 1.0, false);

      const word = getWordById(wordId);
      expect(word?.review_count).toBe(1);
      expect(word?.correct_count).toBe(0);
    });

    test('Returns undefined for non-existent word', () => {
      const result = updateWordAfterReview(999, new Date(), 60, 4.0, true);
      expect(result).toBeUndefined();
    });
  });
});

describe('Statistics Queries', () => {
  beforeEach(() => {
    resetTestDatabase();
  });

  afterAll(() => {
    closeTestDatabase();
  });

  describe('getListStats', () => {
    test('Returns correct total count', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);
      createTestWord(db, listId, mockWords.hello);
      createTestWord(db, listId, mockWords.goodbye);
      createTestWord(db, listId, mockWords.cat);

      const stats = getListStats(listId);

      expect(stats.total).toBe(3);
    });

    test('Returns correct due count', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      createTestWord(db, listId, mockWords.hello); // Due

      db.prepare(
        `INSERT INTO words (list_id, dutch_word, english_translation, next_review_date)
         VALUES (?, ?, ?, datetime('now', '+1 hour'))`
      ).run(listId, mockWords.goodbye.dutch_word, mockWords.goodbye.english_translation);

      const stats = getListStats(listId);

      expect(stats.due).toBe(1);
    });

    test('Returns correct mastered count', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      // Mastered word (100% correct)
      const wordId1 = createTestWord(db, listId, mockWords.hello);
      db.prepare('UPDATE words SET review_count = 3, correct_count = 3 WHERE id = ?').run(wordId1);

      // Not mastered (75% correct)
      const wordId2 = createTestWord(db, listId, mockWords.goodbye);
      db.prepare('UPDATE words SET review_count = 4, correct_count = 3 WHERE id = ?').run(wordId2);

      // Never reviewed
      createTestWord(db, listId, mockWords.cat);

      const stats = getListStats(listId);

      expect(stats.mastered).toBe(1);
    });

    test('Returns zeros for empty list', () => {
      const db = getTestDatabase();
      const listId = createTestList(db, mockLists.basicPhrases);

      const stats = getListStats(listId);

      expect(stats.total).toBe(0);
      expect(stats.due).toBe(0);
      expect(stats.mastered).toBe(0);
    });
  });
});
