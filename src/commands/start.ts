import { Context, Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { sessionService } from '../services/sessionService';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

async function replyWithPrimaryNavigation(ctx: Context) {
  const identity = getIdentity(ctx);
  await sessionService.markStarted(identity.userId);
  await botReplies.showOverview(ctx, identity.userId, '🧭 Taskmaster is ready');
}

export function registerStartCommand(bot: Telegraf) {
  bot.start(withErrorHandling(async (ctx) => {
    await replyWithPrimaryNavigation(ctx);
  }));
}
