import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { buildEpicsFlowKeyboard } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { conversationService } from '../services/conversationService';
import { getIdentity } from '../utils/telegram';
import { startEpicCreateFlow } from '../scenes/flowStarters';

export function registerEpicCommands(bot: Telegraf) {
  bot.command('epics', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await conversationService.clearFlow(identity.userId);
    await ctx.reply('📚 Epics', {
      reply_markup: buildEpicsFlowKeyboard(),
    });
    await botReplies.showEpicsList(ctx, identity.userId);
  }));

  bot.command('epic_create', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await startEpicCreateFlow(ctx, identity);
  }));
}
