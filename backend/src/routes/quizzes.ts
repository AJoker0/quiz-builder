import express, { Request, Response } from 'express';
import { PrismaClient, QuestionType } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
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

// GET /quizzes - all quizzes with question count
router.get('/', async (req: Request, res: Response) => {
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

    const formatted = quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      questionCount: q._count.questions,
      createdAt: q.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// GET /quizzes/:id - full quiz with parsed JSON
router.get('/:id', async (req: Request, res: Response) => {
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

    const parsed = {
      ...quiz,
      questions: quiz.questions.map((q: any) => ({
        ...q,
        options: JSON.parse(q.options as string),
        correctAnswers: JSON.parse(q.correctAnswers as string),
      })),
    };

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// POST /quizzes - create quiz
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = CreateQuizSchema.parse(req.body);

    const quiz = await prisma.quiz.create({
      data: {
        title: validated.title,
        questions: {
          create: validated.questions.map((q, idx) => ({
            text: q.text,
            type: q.type,
            options: JSON.stringify(q.options) as any,
            correctAnswers: JSON.stringify(q.correctAnswers) as any,
            order: idx,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    const parsed = {
      ...quiz,
      questions: (quiz as any).questions.map((q: any) => ({
        ...q,
        options: JSON.parse(q.options as string),
        correctAnswers: JSON.parse(q.correctAnswers as string),
      })),
    };

    res.status(201).json(parsed);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }

    console.error(err);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// DELETE /quizzes/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    await prisma.quiz.delete({ where: { id } });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

export default router;
