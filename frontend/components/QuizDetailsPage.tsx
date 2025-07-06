// frontend/components/QuizDetailsPage.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswers: string[];
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
}

export default function QuizDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:3001/quizzes/${id}`)
        .then(res => res.json())
        .then(data => {
          setQuiz(data);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load quiz');
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!quiz) return <div className="p-6">Quiz not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="border p-4 rounded">
            <h3 className="font-semibold">Question {index + 1}: {question.text}</h3>
            <p className="text-sm text-gray-600">Type: {question.type}</p>
            {question.options.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Options:</p>
                <ul className="list-disc list-inside">
                  {question.options.map((option, idx) => (
                    <li key={idx}>{option}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-2">
              <p className="text-sm font-medium">Correct Answers:</p>
              <ul className="list-disc list-inside text-green-600">
                {question.correctAnswers.map((answer, idx) => (
                  <li key={idx}>{answer}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
