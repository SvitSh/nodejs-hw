import pinoHttp from 'pino-http';
const usePretty = process.env.NODE_ENV !== 'production';
export const logger = pinoHttp(
  usePretty
    ? { transport: { target: 'pino-pretty', options: { translateTime: 'SYS:standard' } } }
    : {}
);
