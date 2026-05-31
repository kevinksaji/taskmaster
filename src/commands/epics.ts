import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { buildEpicsFlowKeyboard, PRIMARY_NAVIGATION_LABELS } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { conversationService } from '../services/conversationService';
import { getIdentity } from '../utils/telegram';
import { startEpicCreateFlow } from '../scenes/flowStarters';

export function registerEpicCommands(bot: Telegraf) {
  const openEpicsFlow = withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await conversationService.clearFlow(identity.userId);
    await ctx.reply('📚 Epics', {
      reply_markup: buildEpicsFlowKeyboard(),
    });
    await botReplies.showEpicsList(ctx, identity.userId);
  });

  const startCreateEpic = withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await startEpicCreateFlow(ctx, identity);
  });

  bot.command('epics', openEpicsFlow);
  bot.hears(PRIMARY_NAVIGATION_LABELS.EPICS, openEpicsFlow);

  bot.command('epic_create', startCreateEpic);
  bot.hears(PRIMARY_NAVIGATION_LABELS.EPIC_CREATE, startCreateEpic);
}
