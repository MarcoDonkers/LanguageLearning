import { NextResponse } from 'next/server';
import { getDueWords } from '@/lib/db/queries';

// GET /api/words/due?listId=123 - Get words due for review
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listIdParam = searchParams.get('listId');

    if (!listIdParam) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    const listId = parseInt(listIdParam);
    if (isNaN(listId)) {
      return NextResponse.json(
        { error: 'Invalid list ID' },
        { status: 400 }
      );
    }

    const dueWords = getDueWords(listId);
    return NextResponse.json(dueWords);
  } catch (error) {
    console.error('Error fetching due words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch due words' },
      { status: 500 }
    );
  }
}
