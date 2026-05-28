import { Telegraf } from 'telegraf';

import { withErrorHandling } from '../middleware/withErrorHandling';
import { conversationService } from '../services/conversationService';
import { getIdentity } from '../utils/telegram';

export function registerCancelCommand(bot: Telegraf) {
  bot.command('cancel', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await conversationService.clearFlow(identity.userId);
    await ctx.reply('Cancelled the active flow.');
  }));
}
