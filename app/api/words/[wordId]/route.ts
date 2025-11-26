import { NextResponse } from 'next/server';
import { updateWord, deleteWord } from '@/lib/db/queries';

// PUT /api/words/[wordId] - Update a word
export async function PUT(
  request: Request,
  { params }: { params: { wordId: string } }
) {
  try {
    const wordId = parseInt(params.wordId);

    if (isNaN(wordId)) {
      return NextResponse.json(
        { error: 'Invalid word ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { dutchWord, englishTranslation } = body;

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

    const word = updateWord(wordId, dutchWord, englishTranslation);
    if (!word) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error('Error updating word:', error);
    return NextResponse.json(
      { error: 'Failed to update word' },
      { status: 500 }
    );
  }
}

// DELETE /api/words/[wordId] - Delete a word
export async function DELETE(
  request: Request,
  { params }: { params: { wordId: string } }
) {
  try {
    const wordId = parseInt(params.wordId);

    if (isNaN(wordId)) {
      return NextResponse.json(
        { error: 'Invalid word ID' },
        { status: 400 }
      );
    }

    const success = deleteWord(wordId);
    if (!success) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting word:', error);
    return NextResponse.json(
      { error: 'Failed to delete word' },
      { status: 500 }
    );
  }
}
