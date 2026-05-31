import { Context } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/types';

import { buildEpicDeleteKeyboard } from '../keyboards/epics';
import { buildTaskBatchEpicKeyboard, buildTaskEpicBrowserKeyboard, buildTaskListKeyboard } from '../keyboards/tasks';
import { epicService } from '../services/epicService';
import { taskService } from '../services/taskService';
import { UserFacingError } from '../utils/errors';

async function sendOrEdit(ctx: Context, text: string, replyMarkup?: InlineKeyboardMarkup, replace = false) {
  if (replace && 'editMessageText' in ctx && typeof ctx.editMessageText === 'function') {
    await ctx.editMessageText(text, {
      reply_markup: replyMarkup,
    });
    return;
  }

  await ctx.reply(text, {
    reply_markup: replyMarkup,
  });
}

export const botReplies = {
  async showTaskEpicBrowser(ctx: Context, telegramUserId: string, replace = false) {
    const epics = await epicService.listEpics(telegramUserId);
    const text = epics.length === 0
      ? 'No epics yet. Send e <epic name> to create one.'
      : 'Choose an epic to inspect its tasks.';

    await sendOrEdit(ctx, text, buildTaskEpicBrowserKeyboard(epics), replace);
  },

  async showTasksForEpic(ctx: Context, telegramUserId: string, epicId: string, replace = false) {
    const epic = await epicService.getEpicOrThrow(telegramUserId, epicId);
    const tasks = await taskService.listTasksForEpic(telegramUserId, epicId);
    const text = tasks.length === 0
      ? `No tasks in ${epic.name}.`
      : `${epic.name}`;

    await sendOrEdit(ctx, text, buildTaskListKeyboard(tasks, epicId), replace);
  },

  async showEpicDeleteBrowser(ctx: Context, telegramUserId: string, replace = false) {
    const epics = await epicService.listEpics(telegramUserId);
    const text = epics.length === 0
      ? 'No epics to delete.'
      : 'Choose an epic to delete it and all of its tasks.';

    await sendOrEdit(ctx, text, buildEpicDeleteKeyboard(epics), replace);
  },

  async showTaskBatchEpicPicker(ctx: Context, telegramUserId: string, replace = false) {
    const epics = await epicService.listEpics(telegramUserId);
    const text = epics.length === 0
      ? 'Choose Create epic to create an epic for these tasks.'
      : 'Choose the epic that should receive these tasks.';

    await sendOrEdit(ctx, text, buildTaskBatchEpicKeyboard(epics), replace);
  },

  async showCancelled(ctx: Context, replace = false) {
    await sendOrEdit(ctx, 'Cancelled.', undefined, replace);
  },

  async showTaskBatchNeedsEpicName(ctx: Context, replace = false) {
    await sendOrEdit(ctx, 'Send the new epic name for these pending tasks.', undefined, replace);
  },

  async showStaleAction(ctx: Context) {
    throw new UserFacingError('That action expired. Please run the command again.');
  },
};
