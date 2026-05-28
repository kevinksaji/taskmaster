# Vercel Deployment Checklist

## Before deploying

- Push this project to a Git repository that Vercel can access.
- Confirm the required environment variables exist:
  - `BOT_TOKEN`
  - `TELEGRAM_WEBHOOK_SECRET`
  - `DATABASE_URL`
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
- `DATABASE_URL`: Neon PostgreSQL connection string.
- `APP_BASE_URL`: Final deployed base URL, for example `https://your-project.vercel.app`.

## First production deploy

- Trigger the initial Vercel deployment.
- After deployment succeeds, run Prisma migration against the production database:
  ```bash
  npm run prisma:migrate -- --name init
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
- Create one epic and one task.
- Confirm callback buttons work.
- Confirm task status updates persist.

## Rollback and maintenance

- To remove the webhook:
  ```bash
  npm run webhook:delete
  ```
- If you change domains, update `APP_BASE_URL` and run `npm run webhook:set` again.
- If you change schema, run a new Prisma migration before expecting the new code path to work.
