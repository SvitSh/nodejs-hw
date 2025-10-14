import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import { connectMongoDB } from './db/connectMongoDB.js';

dotenv.config();

const app = express();

// --- базовые middleware ---
app.use(cors());
app.use(express.json());

// pino-http: читаемые логи в dev, обычные в prod
const usePretty = process.env.NODE_ENV !== 'production';
app.use(
  pinoHttp(
    usePretty
      ? { transport: { target: 'pino-pretty', options: { translateTime: 'SYS:standard' } } }
      : {},
  ),
);

// --- временные маршруты notes (пока без БД, для проверки сервера) ---
app.get('/notes', (_req, res) => {
  res.status(200).json({ message: 'Retrieved all notes' });
});

app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
});

// тестовая ошибка
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 — после всех роутов
app.use((req, res, _next) => {
  res.status(404).json({ message: 'Route not found' });
});

// 500 — обработчик ошибок (должен быть последним)
app.use((err, req, res, _next) => {
  req.log?.error?.(err);
  const message = err.message || 'Internal Server Error';
  res.status(500).json({ message });
});

const PORT = process.env.PORT || 3030;

try {
  // Подключаемся к MongoDB перед стартом сервера
  await connectMongoDB();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
