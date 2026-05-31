# Taskmaster

Taskmaster is a production-ready Telegram bot for processing epics and tasks inside Telegram. It uses a compact inline hub, direct tap actions, and a webhook-first architecture that works consistently in local development and on Vercel.

## Project overview

Taskmaster lets each Telegram user work through an existing backlog without memorising IDs. The bot is intentionally stripped down to a single inline hub: tap `Tasks` to see every task as a button, tap a task to complete it immediately, tap `Epics` to see every epic as a button, and tap an epic to delete that epic together with all of its tasks.

Core capabilities:

- Inline start screen with `Tasks` and `Epics`
- Inline hub with `Tasks`, `Epics`, and `Back`
- Direct tap-to-complete task buttons with no confirmation screen
- Direct tap-to-delete epic buttons with cascade task deletion and no confirmation screen
- Stateless hub navigation encoded in callback payloads instead of server-side flow state
- Ownership checks on every epic and task operation

## Architecture summary

The application follows a layered structure:

- `src/commands`: Telegram slash command entrypoints
- `src/actions`: Inline button callback router
- `src/services`: Business rules and ownership enforcement
- `src/repositories`: Prisma data access helpers
- `src/keyboards`: Reusable inline hub and list keyboard builders
- `src/utils`: Callback encoding, logging, and shared Telegram helpers
- `src/api`: Shared webhook processing logic
- `api/telegram/webhook.ts`: Vercel webhook entrypoint
- `prisma/schema.prisma`: Database schema for epics and tasks

The bot is deliberately stateless at the process level. The inline hub stores its back-stack inside callback data, so the next webhook can rebuild the current screen without a database-backed conversation table.

## Required environment variables

Create a local `.env` file from `.env.example` and set:

- `BOT_TOKEN`: Telegram bot token from BotFather
- `TELEGRAM_WEBHOOK_SECRET`: Secret used for Telegram webhook header validation
- `STORAGE_POSTGRES_PRISMA_URL`: Neon Prisma pooled connection string for Prisma
- `STORAGE_POSTGRES_URL_NON_POOLING`: Neon direct connection string for Prisma migrations and other non-pooled operations
- `APP_BASE_URL`: Public base URL of your app, for example `https://your-app.vercel.app`
- `PORT`: Local dev port, defaults to `3000`

## Neon Postgres setup

1. Create a Neon project.
2. Create or use a PostgreSQL database in Neon.
3. Copy the Prisma connection string into `STORAGE_POSTGRES_PRISMA_URL`.
4. Copy the non-pooled connection string into `STORAGE_POSTGRES_URL_NON_POOLING`.
5. Ensure the database is reachable from Vercel and your local machine.

## Prisma migration steps

1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate the Prisma client:
   ```bash
   npm run prisma:generate
   ```
3. Create and apply the first migration locally:
   ```bash
   npm run prisma:migrate -- --name init
   ```
4. For production, apply committed migrations with:
   ```bash
   npm run prisma:deploy
   ```

## Local development setup

