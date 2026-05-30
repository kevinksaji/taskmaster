import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { buildTasksFlowKeyboard } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { conversationService } from '../services/conversationService';
import { getIdentity } from '../utils/telegram';
import { startTaskCreateFlow } from '../scenes/flowStarters';

export function registerTaskCommands(bot: Telegraf) {
  bot.command('tasks', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await conversationService.clearFlow(identity.userId);
    await ctx.reply('📝 Tasks', {
      reply_markup: buildTasksFlowKeyboard(),
    });
    await botReplies.showTasksList(ctx, identity.userId, 'all');
  }));

  bot.command('task_create', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await startTaskCreateFlow(ctx, identity);
  }));
}
