import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface Question {
  text: string;
  type: 'BOOLEAN' | 'INPUT' | 'CHECKBOX';
  options: string[];
  correctAnswers: string[];
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', type: 'BOOLEAN', options: [], correctAnswers: [''] }
  ]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', type: 'BOOLEAN', options: [], correctAnswers: [''] }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    
    // Сброс опций и правильных ответов при изменении типа
    if (field === 'type') {
      if (value === 'BOOLEAN') {
        updated[index].options = [];
        updated[index].correctAnswers = ['true'];
      } else if (value === 'INPUT') {
        updated[index].options = [];
        updated[index].correctAnswers = [''];
      } else if (value === 'CHECKBOX') {
        updated[index].options = ['', ''];
        updated[index].correctAnswers = [];
      }
    }
    
    setQuestions(updated);
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
    // Также удаляем этот вариант из правильных ответов, если он там есть
    const removedOption = updated[questionIndex].options[optionIndex];
    updated[questionIndex].correctAnswers = updated[questionIndex].correctAnswers.filter(
      answer => answer !== removedOption
    );
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (questionIndex: number, option: string) => {
    const updated = [...questions];
    const correctAnswers = updated[questionIndex].correctAnswers;
    
    if (correctAnswers.includes(option)) {
      updated[questionIndex].correctAnswers = correctAnswers.filter(answer => answer !== option);
    } else {
      updated[questionIndex].correctAnswers = [...correctAnswers, option];
    }
    
    setQuestions(updated);
  };

  const setBooleanAnswer = (questionIndex: number, answer: string) => {
    const updated = [...questions];
    updated[questionIndex].correctAnswers = [answer];
    setQuestions(updated);
  };

  const setInputAnswer = (questionIndex: number, answer: string) => {
    const updated = [...questions];
    updated[questionIndex].correctAnswers = [answer];
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
        alert('Failed to create quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionInputs = (question: Question, index: number) => {
    switch (question.type) {
      case 'BOOLEAN':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Correct Answer</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setBooleanAnswer(index, 'true')}
                className={`px-4 py-2 rounded border ${
                  question.correctAnswers.includes('true')
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                True
              </button>
              <button
                type="button"
                onClick={() => setBooleanAnswer(index, 'false')}
                className={`px-4 py-2 rounded border ${
                  question.correctAnswers.includes('false')
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                False
              </button>
            </div>
          </div>
        );

      case 'INPUT':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Correct Answer</label>
            <input
              type="text"
              value={question.correctAnswers[0] || ''}
              onChange={(e) => setInputAnswer(index, e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the correct answer"
            />
          </div>
        );

      case 'CHECKBOX':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Answer Options</label>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={question.correctAnswers.includes(option)}
                    onChange={() => toggleCorrectAnswer(index, option)}
                    className="w-4 h-4"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter option text"
                  />
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index, optionIndex)}
                      className="text-red-500 hover:text-red-700 px-2 py-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addOption(index)}
              className="mt-2 text-blue-500 hover:text-blue-700 px-2 py-1"
            >
              + Add Option
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Check the boxes next to correct answers
            </p>
          </div>
        );

      default:
        return null;
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
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Enter quiz title"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Questions</h2>
          
          {questions.map((question, index) => (
            <div key={index} className="border rounded-lg p-6 mb-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-lg">Question {index + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-500 hover:text-red-700 px-3 py-1 rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question Text</label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter question text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Question Type</label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BOOLEAN">Boolean (True/False)</option>
                    <option value="INPUT">Input (Text Answer)</option>
                    <option value="CHECKBOX">Multiple Choice</option>
                  </select>
                </div>

                {renderQuestionInputs(question, index)}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Question
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
