import { Context } from 'telegraf';

import { botReplies } from '../bot/replies';
import { epicService } from '../services/epicService';
import { taskService } from '../services/taskService';
import { HUB_VIEWS } from '../types/navigation';
import { decodeHistory, decodeView } from '../utils/callback-data';
import { UserFacingError } from '../utils/errors';
import { logger } from '../utils/logger';
import { answerCallback, getIdentity } from '../utils/telegram';

export async function handleCallbackQuery(ctx: Context) {
  if (!('callbackQuery' in ctx) || !ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return;
  }

  await answerCallback(ctx);

  const identity = getIdentity(ctx);
  const data = String(ctx.callbackQuery.data);
  const [kind, arg1, arg2] = data.split('|');

  try {
    switch (kind) {
      case 'noop':
        return;
      case 'hv':
        await handleViewNavigation(ctx, identity.userId, decodeView(arg1), decodeHistory(arg2));
        return;
      case 'bk':
        await handleBackNavigation(ctx, identity.userId, decodeHistory(arg1));
        return;
      case 'td':
        await taskService.deleteTask(identity.userId, String(arg1 ?? ''));
        await answerCallback(ctx, 'Task completed');
        await botReplies.showTasksList(ctx, identity.userId, decodeHistory(arg2), true);
        return;
      case 'ec':
        await epicService.deleteEpic(identity.userId, String(arg1 ?? ''));
        await answerCallback(ctx, 'Epic cleared');
        await botReplies.showEpicsList(ctx, identity.userId, decodeHistory(arg2), true);
        return;
      default:
        await ctx.reply('That action is no longer available. Please run the command again.');
    }
  } catch (error) {
    logger.error('telegram.callback.failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      callback: data,
    });

    const message = error instanceof UserFacingError
      ? error.message
      : 'Something went wrong while handling that button. Please try again.';

    await ctx.reply(message);
  }
}

async function handleViewNavigation(ctx: Context, userId: string, view: ReturnType<typeof decodeView>, history: ReturnType<typeof decodeHistory>) {
  if (view === HUB_VIEWS.TASKS) {
    await botReplies.showTasksList(ctx, userId, history, true);
    return;
  }

  if (view === HUB_VIEWS.EPICS) {
    await botReplies.showEpicsList(ctx, userId, history, true);
    return;
  }

  await botReplies.showStart(ctx, true);
}

async function handleBackNavigation(ctx: Context, userId: string, history: ReturnType<typeof decodeHistory>) {
  // Back is derived entirely from the callback payload. That keeps the bot
  // server stateless for navigation and removes the need for a database-backed
  // conversation flow just to move between list screens.
  const previousView = history.at(-1) ?? HUB_VIEWS.HOME;
  const previousHistory = history.slice(0, -1);

  if (previousView === HUB_VIEWS.TASKS) {
    await botReplies.showTasksList(ctx, userId, previousHistory, true);
    return;
  }

  if (previousView === HUB_VIEWS.EPICS) {
    await botReplies.showEpicsList(ctx, userId, previousHistory, true);
    return;
  }

  await botReplies.showStart(ctx, true);
}
