import { Context } from 'telegraf';

import { botReplies } from '../bot/replies';
import { epicService } from '../services/epicService';
import { sessionService } from '../services/sessionService';
import { taskService } from '../services/taskService';
import { BOT_OPERATION_KINDS } from '../types/bot-state';
import { UserFacingError } from '../utils/errors';
import { logger } from '../utils/logger';
import { answerCallback, getIdentity } from '../utils/telegram';

export async function handleCallbackQuery(ctx: Context) {
  if (!('callbackQuery' in ctx) || !ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return;
  }

  const identity = getIdentity(ctx);
  const data = String(ctx.callbackQuery.data);
  const [kind, arg1, arg2] = data.split('|');

  try {
    switch (kind) {
      case 'tb':
        await answerCallback(ctx);
        await botReplies.showTaskEpicBrowser(ctx, identity.userId, true);
        return;
      case 'tv':
        await answerCallback(ctx);
        await botReplies.showTasksForEpic(ctx, identity.userId, String(arg1 ?? ''), true);
        return;
      case 'td':
        await taskService.deleteTask(identity.userId, String(arg1 ?? ''));
        await answerCallback(ctx, 'Task completed');
        await botReplies.showTasksForEpic(ctx, identity.userId, String(arg2 ?? ''), true);
        return;
      case 'eb':
        await answerCallback(ctx);
        await botReplies.showEpicDeleteBrowser(ctx, identity.userId, true);
        return;
      case 'ed':
        await epicService.deleteEpic(identity.userId, String(arg1 ?? ''));
        await answerCallback(ctx, 'Epic deleted');
        await botReplies.showEpicDeleteBrowser(ctx, identity.userId, true);
        return;
      case 'ts': {
        const session = await sessionService.getSession(identity.userId);
        if (session.operation.kind !== BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC) {
          throw new UserFacingError('That task batch expired. Send t <task name> again.');
        }

        await taskService.createTasks({
          telegramUserId: identity.userId,
          epicId: String(arg1 ?? ''),
          names: session.operation.taskNames,
        });
        await sessionService.clearOperation(identity.userId);
        await answerCallback(ctx, 'Tasks added');
        await botReplies.showTasksForEpic(ctx, identity.userId, String(arg1 ?? ''), true);
        return;
      }
      case 'tc': {
        const session = await sessionService.getSession(identity.userId);
        if (session.operation.kind !== BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC) {
          throw new UserFacingError('That task batch expired. Send t <task name> again.');
        }

        await sessionService.startTaskBatchEpicCreate(identity.userId, session.operation.taskNames);
        await answerCallback(ctx);
        await botReplies.showTaskBatchNeedsEpicName(ctx, true);
        return;
      }
      case 'cx':
        await sessionService.clearOperation(identity.userId);
        await answerCallback(ctx);
        await botReplies.showCancelled(ctx, identity.userId, true);
        return;
      default:
        await answerCallback(ctx);
        await botReplies.showStaleAction(ctx);
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
