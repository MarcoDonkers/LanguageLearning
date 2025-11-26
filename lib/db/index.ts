import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbInstance: Database.Database | null = null;
let initialized = false;

function getDatabase(): Database.Database {
  if (!dbInstance) {
    const dbPath = process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'data', 'database.db')
      : path.join(process.cwd(), 'data', 'test.db');

    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create database connection
    dbInstance = new Database(dbPath);

    // Enable foreign keys
    dbInstance.pragma('foreign_keys = ON');

    // Enable WAL mode for better concurrency
    dbInstance.pragma('journal_mode = WAL');
  }

  return dbInstance;
}

/**
 * Initialize the database schema
 * This will create tables if they don't exist
 */
export function initializeDatabase() {
  if (initialized) {
    return;
  }

  try {
    const db = getDatabase();
    const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    initialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Close the database connection
 * Useful for tests that need to reset the database
 */
export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    initialized = false;
  }
}

// Initialize database on first access
initializeDatabase();

export const db = getDatabase();
export default db;
