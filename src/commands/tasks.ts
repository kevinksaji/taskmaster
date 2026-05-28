import { Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { parseTaskFilter } from '../types/domain';
import { getCommandArgument, getIdentity } from '../utils/telegram';
import { TASK_PURPOSE } from '../utils/callback-data';
import { startTaskCreateFlow } from '../scenes/flowStarters';

export function registerTaskCommands(bot: Telegraf) {
  bot.command('tasks', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;
    const argument = getCommandArgument(messageText);
    const filter = parseTaskFilter(argument);
    await botReplies.showTasksList(ctx, identity.userId, filter);
  }));

  bot.command('task_create', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await startTaskCreateFlow(ctx, identity);
  }));

  bot.command('task_view', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showTaskSelection(ctx, identity.userId, TASK_PURPOSE.VIEW, 'all');
  }));

  bot.command('task_update', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showTaskSelection(ctx, identity.userId, TASK_PURPOSE.UPDATE, 'all');
  }));

  bot.command('task_delete', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showTaskSelection(ctx, identity.userId, TASK_PURPOSE.DELETE, 'all');
  }));

  bot.command('task_done', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showTaskSelection(ctx, identity.userId, TASK_PURPOSE.DONE, 'todo');
  }));

  bot.command('task_undone', withErrorHandling(async (ctx) => {
    const identity = getIdentity(ctx);
    await botReplies.showTaskSelection(ctx, identity.userId, TASK_PURPOSE.UNDONE, 'done');
  }));
}
