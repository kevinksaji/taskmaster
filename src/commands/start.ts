import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

export function registerStartCommand(bot: Telegraf) {
  bot.start(withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showOverview(ctx, identity.userId, '🧭 Taskmaster is ready.');
  }));
}
