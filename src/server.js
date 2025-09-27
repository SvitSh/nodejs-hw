const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http')();
require('dotenv').config();

const app = express();

// базовые middleware
app.use(cors());
app.use(express.json());
app.use(pinoHttp);

// ---- notes routes (temporary responses) ----
app.get('/notes', (req, res) => {
  res.status(200).json({ message: 'Retrieved all notes' });
});

app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
});

// ---- test error route ----
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 — после всех роутов
app.use((req, res, _next) => {
  res.status(404).json({ message: 'Route not found' });
});

// 500 — обработчик ошибок
app.use((err, req, res, _next) => {
  req.log?.error?.(err);
  const message = err.message || 'Internal Server Error';
  res.status(500).json({ message });
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
