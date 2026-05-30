import { Telegraf } from 'telegraf';

import { buildPrimaryNavigationKeyboard } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { conversationService } from '../services/conversationService';
import { dismissReplyKeyboard, getIdentity } from '../utils/telegram';

export function registerCancelCommand(bot: Telegraf) {
  bot.command('cancel', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await conversationService.clearFlow(identity.userId);
    await dismissReplyKeyboard(ctx);
    await ctx.reply('Cancelled the active flow.', {
      reply_markup: buildPrimaryNavigationKeyboard(),
    });
  }));
}
