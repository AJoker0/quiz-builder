import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import quizRoutes from './routes/quizzes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());


app.use('/quizzes', quizRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL}`);
});

process.on('SIGINT', async () => {
  console.log('\n Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
