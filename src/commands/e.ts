import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

export function registerEpicCommands(bot: Telegraf) {
  bot.command('e', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showEpicDeleteBrowser(ctx, identity.userId);
  }));
}