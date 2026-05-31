import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { buildTasksFlowKeyboard, PRIMARY_NAVIGATION_LABELS } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { conversationService } from '../services/conversationService';
import { getIdentity } from '../utils/telegram';
import { startTaskCreateFlow } from '../scenes/flowStarters';

export function registerTaskCommands(bot: Telegraf) {
  const openTasksFlow = withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await conversationService.clearFlow(identity.userId);
    await ctx.reply('📝 Tasks', {
      reply_markup: buildTasksFlowKeyboard(),
    });
    await botReplies.showTasksList(ctx, identity.userId, 'all');
  });

  const startCreateTask = withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await startTaskCreateFlow(ctx, identity);
  });

  bot.command('tasks', openTasksFlow);
  bot.hears(PRIMARY_NAVIGATION_LABELS.TASKS, openTasksFlow);

  bot.command('task_create', startCreateTask);
  bot.hears(PRIMARY_NAVIGATION_LABELS.TASK_CREATE, startCreateTask);
}
