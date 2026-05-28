import { Telegraf } from 'telegraf';

import { env } from '../config/env';
import { registerCommands } from '../commands';
import { handleCallbackQuery } from '../actions/callbackRouter';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { routeTextFlow } from '../scenes/textFlowRouter';
import { ensureBotBootstrap } from '../services/bootstrapService';
import { logger } from '../utils/logger';

let botInstance: Telegraf | null = null;

export async function getBot() {
  if (!botInstance) {
    const bot = new Telegraf(env.BOT_TOKEN);

    bot.use(async (ctx, next) => {
      logger.info('telegram.update.received', {
        updateType: ctx.updateType,
        fromId: ctx.from?.id,
        chatId: ctx.chat?.id,
      });
      await next();
    });

    registerCommands(bot);
    bot.on('callback_query', handleCallbackQuery);
    bot.on('text', withErrorHandling(async (ctx) => {
      await routeTextFlow(ctx);
    }));

    bot.catch((error, ctx) => {
      logger.error('telegram.bot.unhandled', {
        error: error instanceof Error ? error.message : 'Unknown error',
        updateType: ctx.updateType,
      });
    });

    botInstance = bot;
  }

  await ensureBotBootstrap(botInstance);
  return botInstance;
}
