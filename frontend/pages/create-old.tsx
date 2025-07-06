import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface Question {
  text: string;
  type: 'BOOLEAN' | 'INPUT' | 'CHECKBOX';
  options: string[];
  correctAnswers: string[];
}

const CreateQuizPage: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      text: '',
      type: 'BOOLEAN',
      options: [],
      correctAnswers: ['']
    }
  ]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: 'BOOLEAN',
        options: [],
        correctAnswers: ['']
      }
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.push('');
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updated);
  };

  const addCorrectAnswer = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].correctAnswers.push('');
    setQuestions(updated);
  };

  const updateCorrectAnswer = (questionIndex: number, answerIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].correctAnswers[answerIndex] = value;
    setQuestions(updated);
  };

  const removeCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].correctAnswers.length > 1) {
      updated[questionIndex].correctAnswers.splice(answerIndex, 1);
    }
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        throw new Error('Failed to create quiz');
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
          <label htmlFor="title" className="block text-sm font-medium mb-2">Quiz Title</label>
          <input
            id="title"
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
          
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="border p-4 rounded mb-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-lg">Question {questionIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-500 hover:text-red-700 px-2 py-1"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Question Text</label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Enter question text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Question Type</label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BOOLEAN">Boolean (True/False)</option>
                    <option value="INPUT">Input (Text Answer)</option>
                    <option value="CHECKBOX">Multiple Choice</option>
                  </select>
                </div>

                {question.type === 'CHECKBOX' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Options</label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Option text"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          className="text-red-500 hover:text-red-700 px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(questionIndex)}
                      className="text-blue-500 hover:text-blue-700 px-2 py-1"
                    >
                      + Add Option
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Correct Answers</label>
                  {question.correctAnswers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => updateCorrectAnswer(questionIndex, answerIndex, e.target.value)}
                        className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Correct answer"
                      />
                      {question.correctAnswers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCorrectAnswer(questionIndex, answerIndex)}
                          className="text-red-500 hover:text-red-700 px-2 py-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addCorrectAnswer(questionIndex)}
                    className="text-blue-500 hover:text-blue-700 px-2 py-1"
                  >
                    + Add Correct Answer
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Add Question
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
};

export default CreateQuizPage;
