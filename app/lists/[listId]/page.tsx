'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { WordList, Word, QuizDirection } from '@/types';

interface ListWithWords extends WordList {
  words: Word[];
}

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = parseInt(params.listId as string);

  const [list, setList] = useState<ListWithWords | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDutchWord, setNewDutchWord] = useState('');
  const [newEnglishWord, setNewEnglishWord] = useState('');
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quizDirection, setQuizDirection] = useState<QuizDirection>('dutch-to-english');

  useEffect(() => {
    fetchList();
  }, [listId]);

  const fetchList = async () => {
    try {
      const response = await fetch(`/api/lists/${listId}`);
      if (response.ok) {
        const data = await response.json();
        setList(data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to fetch list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDutchWord.trim() || !newEnglishWord.trim()) return;

    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId,
          dutchWord: newDutchWord,
          englishTranslation: newEnglishWord,
        }),
      });

      if (response.ok) {
        setNewDutchWord('');
        setNewEnglishWord('');
        setShowAddForm(false);
        fetchList();
      }
    } catch (error) {
      console.error('Failed to add word:', error);
    }
  };

  const handleUpdateWord = async () => {
    if (!editingWord) return;

    try {
      const response = await fetch(`/api/words/${editingWord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dutchWord: editingWord.dutch_word,
          englishTranslation: editingWord.english_translation,
        }),
      });

      if (response.ok) {
        setEditingWord(null);
        fetchList();
      }
    } catch (error) {
      console.error('Failed to update word:', error);
    }
  };

  const handleDeleteWord = async (wordId: number) => {
    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchList();
      }
    } catch (error) {
      console.error('Failed to delete word:', error);
    }
  };

  const filteredWords = list?.words.filter(
    (word) =>
      word.dutch_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.english_translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dueWords = list?.words.filter(
    (word) => new Date(word.next_review_date) <= new Date()
  );

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!list) {
    return null;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Lists
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-heading font-bold text-primary-600 mb-2">
              {list.name}
            </h1>
            {list.description && (
              <p className="text-gray-600">{list.description}</p>
            )}
          </div>

          {dueWords && dueWords.length > 0 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Quiz Direction:
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={quizDirection === 'dutch-to-english' ? 'default' : 'outline'}
                      className="h-16 flex-col"
                      onClick={() => setQuizDirection('dutch-to-english')}
                    >
                      <span className="font-bold">Dutch → English</span>
                      <span className="text-xs text-gray-500">Classic mode</span>
                    </Button>
                    <Button
                      variant={quizDirection === 'english-to-dutch' ? 'default' : 'outline'}
                      className="h-16 flex-col"
                      onClick={() => setQuizDirection('english-to-dutch')}
                    >
                      <span className="font-bold">English → Dutch</span>
                      <span className="text-xs text-gray-500">Reverse mode</span>
                    </Button>
                    <Button
                      variant={quizDirection === 'mixed' ? 'default' : 'outline'}
                      className="h-16 flex-col"
                      onClick={() => setQuizDirection('mixed')}
                    >
                      <span className="font-bold">Mixed</span>
                      <span className="text-xs text-gray-500">Random both ways</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Link href={`/lists/${listId}/quiz?direction=${quizDirection}`}>
                <Button size="lg" className="w-full gap-2">
                  <Play className="w-5 h-5" />
                  Start Quiz ({dueWords.length} words)
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total Words</div>
              <div className="text-2xl font-bold text-primary-600">
                {list.words.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Due for Review</div>
              <div className="text-2xl font-bold text-secondary-600">
                {dueWords?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Mastered</div>
              <div className="text-2xl font-bold text-accent-600">
                {
                  list.words.filter(
                    (w) => w.review_count > 0 && w.correct_count === w.review_count
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4" />
              Add Word
            </Button>
          )}
        </div>

        {/* Add Word Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Word</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddWord} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Dutch word"
                    value={newDutchWord}
                    onChange={(e) => setNewDutchWord(e.target.value)}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="English translation"
                    value={newEnglishWord}
                    onChange={(e) => setNewEnglishWord(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit">Add Word</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewDutchWord('');
                      setNewEnglishWord('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Words Table */}
        {filteredWords && filteredWords.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-primary-100">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">
                        Dutch
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-700">
                        English
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-700">
                        Reviews
                      </th>
                      <th className="text-right p-4 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWords.map((word) => (
                      <tr key={word.id} className="border-b border-gray-100">
                        {editingWord?.id === word.id ? (
                          <>
                            <td className="p-4">
                              <Input
                                value={editingWord.dutch_word}
                                onChange={(e) =>
                                  setEditingWord({
                                    ...editingWord,
                                    dutch_word: e.target.value,
                                  })
                                }
                              />
                            </td>
                            <td className="p-4">
                              <Input
                                value={editingWord.english_translation}
                                onChange={(e) =>
                                  setEditingWord({
                                    ...editingWord,
                                    english_translation: e.target.value,
                                  })
                                }
                              />
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-600">
                                {word.review_count}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" onClick={handleUpdateWord}>
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingWord(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-4 font-medium">
                              {word.dutch_word}
                            </td>
                            <td className="p-4">{word.english_translation}</td>
                            <td className="p-4">
                              <span className="text-sm text-gray-600">
                                {word.review_count} (
                                {word.review_count > 0
                                  ? Math.round(
                                      (word.correct_count / word.review_count) *
                                        100
                                    )
                                  : 0}
                                % correct)
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingWord(word)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteWord(word.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'No words found matching your search.'
                  : 'No words yet. Add your first word to get started!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
