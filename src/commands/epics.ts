import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { HUB_VIEWS } from '../types/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

export function registerEpicCommands(bot: Telegraf) {
  bot.command('epics', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showEpicsList(ctx, identity.userId, [HUB_VIEWS.HOME]);
  }));
}
