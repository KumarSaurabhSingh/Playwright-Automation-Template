/**
 * @file logger.ts
 * @description Central logging utility built on winston. Writes colourised logs to
 * the console AND rotating files under logs/. Use `logger.info/debug/warn/error`
 * everywhere instead of console.log so all output is timestamped and searchable.
 */
import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize } = winston.format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp: ts }) => `${ts} [${level.toUpperCase()}] ${message}`)
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.resolve(__dirname, '../../logs', 'app.log'),
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),
  ],
});
