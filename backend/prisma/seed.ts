import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('seeding database!');

const quiz1 =await prisma.quiz.create({
  data: {
    title: 'JavaScript basics',
    questions: {
      create: [
        {
          text: 'JavaScript is compiled language',
          type: QuestionType.BOOLEAN,
          options: ['True', ' False'],
          correctAnswers: ['False'],
          order: 0
        },
        
