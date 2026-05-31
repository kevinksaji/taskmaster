import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { sessionService } from '../services/sessionService';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

export function registerCancelCommands(bot: Telegraf) {
  bot.command('c', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await sessionService.clearOperation(identity.userId);
    await botReplies.showCancelled(ctx, identity.userId);
  }));
}