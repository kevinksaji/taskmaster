import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { HUB_VIEWS } from '../types/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

export function registerTaskCommands(bot: Telegraf) {
  bot.command('tasks', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showTasksList(ctx, identity.userId, [HUB_VIEWS.HOME]);
  }));
}
