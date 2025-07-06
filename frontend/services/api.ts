import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(` ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(` ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export interface Question {
  id?: string;
  text: string;
  type: 'BOOLEAN' | 'INPUT' | 'CHECKBOX';
  options: string[];
  correctAnswers: string[];
  order?: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
}

export interface QuizListItem {
  id: string;
  title: string;
  questionCount: number;
  createdAt: string;
}

export interface CreateQuizRequest {
  title: string;
  questions: Omit<Question, 'id' | 'order'>[];
}

export const quizAPI = {
  // Get all quizzes
  getQuizzes: async (): Promise<QuizListItem[]> => {
    const response = await api.get('/quizzes');
    return response.data;
  },

  // Get quiz by ID
  getQuiz: async (id: string): Promise<Quiz> => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  // Create new quiz
  createQuiz: async (data: CreateQuizRequest): Promise<Quiz> => {
    const response = await api.post('/quizzes', data);
    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (id: string): Promise<void> => {
    await api.delete(`/quizzes/${id}`);
  },
};

export default api;
