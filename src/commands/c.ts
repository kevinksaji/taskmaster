import { Telegraf } from 'telegraf';

import { stateService } from '../services/navigationService';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

export function registerCancelCommands(bot: Telegraf) {
  bot.command('c', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await stateService.clearOperation(identity.userId, identity.chatId);
    await ctx.reply('Cancelled.');
  }));
}