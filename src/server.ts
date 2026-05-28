import express from 'express';

import { env } from './config/env';
import { processTelegramWebhook } from './api/telegramWebhook';
import { logger } from './utils/logger';

async function main() {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.post('/api/telegram/webhook', async (req, res) => {
    const result = await processTelegramWebhook({
      method: req.method,
      secretToken: req.header('x-telegram-bot-api-secret-token') ?? undefined,
      body: req.body,
    });

    res.status(result.status).send(result.body);
  });

  app.listen(env.PORT, () => {
    logger.info('server.started', {
      port: env.PORT,
      webhookPath: '/api/telegram/webhook',
    });
  });
}

main().catch((error) => {
  logger.error('server.failed', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exit(1);
});
