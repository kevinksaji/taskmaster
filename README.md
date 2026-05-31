# Taskmaster

Taskmaster is a production-ready Telegram bot for managing Scrum-style epics and tasks entirely inside Telegram. It uses slash commands, persistent `/tasks` and `/epics` reply-keyboard buttons, compact action menus, and a webhook-first architecture that works consistently in local development and on Vercel.

## Project overview

Taskmaster lets each Telegram user manage their own backlog without memorising IDs. Users create epics such as `Things to buy for going overseas`, then add tasks like `Moisturiser` or `Wash the car` inside the right epic. All selection-heavy flows use inline buttons instead of asking users to type internal identifiers.

Core capabilities:

- Epic create and view flows
- Task create, view, and complete flows
- Persistent `/tasks` and `/epics` reply-keyboard buttons for quick navigation
- Durable multi-step flows backed by PostgreSQL through Prisma
- Stateless webhook processing for Vercel serverless deployment
- Ownership checks on every epic and task operation

## Architecture summary

The application follows a layered structure:

- `src/commands`: Telegram slash command entrypoints
- `src/actions`: Inline button callback router
- `src/scenes`: Durable text-step flow handlers backed by Prisma conversation state
- `src/services`: Business rules and ownership enforcement
- `src/repositories`: Prisma data access helpers
- `src/keyboards`: Reusable inline keyboard builders
- `src/utils`: Validation, formatting, logging, and callback helpers
- `src/api`: Shared webhook processing logic
- `api/telegram/webhook.ts`: Vercel webhook entrypoint
- `prisma/schema.prisma`: Database schema for epics, tasks, and durable conversation state

The bot is deliberately stateless at the process level. Multi-step flows are resumed from the `ConversationState` table, so the next webhook can continue correctly even if Vercel spins up a fresh function instance.

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

The persistent `/tasks` and `/epics` buttons jump straight into the main command flows. Slash commands remain available for direct access and power-user workflows.

- `/start`: Welcome message, command list, and examples
- `/help`: Command reference and usage examples
- `/epics`: Open the epic flow
- `/epic_create`: Create an epic in a guided flow
- `/tasks`: Open the task flow
- `/task_create`: Create a task in a guided flow
- `/cancel`: Cancel the active multi-step flow

## Example user flows

### Create an epic

1. User sends `/epic_create`
2. Bot asks for the epic name
3. Bot stores the epic and shows follow-up buttons

### Create a task

1. User sends `/task_create`
2. Bot asks for the task name
3. Bot asks the user to pick an epic with inline buttons
4. Bot stores the task immediately and shows follow-up buttons

## Stateless webhook notes

This project does not rely on in-memory Telegraf session storage. Instead:

- Active conversation state is stored in the database
- Each incoming webhook request can resume the next step independently
- The same bot behavior works locally and in Vercel serverless functions

## Troubleshooting

- If the bot does not respond, confirm the webhook is registered and points to the right `APP_BASE_URL`.
- If Telegram returns `403`, verify `TELEGRAM_WEBHOOK_SECRET` matches the header secret configured in `setWebhook`.
- If Prisma fails to connect, verify the pooled Prisma connection string in `STORAGE_POSTGRES_PRISMA_URL` and the direct connection string in `STORAGE_POSTGRES_URL_NON_POOLING`.
- If you see errors that tables like `ConversationState`, `Epic`, or `Task` do not exist, the new database has not had Prisma migrations applied yet. Run `npm run prisma:deploy` against that database.
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

1. Add task comments and activity history.
2. Add recurring tasks and reminders.
3. Add richer pagination and inline search for very large backlogs.
4. Add test coverage for services and callback flows.
5. Add optional admin analytics and audit logging.
