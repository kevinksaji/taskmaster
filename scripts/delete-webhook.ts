import 'dotenv/config';

import { z } from 'zod';

const schema = z.object({
  BOT_TOKEN: z.string().min(1),
});

const env = schema.parse(process.env);

async function main() {
  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/deleteWebhook`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      drop_pending_updates: false,
    }),
  });

  const body = await response.json();
  if (!response.ok || !body.ok) {
    throw new Error(`Failed to delete webhook: ${body.description ?? response.statusText}`);
  }

  console.log('Webhook deleted.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
