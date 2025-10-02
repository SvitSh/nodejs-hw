import createHttpError, { HttpError } from 'http-errors';

export function errorHandler(err, req, res, _next) {
  req.log?.error?.(err);

  const isHttp = err instanceof HttpError;
  const status = isHttp ? err.status : 500;
  const message = isHttp ? err.message : 'Internal Server Error';

  res.status(status).json({ message });
}
