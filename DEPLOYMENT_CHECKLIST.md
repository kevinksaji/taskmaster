# Vercel Deployment Checklist

## Before deploying

- Push this project to a Git repository that Vercel can access.
- Confirm the required environment variables exist:
  - `BOT_TOKEN`
  - `TELEGRAM_WEBHOOK_SECRET`
  - `STORAGE_DATABASE_URL`
  - `STORAGE_DATABASE_URL_UNPOOLED`
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `SESSION_TTL_SECONDS` if you want a non-default session expiry
  - `APP_BASE_URL`
- Confirm your Neon database is reachable.
- Confirm your Redis instance is reachable.
- Confirm your Telegram bot token is valid.

## Vercel project setup

- Create a new Vercel project from the repository.
- Framework preset: `Other`.
- Root directory: project root.
- Leave Vercel to use the repository defaults.
- Add environment variables for Production, Preview, and Development as needed.

## Required environment variables

- `BOT_TOKEN`: Telegram bot token from BotFather.
- `TELEGRAM_WEBHOOK_SECRET`: Any long random secret string used to validate Telegram webhook requests.
- `STORAGE_DATABASE_URL`: Neon/Vercel Storage pooled connection string.
- `STORAGE_DATABASE_URL_UNPOOLED`: Neon/Vercel Storage direct connection string.
- `KV_REST_API_URL`: Upstash Redis REST endpoint for transient workflow state.
- `KV_REST_API_TOKEN`: Upstash Redis REST token for transient workflow state.
- `SESSION_TTL_SECONDS`: Optional TTL in seconds for Redis workflow keys. Defaults to `604800`.
- `APP_BASE_URL`: Final deployed base URL, for example `https://your-project.vercel.app`.

## First production deploy

- Trigger the initial Vercel deployment.
- Before sending traffic to a brand-new production database, apply the committed Prisma migrations:
  ```bash
  npm run prisma:deploy
  ```
- Set the Telegram webhook:
  ```bash
  npm run webhook:set
  ```
- Confirm the webhook endpoint is:
  ```text
  https://your-project.vercel.app/api/telegram/webhook
  ```

## Verification

- Open the deployed health or webhook route if needed.
- Send `/start` to the bot.
- Confirm commands appear in Telegram.
- Confirm `t do the laundry` prompts for epic selection with inline buttons.
- Confirm `/t` shows epics and then tasks as inline buttons.
- Confirm tapping a task deletes it immediately.
- Confirm `/e` shows epics plus a cancel button.
- Confirm tapping an epic deletes it and its tasks immediately.
- Confirm `/c` clears a pending task-batch operation without replaying the `/start` intro.

## Rollback and maintenance

- To remove the webhook:
  ```bash
  npm run webhook:delete
  ```
- If you change domains, update `APP_BASE_URL` and run `npm run webhook:set` again.
- If you change schema, create a new migration locally with `npm run prisma:migrate -- --name <change>` and apply committed migrations to production with `npm run prisma:deploy`.
