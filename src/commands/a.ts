import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { withErrorHandling } from '../middleware/withErrorHandling';

export function registerAccountCommands(bot: Telegraf) {
  bot.command('a', withErrorHandling(async (ctx) => {
    await botReplies.showAccountBrowser(ctx);
  }));
}
