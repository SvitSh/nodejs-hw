import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRouter from './routes/notesRoutes.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import { errors as celebrateErrors } from 'celebrate';

const app = express();

// корень — всегда 404
app.head('/', (_req, res) => res.sendStatus(404));
app.get('/', (_req, res) => res.status(404).json({ message: 'Not found' }));

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(logger);

// порядок: роуты → 404 → ошибки
app.use(authRouter);
app.use(notesRouter);
app.use(userRouter);

app.use(notFoundHandler);
app.use(celebrateErrors());
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

try {
  await connectMongoDB(process.env.MONGO_URL);
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
