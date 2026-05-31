import { Telegraf } from 'telegraf';

import { sessionService } from '../services/sessionService';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

export function registerCancelCommands(bot: Telegraf) {
  bot.command('c', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await sessionService.clearOperation(identity.userId);
    await ctx.reply('Cancelled.');
  }));
}