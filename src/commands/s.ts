import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { withErrorHandling } from '../middleware/withErrorHandling';

export function registerSubscriptionCommands(bot: Telegraf) {
  bot.command('s', withErrorHandling(async (ctx) => {
    await botReplies.showSubscriptionBrowser(ctx);
  }));
}