1. Copy `.env.example` to `.env` and fill in all values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client and apply migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```
4. Start the local webhook server:
   ```bash
   npm run dev
   ```
5. Expose your local server with a tunnel such as ngrok:
   ```bash
   ngrok http 3000
   ```
6. Update `APP_BASE_URL` in `.env` to the public tunnel URL.
7. Register the webhook using the helper script:
   ```bash
   npm run webhook:set
   ```

## Vercel deployment steps

1. Create a new Vercel project pointing at this repository.
2. Add the required environment variables in Vercel:
   - `BOT_TOKEN`
   - `TELEGRAM_WEBHOOK_SECRET`
   - `STORAGE_POSTGRES_PRISMA_URL`
   - `STORAGE_POSTGRES_URL_NON_POOLING`
   - `APP_BASE_URL`
3. Set `APP_BASE_URL` to the final Vercel production domain.
4. Deploy the project.
5. Apply Prisma migrations against the production Neon database:
   ```bash
   npm run prisma:deploy
   ```
6. Register the Telegram webhook after deployment with `npm run webhook:set` from a machine that has the same environment variables.

## Webhook behavior

The webhook endpoint is:

- `POST /api/telegram/webhook`

Security behavior:

- Only `POST` is accepted
- `X-Telegram-Bot-Api-Secret-Token` must match `TELEGRAM_WEBHOOK_SECRET`
- Invalid or missing webhook secret returns `403`
- No secrets are logged
- The handler passes valid updates into Telegraf and returns `200` on success

## How to set Telegram webhook

Use the provided helper script:

```bash
npm run webhook:set
```

What it does:

- Targets `${APP_BASE_URL}/api/telegram/webhook`
- Sends `secret_token` equal to `TELEGRAM_WEBHOOK_SECRET`
- Enables `message` and `callback_query` updates

You can also set the webhook manually with Telegram Bot API if needed.

## How to delete Telegram webhook

Use the provided helper script:

```bash
npm run webhook:delete
```

This clears the registered Telegram webhook without dropping pending updates.

## Command list

Slash commands remain available for direct access, but the bot's primary UX is the inline hub.

- `/start`: Welcome message, command list, and examples
- `/help`: Command reference and usage examples
- `/epics`: Open the epic flow
- `/tasks`: Open the task flow

## Example user flows

### Complete a task

1. User sends `/start`
2. Bot shows inline `Tasks` and `Epics` buttons
3. User taps `Tasks`
4. Bot edits the same message into the hub view with `Tasks`, `Epics`, and `Back` plus one button per task
5. User taps a task button
6. Bot deletes the task and removes it from the same message immediately

### Clear an epic

1. User taps `Epics`
2. Bot edits the same message into the hub view with one button per epic
3. User taps an epic button
4. Bot deletes that epic and all of its tasks immediately

## Stateless webhook notes

This project does not rely on in-memory Telegraf session storage or database-backed conversation state. Instead:

- Each inline button carries the next view and a compact back-stack
- Each incoming webhook request can rebuild the current hub screen independently
- The same bot behavior works locally and in Vercel serverless functions

## Troubleshooting

- If the bot does not respond, confirm the webhook is registered and points to the right `APP_BASE_URL`.
- If Telegram returns `403`, verify `TELEGRAM_WEBHOOK_SECRET` matches the header secret configured in `setWebhook`.
- If Prisma fails to connect, verify the pooled Prisma connection string in `STORAGE_POSTGRES_PRISMA_URL` and the direct connection string in `STORAGE_POSTGRES_URL_NON_POOLING`.
- If you see errors that tables like `Epic` or `Task` do not exist, the new database has not had Prisma migrations applied yet. Run `npm run prisma:deploy` against that database.
- If local development does not receive updates, confirm your tunnel URL is live and `APP_BASE_URL` matches it exactly.
- If commands do not appear in Telegram, trigger the webhook once after deployment so the bot can register commands on startup.

## How to run locally

1. Copy `.env.example` to `.env` and fill in all required values.
2. Run `npm install`.
3. Run `npm run prisma:generate`.
4. Run `npm run prisma:migrate -- --name init`.
5. Run `npm run dev`.
6. Start a tunnel such as `ngrok http 3000`.
7. Set `APP_BASE_URL` to the tunnel URL.
8. Run `npm run webhook:set`.

## How to deploy to Vercel

1. Push the project to a Git repository.
2. Import the repository into Vercel.
3. Add `BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `STORAGE_POSTGRES_PRISMA_URL`, `STORAGE_POSTGRES_URL_NON_POOLING`, and `APP_BASE_URL` in Vercel.
4. Deploy the app.
5. Apply Prisma migrations to the Neon production database with `npm run prisma:deploy`.
6. Run `npm run webhook:set` with the production `APP_BASE_URL`.

## How to set the Telegram webhook

1. Ensure `APP_BASE_URL` points at the deployed app or local tunnel URL.
2. Ensure `TELEGRAM_WEBHOOK_SECRET` is set.
3. Run `npm run webhook:set`.
4. Confirm Telegram reports success.

## Future improvements

1. Add optional create flows back behind a separate admin hub.
2. Add test coverage for callback routing and deletion flows.
3. Add soft-delete or archive support if recovery is ever needed.
4. Add optional admin analytics and audit logging.
