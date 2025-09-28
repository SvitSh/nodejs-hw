export function errorHandler(err, req, res, _next) {
  req.log?.error?.(err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
}
