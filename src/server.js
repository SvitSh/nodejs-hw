import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errors as celebrateErrors } from 'celebrate';

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

// маршруты
app.use('/notes', notesRouter);

// тестовые и служебные (можно оставить)
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404
app.use(notFoundHandler);

// ошибки celebrate должны быть ДО общего обработчика
app.use(celebrateErrors());

// 500 и http-errors
app.use(errorHandler);

const PORT = process.env.PORT || 3030;

try {
  await connectMongoDB();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
