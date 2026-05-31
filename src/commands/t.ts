import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

export function registerTaskCommands(bot: Telegraf) {
  bot.command('t', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showTaskEpicBrowser(ctx, identity.userId);
  }));
}