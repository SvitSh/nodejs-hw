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

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

app.use(authRouter);
app.use(notesRouter);

app.use(notFoundHandler);
import { errors as celebrateErrors } from 'celebrate';
app.use(celebrateErrors());
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
