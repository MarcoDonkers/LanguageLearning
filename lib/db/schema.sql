-- Word Lists Table
CREATE TABLE IF NOT EXISTS word_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Words Table with Spaced Repetition Fields
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id INTEGER NOT NULL,
  dutch_word TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Spaced Repetition Fields
  next_review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  interval_minutes INTEGER DEFAULT 0,
  ease_multiplier REAL DEFAULT 1.0,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  last_reviewed_at DATETIME,

  FOREIGN KEY (list_id) REFERENCES word_lists(id) ON DELETE CASCADE
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_words_list_id ON words(list_id);
CREATE INDEX IF NOT EXISTS idx_words_next_review ON words(next_review_date);
