# Vercel Deployment Checklist

## Before deploying

- Push this project to a Git repository that Vercel can access.
- Confirm the required environment variables exist:
  - `BOT_TOKEN`
  - `TELEGRAM_WEBHOOK_SECRET`
  - `STORAGE_POSTGRES_PRISMA_URL`
  - `STORAGE_POSTGRES_URL_NON_POOLING`
  - `APP_BASE_URL`
- Confirm your Neon database is reachable.
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
- `STORAGE_POSTGRES_PRISMA_URL`: Neon Prisma pooled connection string.
- `STORAGE_POSTGRES_URL_NON_POOLING`: Neon direct connection string.
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
- Confirm the inline Tasks and Epics buttons appear.
- Confirm tapping a task deletes it immediately.
- Confirm tapping an epic deletes it and its tasks immediately.

## Rollback and maintenance

- To remove the webhook:
  ```bash
  npm run webhook:delete
  ```
- If you change domains, update `APP_BASE_URL` and run `npm run webhook:set` again.
- If you change schema, create a new migration locally with `npm run prisma:migrate -- --name <change>` and apply committed migrations to production with `npm run prisma:deploy`.
