import type Database from 'better-sqlite3';

export function runMigrations(db: Database.Database) {
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if notes column migration has run
  const migrationName = '001_add_notes_column';
  const existing = db.prepare('SELECT * FROM migrations WHERE name = ?').get(migrationName);

  if (!existing) {
    // Run the migration
    try {
      db.exec('ALTER TABLE words ADD COLUMN notes TEXT');
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
      console.log(`Migration ${migrationName} executed successfully`);
    } catch (error: any) {
      // Column might already exist
      if (error.message.includes('duplicate column name')) {
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
        console.log(`Migration ${migrationName} already applied`);
      } else {
        throw error;
      }
    }
  }
}
