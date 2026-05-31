import { Context, Telegraf } from 'telegraf';

import { stateService } from '../services/navigationService';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

const startMessage = 'Taskmaster is ready.';

export async function replyWithPrimaryNavigation(ctx: Context) {
  const identity = getIdentity(ctx);
  const session = await stateService.getSession(identity.userId);

  if (session.started) {
    return;
  }

  await stateService.markStarted(identity.userId, identity.chatId);
  await ctx.reply(startMessage);
}

export function registerStartCommand(bot: Telegraf) {
  bot.start(withErrorHandling(async (ctx) => {
    await replyWithPrimaryNavigation(ctx);
  }));
}
