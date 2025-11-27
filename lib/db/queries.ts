import db from './index';
import type { Word, WordList, WordListWithStats } from '@/types';

// ==================== WORD LIST QUERIES ====================

/**
 * Get all word lists with statistics (word count and due count)
 */
export function getAllLists(): WordListWithStats[] {
  const query = `
    SELECT
      wl.*,
      COUNT(w.id) as word_count,
      SUM(CASE WHEN w.next_review_date <= datetime('now') THEN 1 ELSE 0 END) as due_count
    FROM word_lists wl
    LEFT JOIN words w ON wl.id = w.list_id
    GROUP BY wl.id
    ORDER BY wl.updated_at DESC
  `;

  return db.prepare(query).all() as WordListWithStats[];
}

/**
 * Get a single word list by ID
 */
export function getListById(id: number): WordList | undefined {
  const query = 'SELECT * FROM word_lists WHERE id = ?';
  return db.prepare(query).get(id) as WordList | undefined;
}

/**
 * Create a new word list
 */
export function createList(name: string, description?: string): WordList {
  const query = `
    INSERT INTO word_lists (name, description)
    VALUES (?, ?)
  `;

  const result = db.prepare(query).run(name, description || null);
  return getListById(result.lastInsertRowid as number)!;
}

/**
 * Update a word list
 */
export function updateList(id: number, name: string, description?: string): WordList | undefined {
  const query = `
    UPDATE word_lists
    SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.prepare(query).run(name, description || null, id);
  return getListById(id);
}

/**
 * Delete a word list (will cascade delete all words)
 */
export function deleteList(id: number): boolean {
  const query = 'DELETE FROM word_lists WHERE id = ?';
  const result = db.prepare(query).run(id);
  return result.changes > 0;
}

// ==================== WORD QUERIES ====================

/**
 * Get all words in a list
 */
export function getWordsByListId(listId: number): Word[] {
  const query = `
    SELECT * FROM words
    WHERE list_id = ?
    ORDER BY created_at DESC
  `;

  return db.prepare(query).all(listId) as Word[];
}

/**
 * Get a single word by ID
 */
export function getWordById(id: number): Word | undefined {
  const query = 'SELECT * FROM words WHERE id = ?';
  return db.prepare(query).get(id) as Word | undefined;
}

/**
 * Create a new word
 */
export function createWord(
  listId: number,
  dutchWord: string,
  englishTranslation: string,
  notes?: string
): Word {
  const query = `
    INSERT INTO words (list_id, dutch_word, english_translation, notes)
    VALUES (?, ?, ?, ?)
  `;

  const result = db.prepare(query).run(listId, dutchWord, englishTranslation, notes || null);

  // Update the list's updated_at timestamp
  db.prepare('UPDATE word_lists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(listId);

  return getWordById(result.lastInsertRowid as number)!;
}

/**
 * Update a word
 */
export function updateWord(
  id: number,
  dutchWord: string,
  englishTranslation: string,
  notes?: string
): Word | undefined {
  const word = getWordById(id);
  if (!word) return undefined;

  const query = `
    UPDATE words
    SET dutch_word = ?, english_translation = ?, notes = ?
    WHERE id = ?
  `;

  db.prepare(query).run(dutchWord, englishTranslation, notes || null, id);

  // Update the list's updated_at timestamp
  db.prepare('UPDATE word_lists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(word.list_id);

  return getWordById(id);
}

/**
 * Delete a word
 */
export function deleteWord(id: number): boolean {
  const word = getWordById(id);
  if (!word) return false;

  const query = 'DELETE FROM words WHERE id = ?';
  const result = db.prepare(query).run(id);

  // Update the list's updated_at timestamp
  db.prepare('UPDATE word_lists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(word.list_id);

  return result.changes > 0;
}

/**
 * Search words in a list
 */
export function searchWords(listId: number, searchTerm: string): Word[] {
  const query = `
    SELECT * FROM words
    WHERE list_id = ?
      AND (dutch_word LIKE ? OR english_translation LIKE ? OR notes LIKE ?)
    ORDER BY created_at DESC
  `;

  const searchPattern = `%${searchTerm}%`;
  return db.prepare(query).all(listId, searchPattern, searchPattern, searchPattern) as Word[];
}

// ==================== QUIZ QUERIES ====================

/**
 * Get all words due for review in a list
 */
export function getDueWords(listId: number): Word[] {
  const query = `
    SELECT * FROM words
    WHERE list_id = ?
      AND next_review_date <= datetime('now')
    ORDER BY next_review_date ASC
  `;

  return db.prepare(query).all(listId) as Word[];
}

/**
 * Get count of due words in a list
 */
export function getDueWordsCount(listId: number): number {
  const query = `
    SELECT COUNT(*) as count FROM words
    WHERE list_id = ?
      AND next_review_date <= datetime('now')
  `;

  const result = db.prepare(query).get(listId) as { count: number };
  return result.count;
}

/**
 * Update word after quiz submission
 */
export function updateWordAfterReview(
  wordId: number,
  nextReviewDate: Date,
  intervalMinutes: number,
  easeMultiplier: number,
  wasCorrect: boolean
): Word | undefined {
  const word = getWordById(wordId);
  if (!word) return undefined;

  const query = `
    UPDATE words
    SET
      next_review_date = ?,
      interval_minutes = ?,
      ease_multiplier = ?,
      review_count = review_count + 1,
      correct_count = correct_count + ?,
      last_reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.prepare(query).run(
    nextReviewDate.toISOString(),
    intervalMinutes,
    easeMultiplier,
    wasCorrect ? 1 : 0,
    wordId
  );

  // Update the list's updated_at timestamp
  db.prepare('UPDATE word_lists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(word.list_id);

  return getWordById(wordId);
}

// ==================== STATISTICS QUERIES ====================

/**
 * Get statistics for a word list
 */
export function getListStats(listId: number) {
  const totalQuery = 'SELECT COUNT(*) as count FROM words WHERE list_id = ?';
  const dueQuery = `
    SELECT COUNT(*) as count FROM words
    WHERE list_id = ? AND next_review_date <= datetime('now')
  `;
  const masteredQuery = `
    SELECT COUNT(*) as count FROM words
    WHERE list_id = ? AND review_count > 0 AND correct_count = review_count
  `;

  const total = (db.prepare(totalQuery).get(listId) as { count: number }).count;
  const due = (db.prepare(dueQuery).get(listId) as { count: number }).count;
  const mastered = (db.prepare(masteredQuery).get(listId) as { count: number }).count;

  return { total, due, mastered };
}
