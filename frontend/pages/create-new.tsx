import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { text: '', type: 'BOOLEAN', options: [], correctAnswers: [''] }
  ]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', type: 'BOOLEAN', options: [], correctAnswers: [''] }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          questions: questions.filter(q => q.text.trim() !== '')
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/quizzes/${data.id}`);
      } else {
        alert('Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Quiz Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Enter quiz title"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Questions</h2>
          
          {questions.map((question, index) => (
            <div key={index} className="border p-4 rounded mb-4 bg-gray-50">
              <h3 className="font-medium text-lg mb-3">Question {index + 1}</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Question Text</label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                    placeholder="Enter question text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Question Type</label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="BOOLEAN">Boolean (True/False)</option>
                    <option value="INPUT">Input (Text Answer)</option>
                    <option value="CHECKBOX">Multiple Choice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Correct Answer</label>
                  <input
                    type="text"
                    value={question.correctAnswers[0] || ''}
                    onChange={(e) => updateQuestion(index, 'correctAnswers', [e.target.value])}
                    className="w-full p-2 border rounded"
                    placeholder="Enter correct answer"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Question
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
