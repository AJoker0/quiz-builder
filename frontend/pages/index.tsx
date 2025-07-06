import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { Plus, FileText, Trash2, Calendar } from 'lucide-react';
import { quizAPI, QuizListItem } from '../services/api';

interface Props {
  initialQuizzes: QuizListItem[];
}

export default function Home({ initialQuizzes }: Props) {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>(initialQuizzes);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeleteLoading(id);
    try {
      await quizAPI.deleteQuiz(id);
      setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    } finally {
      setDeleteLoading(null);
    }
  };

  const refreshQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizAPI.getQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Head>
        <title>Quiz Builder - Dashboard</title>
        <meta name="description" content="Create and manage your quizzes" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quiz*-Builder</h1>
                <p className="text-gray-600 mt-2">Create and manage your quizzes</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={refreshQuizzes}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <Link href="/create" className="btn-primary inline-flex items-center gap-2">
                  <Plus size={20} />
                  Create Quiz
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <FileText className="text-primary-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
                  <p className="text-gray-600">Total Quizzes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz List */}
          <div className="space-y-4">
            {quizzes.length === 0 ? (
              <div className="card p-12 text-center">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
                <p className="text-gray-600 mb-6">Create your first quiz to get started</p>
                <Link href="/create" className="btn-primary">
                  Create Quiz
                </Link>
              </div>
            ) : (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link href={`/quizzes/${quiz.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                          {quiz.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText size={16} />
                          {quiz.questionCount} question{quiz.questionCount !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(quiz.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/quizzes/${quiz.id}`} className="btn-secondary">
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(quiz.id, quiz.title)}
                        disabled={deleteLoading === quiz.id}
                        className="btn-danger inline-flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        {deleteLoading === quiz.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const quizzes = await quizAPI.getQuizzes();
    return {
      props: {
        initialQuizzes: quizzes,
      },
    };
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return {
      props: {
        initialQuizzes: [],
      },
    };
  }
};
