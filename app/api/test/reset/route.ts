import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST() {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Database reset not allowed in production' },
      { status: 403 }
    );
  }

  try {
    // Instead of deleting the database file (which causes locks on Windows),
    // we'll truncate all tables
    db.exec(`
      DELETE FROM words;
      DELETE FROM word_lists;
      DELETE FROM sqlite_sequence;
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reset database:', error);
    return NextResponse.json(
      { error: 'Failed to reset database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
