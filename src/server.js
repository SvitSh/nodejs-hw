import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRouter from './routes/notesRoutes.js';

const app = express();

// базовые middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// --- регистрация роутов ---
app.use('/notes', notesRouter);

// тестовая ошибка
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 и 500
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3030;

try {
  await connectMongoDB(); // подключаемся к Mongo перед стартом сервера
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
