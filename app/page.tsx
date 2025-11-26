'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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
              <Link href={`/lists/${list.id}`} key={list.id}>
                <Card className="h-full cursor-pointer transition-transform hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-xl">{list.name}</CardTitle>
                    {list.description && (
                      <CardDescription>{list.description}</CardDescription>
                    )}
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
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
