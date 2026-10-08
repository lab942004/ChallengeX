import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

async function main() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info('ChallengeX backend listening', {
      port: env.PORT,
      env: env.NODE_ENV,
    });
  });

  const shutdown = async (signal: string) => {
    logger.info('Shutting down', { signal });
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Force exit if graceful shutdown stalls.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason: String(reason) });
  });
}

main().catch((err) => {
  logger.error('Failed to start backend', { message: String(err) });
  process.exit(1);
});
