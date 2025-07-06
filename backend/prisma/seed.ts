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
        {
            text: 'What is the output of typeof null?',
            type: QuestionType.INPUT,
            options: [],
            correctAnswers: ['object'],
            order: 1
          },
          {
            text: 'Which of the following are JavaScript data types?',
            type: QuestionType.CHECKBOX,
            options: ['String', 'Number', 'Boolean', 'Array', 'Object'],
            correctAnswers: ['String', 'Number', 'Boolean', 'Object'],
            order: 2
          }
        ]
      }
    }
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'React Fundamentals',
      questions: {
        create: [
          {
            text: 'React components must return a single element',
            type: QuestionType.BOOLEAN,
            options: ['True', 'False'],
            correctAnswers: ['False'],
            order: 0
          },
          {
            text: 'What hook is used for managing state in functional components?',
            type: QuestionType.INPUT,
            options: [],
            correctAnswers: ['useState'],
            order: 1
          },
          {
            text: 'Which are valid React hooks?',
            type: QuestionType.CHECKBOX,
            options: ['useState', 'useEffect', 'useContext', 'useRouter', 'useCallback'],
            correctAnswers: ['useState', 'useEffect', 'useContext', 'useCallback'],
            order: 2
          }
        ]
      }
    }
  });

  console.log('Database seeded successfully');
  console.log(`Created quiz: ${quiz1.title}`);
  console.log(`Created quiz: ${quiz2.title}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
