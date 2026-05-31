import { Context, Telegraf } from 'telegraf';

import { sessionService } from '../services/sessionService';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

const startMessage = 'Taskmaster is ready.';

export async function replyWithPrimaryNavigation(ctx: Context) {
  const identity = getIdentity(ctx);
  const session = await sessionService.getSession(identity.userId);

  if (session.started) {
    return;
  }

  await sessionService.markStarted(identity.userId);
  await ctx.reply(startMessage);
}

export function registerStartCommand(bot: Telegraf) {
  bot.start(withErrorHandling(async (ctx) => {
    await replyWithPrimaryNavigation(ctx);
  }));
}
