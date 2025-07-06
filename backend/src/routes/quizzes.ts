import express from 'express';
import { PrismaClient, QuestionType } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const QuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.nativeEnum(QuestionType),
  options: z.array(z.string()).optional().default([]),
  correctAnswers: z.array(z.string()).optional().default([]),
});

const CreateQuizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required'),
  questions: z.array(QuestionSchema).min(1, 'At least one question is required'),
});

// GET /quizzes - Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedQuizzes = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      questionCount: quiz._count.questions,
      createdAt: quiz.createdAt,
    }));

    res.json(formattedQuizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// GET /quizzes/:id - Get quiz details with all questions
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const parsedQuiz = {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: JSON.parse(q.options),
        correctAnswers: JSON.parse(q.correctAnswers),
      })),
    };

    res.json(parsedQuiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// POST /quizzes - Create a new quiz
router.post('/', async (req, res) => {
  try {
    const validatedData = CreateQuizSchema.parse(req.body);

    const quiz = await prisma.quiz.create({
      data: {
        title: validatedData.title,
        questions: {
  create: validatedData.questions.map((question, index) => ({
    text: question.text,
    type: question.type,
    options: JSON.stringify(question.options),
    correctAnswers: JSON.stringify(question.correctAnswers),
    order: index
  })),
},
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    const parsedQuiz = {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: JSON.parse(q.options),
        correctAnswers: JSON.parse(q.correctAnswers),
      })),
    };

    res.status(201).json(parsedQuiz);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// DELETE /quizzes/:id - Delete a quiz
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    await prisma.quiz.delete({
      where: { id },
    });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

export default router;
