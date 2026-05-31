import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import { env } from '../config/env';
import { handleCallbackQuery } from '../actions/callbackRouter';
import { registerCommands } from '../commands';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { routeNavigationText } from '../scenes/navigationTextRouter';
import { ensureBotBootstrap } from '../services/bootstrapService';
import { logger } from '../utils/logger';

// The bot is created lazily and reused across requests so webhook handlers do
// not re-register middleware and commands on every invocation.
let botInstance: Telegraf | null = null;

export async function getBot() {
  if (!botInstance) {
    const bot = new Telegraf(env.BOT_TOKEN);

    // Log every incoming Telegram update once near the entrypoint so failures in
    // downstream handlers can still be correlated with the original update type
    // and actor identifiers.
    bot.use(async (ctx, next) => {
      logger.info('telegram.update.received', {
        updateType: ctx.updateType,
        fromId: ctx.from?.id,
        chatId: ctx.chat?.id,
      });
      await next();
    });

    // Slash commands are explicit entrypoints such as /start, /t, /e, and /c.
    registerCommands(bot);

    // Inline keyboard taps arrive as callback queries and continue flows without
    // requiring the user to type follow-up commands or identifiers.
    bot.on('callback_query', withErrorHandling(async (ctx) => {
      await handleCallbackQuery(ctx);
    }));

    // Plain text messages drive the message-first UX: prefixed inputs like
    // `t buy milk` and `e Home`, plus the follow-up epic name after the user
    // taps `Create epic` in the task-batch flow.
    bot.on(message('text'), withErrorHandling(async (ctx) => {
      await routeNavigationText(ctx);
    }));

    // Anything that escapes the per-handler wrappers is caught here so the bot
    // does not crash silently on unexpected Telegram payloads or runtime errors.
    bot.catch((error, ctx) => {
      logger.error('telegram.bot.unhandled', {
        error: error instanceof Error ? error.message : 'Unknown error',
        updateType: ctx.updateType,
      });
    });

    botInstance = bot;
  }

  // Command registration must exist before this runs, because bootstrap can
  // perform one-time bot setup such as syncing the command list with Telegram.
  await ensureBotBootstrap(botInstance);
  return botInstance;
}
