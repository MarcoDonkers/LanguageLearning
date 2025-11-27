'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { WordListWithStats } from '@/types';

export default function Home() {
  const [lists, setLists] = useState<WordListWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [listToDelete, setListToDelete] = useState<WordListWithStats | null>(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/lists');
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName,
          description: newListDescription,
        }),
      });

      if (response.ok) {
        setNewListName('');
        setNewListDescription('');
        setShowCreateForm(false);
        fetchLists();
      }
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const handleDeleteList = async () => {
    if (!listToDelete) return;

    try {
      const response = await fetch(`/api/lists/${listToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLists(lists.filter((l) => l.id !== listToDelete.id));
        setListToDelete(null);
      } else {
        console.error('Failed to delete list');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-heading font-bold text-primary-600 mb-2">
            Dutch Learning App
          </h1>
          <p className="text-lg text-gray-700">
            Your cute language learning companion 🐱
          </p>
        </div>

        {/* Create New List Form */}
        {showCreateForm ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Word List</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateList} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="List name (e.g., Common Phrases)"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Description (optional)"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit">Create List</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewListName('');
                      setNewListDescription('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="mb-6"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Create New List
          </Button>
        )}

        {/* Word Lists Grid */}
        {lists.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 mb-4">
                No word lists yet. Create your first list to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div key={list.id} className="relative group">
                <Link href={`/lists/${list.id}`} className="block h-full">
                  <Card className="h-full cursor-pointer transition-transform hover:scale-105">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="pr-8">
                          <CardTitle className="text-xl">{list.name}</CardTitle>
                          {list.description && (
                            <CardDescription>{list.description}</CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Total words:</span>
                          <span className="font-semibold text-primary-600">
                            {list.word_count}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due for review:</span>
                          <span className="font-semibold text-secondary-600">
                            {list.due_count}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setListToDelete(list);
                  }}
                  aria-label="Delete list"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {listToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
              <CardHeader>
                <div className="flex items-center gap-3 text-red-600 mb-2">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <CardTitle>Delete List?</CardTitle>
                </div>
                <CardDescription>
                  Are you sure you want to delete "{listToDelete.name}"? This action cannot be undone and will delete all words in this list.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setListToDelete(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDeleteList}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
