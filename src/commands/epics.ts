import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';
import { EPIC_PURPOSE } from '../utils/callback-data';
import { startEpicCreateFlow } from '../scenes/flowStarters';

export function registerEpicCommands(bot: Telegraf) {
  bot.command('epics', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showEpicsList(ctx, identity.userId);
  }));

  bot.command('epic_create', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await startEpicCreateFlow(ctx, identity);
  }));

  bot.command('epic_view', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showEpicSelection(ctx, identity.userId, EPIC_PURPOSE.VIEW);
  }));

  bot.command('epic_delete', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showEpicSelection(ctx, identity.userId, EPIC_PURPOSE.DELETE);
  }));
}
