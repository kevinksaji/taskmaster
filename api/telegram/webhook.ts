import type { VercelRequest, VercelResponse } from '@vercel/node';

import { processTelegramWebhook } from '../../src/api/telegramWebhook';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const result = await processTelegramWebhook({
    method: req.method ?? 'GET',
    secretToken: req.headers['x-telegram-bot-api-secret-token'] as string | undefined,
    body: req.body,
  });

  res.status(result.status).send(result.body);
}
