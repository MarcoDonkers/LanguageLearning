import { NextResponse } from 'next/server';
import { getListById, updateList, deleteList, getWordsByListId } from '@/lib/db/queries';

// GET /api/lists/[listId] - Get a single list with all words
export async function GET(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const listId = parseInt(params.listId);

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: 'Invalid list ID' },
        { status: 400 }
      );
    }

    const list = getListById(listId);
    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    const words = getWordsByListId(listId);

    return NextResponse.json({
      ...list,
      words,
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch list' },
      { status: 500 }
    );
  }
}

// PUT /api/lists/[listId] - Update a list
export async function PUT(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const listId = parseInt(params.listId);

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: 'Invalid list ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const list = updateList(listId, name, description);
    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[listId] - Delete a list
export async function DELETE(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const listId = parseInt(params.listId);

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: 'Invalid list ID' },
        { status: 400 }
      );
    }

    const success = deleteList(listId);
    if (!success) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    );
  }
}
