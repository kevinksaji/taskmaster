import { Update } from 'telegraf/types';

import { env } from '../config/env';
import { getBot } from '../bot/createBot';
import { logger } from '../utils/logger';

export async function processTelegramWebhook(input: {
  method: string;
  secretToken: string | undefined;
  body: Update | undefined;
}) {
  if (input.method !== 'POST') {
    return { status: 405, body: 'Method Not Allowed' };
  }

  if (!input.secretToken || input.secretToken !== env.TELEGRAM_WEBHOOK_SECRET) {
    logger.warn('telegram.webhook.invalid_secret');
    return { status: 403, body: 'Forbidden' };
  }

  if (!input.body) {
    return { status: 400, body: 'Missing update body' };
  }

  const bot = await getBot();
  await bot.handleUpdate(input.body);

  return { status: 200, body: 'OK' };
}
