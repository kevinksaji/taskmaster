# Taskmaster

Taskmaster is a production-ready Telegram bot for processing epics and tasks inside Telegram. It uses a text-first command flow, inline selection buttons, and a webhook-first architecture that works consistently in local development and on Vercel.

## Project overview

Taskmaster lets each Telegram user work through an existing backlog without memorising IDs. The bot is intentionally stripped down to four commands and two message prefixes: send `t ...` to stage one or more tasks, send `e ...` to create epics, use `/t` to browse tasks by epic, use `/e` to delete epics, and use `/c` to cancel the current operation.

Core capabilities:

- `t ...` creates a pending batch of one or more tasks from a single user message
- Inline epic selection assigns the whole task batch to one epic in the next step
- Inline `Create epic` lets the user create a missing epic without restarting the task flow
- `/t` shows epics as inline buttons, then shows tasks for the selected epic
- Tapping a task deletes it immediately, so complete means deleted
- `/e` shows epics as inline buttons and deletes the selected epic together with all of its tasks
- `/c` cancels the current pending operation without replaying the `/start` introduction

## Architecture summary

The application follows a layered structure:

- `src/commands`: Telegram slash command entrypoints
- `src/scenes`: Text router for prefixes and pending user operations
- `src/actions`: Inline callback router for browsing and destructive actions
- `src/services`: Business rules and ownership enforcement
- `src/repositories`: Prisma data access helpers
- `src/keyboards`: Reusable inline keyboard builders
- `src/utils`: Callback encoding, logging, and shared Telegram helpers
- `src/api`: Shared webhook processing logic
- `api/telegram/webhook.ts`: Vercel webhook entrypoint
- `prisma/schema.prisma`: Database schema for epics, tasks, and persisted operation state

The bot stays stateless at the process level for browsing because inline callback payloads carry the selected entity IDs. It persists a small `NavigationState` record only for pending message-driven task creation, so a user can send `t item one\nitem two` first and choose or create the destination epic in the next step.

## Required environment variables

Create a local `.env` file from `.env.example` and set:

- `BOT_TOKEN`: Telegram bot token from BotFather
- `TELEGRAM_WEBHOOK_SECRET`: Secret used for Telegram webhook header validation
- `STORAGE_DATABASE_URL`: Neon/Vercel Storage pooled connection string for Prisma
- `STORAGE_DATABASE_URL_UNPOOLED`: Neon/Vercel Storage direct connection string for Prisma migrations and other non-pooled operations
- `APP_BASE_URL`: Public base URL of your app, for example `https://your-app.vercel.app`
- `PORT`: Local dev port, defaults to `3000`

## Neon Postgres setup

1. Create a Neon project.
2. Create or use a PostgreSQL database in Neon.
3. Copy the Prisma connection string into `STORAGE_DATABASE_URL`.
4. Copy the non-pooled connection string into `STORAGE_DATABASE_URL_UNPOOLED`.
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
   - `STORAGE_DATABASE_URL`
   - `STORAGE_DATABASE_URL_UNPOOLED`
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

Slash commands remain available for direct access, but the bot's primary UX is message-first and inline for selection.

- `/start`: Initialize the bot and show the intro once
- `/t`: Browse epics, then browse and complete tasks inside a selected epic
- `/e`: Browse epics and delete one immediately
- `/c`: Cancel the current pending operation

Message prefixes:

- `t do the laundry`: Start a task batch and then choose the destination epic
- `t do the laundry\nbuy milk\ncall mum`: Stage multiple tasks and add all of them to one epic in the next step
- `e Home`: Create a new epic from a plain message

## Example user flows

### Complete a task

1. User sends `/start`
2. User sends `/t`
3. Bot shows all epics as inline buttons
4. User taps one epic
5. Bot shows all tasks in that epic as inline buttons
6. User taps a task button
7. Bot deletes the task and refreshes the same inline task list immediately

### Clear an epic

1. User sends `/e`
2. Bot shows all epics as inline buttons and a cancel button
3. User taps an epic button
4. Bot deletes that epic and all of its tasks immediately

### Create multiple tasks

1. User sends `t do the laundry\nbuy milk\ncall mum`
2. Bot stores the pending task batch and shows epics as inline buttons
3. User either selects an existing epic or taps `Create epic`
4. If `Create epic` was tapped, the bot asks for the new epic name in a follow-up message
5. Bot creates the epic if needed, creates the whole task batch, then shows the resulting epic task list

## Operation state notes

This project does not rely on in-memory Telegraf session storage. Instead:

- Each user gets a small persisted `NavigationState` record
- The record stores whether `/start` has already been shown and whether a task batch is waiting for epic selection or epic creation
- The same bot behavior works locally and in Vercel serverless functions

## Troubleshooting

- If the bot does not respond, confirm the webhook is registered and points to the right `APP_BASE_URL`.
- If Telegram returns `403`, verify `TELEGRAM_WEBHOOK_SECRET` matches the header secret configured in `setWebhook`.
- If Prisma fails to connect, verify the pooled Prisma connection string in `STORAGE_DATABASE_URL` and the direct connection string in `STORAGE_DATABASE_URL_UNPOOLED`.
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
3. Add `BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `STORAGE_DATABASE_URL`, `STORAGE_DATABASE_URL_UNPOOLED`, and `APP_BASE_URL` in Vercel.
4. Deploy the app.
5. Apply Prisma migrations to the Neon production database with `npm run prisma:deploy`.
6. Run `npm run webhook:set` with the production `APP_BASE_URL`.

## How to set the Telegram webhook

1. Ensure `APP_BASE_URL` points at the deployed app or local tunnel URL.
2. Ensure `TELEGRAM_WEBHOOK_SECRET` is set.
3. Run `npm run webhook:set`.
4. Confirm Telegram reports success.

## Future improvements

1. Add focused integration tests for prefix parsing, task-batch creation, and inline deletion flows.
2. Add conflict-friendly duplicate-name handling for large personal backlogs.
3. Add soft-delete or archive support if recovery is ever needed.
4. Add optional admin analytics and audit logging.
