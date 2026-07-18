import { Context } from 'telegraf';

import { botReplies } from '../bot/replies';
import { epicService } from '../services/epicService';
import { sessionService } from '../services/sessionService';
import { taskService } from '../services/taskService';
import { BOT_OPERATION_KINDS } from '../types/bot-state';
import { UserFacingError } from '../utils/errors';
import { logger } from '../utils/logger';
import { answerCallback, getIdentity } from '../utils/telegram';

/*
 * callbackRouter.ts
 * -----------------
 * Centralized handler for Telegram inline-button callback queries.
 *
 * Responsibilities:
 * - Parse the callback payload (a compact pipe-separated string produced
 *   by our inline keyboard buttons).
 * - Validate any required transient workflow state (via `sessionService`).
 * - Convert internal errors into friendly messages for the user.
 *
 * Design notes for future maintainers:
 * - Keep callbacks idempotent where possible. Each case acknowledges the
 *   callback (`answerCallback`) before taking longer actions so the user
 *   receives immediate feedback in the Telegram client.
 * - Transient multi-step flows (e.g., creating a batch of tasks) are stored in
 *   the session store and validated by checking `session.operation.kind`.
 * - `botReplies` contains presentation logic — prefer adding UI changes there
 *   instead of mutating messages inline from this router.
 */

export async function handleCallbackQuery(ctx: Context) {
  // Defensive: ignore non-callback updates.
  if (!('callbackQuery' in ctx) || !ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return;
  }

  // Identify the user and parse the compact callback payload.
  // Payload format: "<kind>|<arg1>|<arg2>" — keep it small to avoid hitting
  // Telegram's callback-data length limits.
  const identity = getIdentity(ctx);
  const data = String(ctx.callbackQuery.data);
  const [kind, arg1, arg2] = data.split('|');

  try {
    switch (kind) {
      /*
       * 'tb' - Task Browser
       * Show the list of epics the user can browse when creating or viewing tasks.
       * Interaction: purely UI/navigation — no state mutation.
       */
      case 'tb':
        await answerCallback(ctx);
        await botReplies.showTaskEpicBrowser(ctx, identity.userId, true);
        return;

      /*
       * 'tv' - View Tasks
       * arg1: epicId
       * Show tasks for a specific epic. Pure UI call.
       */
      case 'tv':
        await answerCallback(ctx);
        await botReplies.showTasksForEpic(ctx, identity.userId, String(arg1 ?? ''), true);
        return;

      /*
       * 'td' - Task Done / Delete
       * arg1: taskId, arg2: epicId
       * Domain action: delete the task, then re-render the epic's task list.
       */
      case 'td':
        await taskService.deleteTask(identity.userId, String(arg1 ?? ''));
        await answerCallback(ctx, 'Task completed');
        await botReplies.showTasksForEpic(ctx, identity.userId, String(arg2 ?? ''), true);
        return;

      /*
       * 'eb' - Epic Delete Browser
       * Show the list of epics the user can delete. Pure UI navigation.
       */
      case 'eb':
        await answerCallback(ctx);
        await botReplies.showEpicDeleteBrowser(ctx, identity.userId, true);
        return;

      /*
       * 'ed' - Epic Delete
       * arg1: epicId
       * Domain action: delete epic, then re-render the delete browser.
       */
      case 'ed':
        await epicService.deleteEpic(identity.userId, String(arg1 ?? ''));
        await answerCallback(ctx, 'Epic deleted');
        await botReplies.showEpicDeleteBrowser(ctx, identity.userId, true);
        return;

      /*
       * 'ts' - Task batch: Submit to selected epic
       * arg1: epicId
       * Flow:
       * - Validate the user's transient session; ensure we're in the
       *   TASK_BATCH_PICK_EPIC step (this prevents replay or stale callbacks).
       * - Create the tasks (names are stored in session.operation.taskNames).
       * - Clear the session and re-render the epic's task list.
       */
      case 'ts': {
        const session = await sessionService.getSession(identity.userId);
        if (session.operation.kind !== BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC) {
          // Surface a friendly error when the workflow state is missing/expired.
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

      /*
       * 'tc' - Task batch: Create new epic for batch
       * This moves the multi-task flow into a step where the user provides a
       * name for the new epic. We copy the pending task names into a new
       * session operation that expects the epic name next.
       */
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

      /*
       * 'cx' - Cancel current operation
       * Clear any transient session state and show the cancelled UI.
       */
      case 'cx':
        await sessionService.clearOperation(identity.userId);
        await answerCallback(ctx);
        await botReplies.showCancelled(ctx, identity.userId, true);
        return;

      /*
       * 'ab' - Account Browser
       * Show the list of accounts from the Notion vault. Pure UI navigation;
       * also the Back target from an account detail screen.
       */
      case 'ab':
        await answerCallback(ctx);
        await botReplies.showAccountBrowser(ctx, true);
        return;

      /*
       * 'av' - Account View
       * arg1: Notion page id
       * Show one account's stored details. Pure UI call.
       */
      case 'av':
        await answerCallback(ctx);
        await botReplies.showAccountDetail(ctx, String(arg1 ?? ''), true);
        return;

      /*
       * 'sb' - Subscription Browser
       * Show the list of subscriptions from the Notion vault. Pure UI
       * navigation; also the Back target from a subscription detail screen.
       */
      case 'sb':
        await answerCallback(ctx);
        await botReplies.showSubscriptionBrowser(ctx, true);
        return;

      /*
       * 'sv' - Subscription View
       * arg1: Notion page id
       * Show one subscription's stored details. Pure UI call.
       */
      case 'sv':
        await answerCallback(ctx);
        await botReplies.showSubscriptionDetail(ctx, String(arg1 ?? ''), true);
        return;

      /*
       * Default: Unknown / stale callback.
       * We acknowledge the callback to dismiss the spinner and then show a
       * small UI telling the user the action is stale.
       */
      default:
        await answerCallback(ctx);
        await botReplies.showStaleAction(ctx);
    }
  } catch (error) {
    // Centralized error handling for callback flows: log and surface
    // friendly messages for expected/user-facing errors.
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

