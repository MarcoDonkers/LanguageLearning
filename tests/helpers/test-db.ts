import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test.db');
let testDbInstance: Database.Database | null = null;

export function getTestDatabase(): Database.Database {
  if (!testDbInstance) {
    const dataDir = path.dirname(TEST_DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    testDbInstance = new Database(TEST_DB_PATH);
    testDbInstance.pragma('foreign_keys = ON');
    testDbInstance.pragma('journal_mode = WAL');
  }
  return testDbInstance;
}

export function initializeTestDatabase() {
  const db = getTestDatabase();
  const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
}

export function resetTestDatabase() {
  const db = getTestDatabase();

  // Drop all tables
  db.exec(`
    DROP TABLE IF EXISTS words;
    DROP TABLE IF EXISTS word_lists;
    DROP INDEX IF EXISTS idx_words_list_id;
    DROP INDEX IF EXISTS idx_words_next_review;
  `);

  // Recreate tables
  initializeTestDatabase();
}

export function closeTestDatabase() {
  if (testDbInstance) {
    testDbInstance.close();
    testDbInstance = null;
  }
}

export function cleanupTestDatabase() {
  closeTestDatabase();
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
  // Clean up WAL files
  const walPath = `${TEST_DB_PATH}-wal`;
  const shmPath = `${TEST_DB_PATH}-shm`;
  if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
  if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
}
