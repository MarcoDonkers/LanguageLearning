import { NextResponse } from 'next/server';
import { createWord } from '@/lib/db/queries';

// POST /api/words - Create a new word
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listId, dutchWord, englishTranslation, notes } = body;

    if (!listId || typeof listId !== 'number') {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    if (!dutchWord || typeof dutchWord !== 'string') {
      return NextResponse.json(
        { error: 'Dutch word is required' },
        { status: 400 }
      );
    }

    if (!englishTranslation || typeof englishTranslation !== 'string') {
      return NextResponse.json(
        { error: 'English translation is required' },
        { status: 400 }
      );
    }

    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Notes must be a string' },
        { status: 400 }
      );
    }

    const word = createWord(listId, dutchWord, englishTranslation, notes);
    return NextResponse.json(word, { status: 201 });
  } catch (error) {
    console.error('Error creating word:', error);
    return NextResponse.json(
      { error: 'Failed to create word' },
      { status: 500 }
    );
  }
}
