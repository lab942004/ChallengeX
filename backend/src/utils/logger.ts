/* Minimal structured logger. Never logs secrets or password hashes. */

type Level = 'info' | 'warn' | 'error' | 'debug';

function write(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    ...(meta ?? {}),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else if (level === 'debug' && process.env.NODE_ENV !== 'production') console.debug(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => write('debug', message, meta),
};
