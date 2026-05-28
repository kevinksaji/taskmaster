import { Context } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/types';

import { buildEpicActionKeyboard, buildEpicListKeyboard, buildEpicDeleteKeyboard, buildEpicSelectionKeyboard } from '../keyboards/epics';
import { buildTaskActionKeyboard, buildTaskDeleteKeyboard, buildTaskListKeyboard, buildTaskSelectionKeyboard } from '../keyboards/tasks';
import { epicService } from '../services/epicService';
import { taskService } from '../services/taskService';
import { TaskFilter } from '../types/domain';
import { EPIC_PURPOSE, TASK_PURPOSE } from '../utils/callback-data';
import { formatEpicDetails, formatEpicList, formatTaskDetails, formatTaskList } from '../utils/formatters';

async function sendOrEdit(ctx: Context, text: string, replyMarkup?: InlineKeyboardMarkup, replace = false) {
  if (replace && 'editMessageText' in ctx && typeof ctx.editMessageText === 'function') {
    try {
      await ctx.editMessageText(text, {
        reply_markup: replyMarkup,
      });
      return;
    } catch {
      await ctx.reply(text, {
        reply_markup: replyMarkup,
      });
      return;
    }
  }

  await ctx.reply(text, {
    reply_markup: replyMarkup,
  });
}

export const botReplies = {
  async showEpicsList(ctx: Context, telegramUserId: string, page = 0, replace = false) {
    const epics = await epicService.listEpics(telegramUserId);
    await sendOrEdit(ctx, formatEpicList(epics), buildEpicListKeyboard(epics, page), replace);
  },

  async showEpicSelection(ctx: Context, telegramUserId: string, purpose: string, page = 0, replace = false) {
    const epics = await epicService.listEpics(telegramUserId);
    if (epics.length === 0) {
      await sendOrEdit(ctx, '📭 No epics found yet. Use /epic_create to add one first.', undefined, replace);
      return;
    }

    const prompt = purpose === EPIC_PURPOSE.TASK_CREATE
      ? 'Choose an epic for this task:'
      : 'Choose an epic:';

    await sendOrEdit(ctx, prompt, buildEpicSelectionKeyboard(epics, purpose, page), replace);
  },

  async showEpicDetails(ctx: Context, telegramUserId: string, epicId: string, replace = false) {
    const details = await epicService.getEpicDetails(telegramUserId, epicId);
    await sendOrEdit(ctx, formatEpicDetails(details), buildEpicActionKeyboard(epicId), replace);
  },

  async showEpicDeleteConfirmation(ctx: Context, telegramUserId: string, epicId: string, replace = false) {
    const details = await epicService.getEpicDetails(telegramUserId, epicId);
    const text = details.tasks.length > 0
      ? `⚠️ ${details.epic.name} still has ${details.tasks.length} task(s). Cascade delete the epic and its tasks?`
      : `⚠️ Delete epic "${details.epic.name}"? This cannot be undone.`;

    await sendOrEdit(ctx, text, buildEpicDeleteKeyboard(epicId, details.tasks.length > 0), replace);
  },

  async showTasksList(ctx: Context, telegramUserId: string, filter: TaskFilter, page = 0, replace = false) {
    const tasks = await taskService.listTasks(telegramUserId, filter);
    await sendOrEdit(ctx, formatTaskList(tasks, filter), buildTaskListKeyboard(tasks, filter, page), replace);
  },

  async showTasksForEpic(ctx: Context, telegramUserId: string, epicId: string, replace = false) {
    const details = await epicService.getEpicDetails(telegramUserId, epicId);
    await sendOrEdit(ctx, formatTaskList(details.tasks, details.epic.name), buildTaskListKeyboard(details.tasks, 'all', 0), replace);
  },

  async showTaskSelection(ctx: Context, telegramUserId: string, purpose: string, filter: TaskFilter, page = 0, replace = false) {
    const tasks = await taskService.listTasks(telegramUserId, filter);
    if (tasks.length === 0) {
      await sendOrEdit(ctx, '📭 No matching tasks found.', undefined, replace);
      return;
    }

    const prompt = purpose === TASK_PURPOSE.DONE
      ? 'Choose a task to mark done:'
      : purpose === TASK_PURPOSE.UNDONE
        ? 'Choose a task to mark todo again:'
        : 'Choose a task:';

    await sendOrEdit(ctx, prompt, buildTaskSelectionKeyboard(tasks, purpose, filter, page), replace);
  },

  async showTaskDetails(ctx: Context, telegramUserId: string, taskId: string, replace = false) {
    const task = await taskService.getTaskOrThrow(telegramUserId, taskId);
    await sendOrEdit(ctx, formatTaskDetails(task), buildTaskActionKeyboard(task.id, task.status, task.epicId), replace);
  },

  async showTaskDeleteConfirmation(ctx: Context, telegramUserId: string, taskId: string, replace = false) {
    const task = await taskService.getTaskOrThrow(telegramUserId, taskId);
    await sendOrEdit(
      ctx,
      `⚠️ Delete task "${task.name}" from ${task.epic.name}? This cannot be undone.`,
      buildTaskDeleteKeyboard(taskId),
      replace,
    );
  },
};
