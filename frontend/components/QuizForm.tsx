import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function QuizForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { text: '', type: 'BOOLEAN', options: '', correctAnswers: '', order: 0 }
  ]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', type: 'BOOLEAN', options: '', correctAnswers: '', order: questions.length }]);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = questions.map(q => ({
      ...q,
      options: JSON.stringify(q.options.split(',')),
      correctAnswers: JSON.stringify(q.correctAnswers.split(','))
    }));
    await axios.post('http://localhost:3001/quizzes', { title, questions: formatted });
    router.push('/quizzes');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-medium">Quiz Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input" required />
      </div>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="border p-4 rounded">
            <label>Text</label>
            <input type="text" value={q.text} onChange={e => handleChange(i, 'text', e.target.value)} className="input mb-2" />

            <label>Type</label>
            <select value={q.type} onChange={e => handleChange(i, 'type', e.target.value)} className="input mb-2">
              <option value="BOOLEAN">BOOLEAN</option>
              <option value="INPUT">INPUT</option>
              <option value="CHECKBOX">CHECKBOX</option>
            </select>

            <label>Options (comma-separated)</label>
            <input type="text" value={q.options} onChange={e => handleChange(i, 'options', e.target.value)} className="input mb-2" />

            <label>Correct Answers (comma-separated)</label>
            <input type="text" value={q.correctAnswers} onChange={e => handleChange(i, 'correctAnswers', e.target.value)} className="input" />
          </div>
        ))}
      </div>
      <button type="button" onClick={handleAddQuestion} className="btn-secondary">Add Question</button>
      <button type="submit" className="btn-primary">Save Quiz</button>
    </form>
  );
}
