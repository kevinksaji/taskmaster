import 'dotenv/config';

import { z } from 'zod';

const schema = z.object({
  BOT_TOKEN: z.string().min(1),
  APP_BASE_URL: z.string().url(),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1),
});

const env = schema.parse(process.env);
const webhookUrl = `${env.APP_BASE_URL.replace(/\/$/, '')}/api/telegram/webhook`;

async function main() {
  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: false,
    }),
  });

  const body = await response.json();
  if (!response.ok || !body.ok) {
    throw new Error(`Failed to set webhook: ${body.description ?? response.statusText}`);
  }

  console.log(`Webhook set to ${webhookUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
