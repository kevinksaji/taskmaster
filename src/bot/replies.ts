import { Context } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/types';

import { buildEpicListKeyboard } from '../keyboards/epics';
import { buildStartKeyboard } from '../keyboards/navigation';
import { buildTaskListKeyboard } from '../keyboards/tasks';
import { epicService } from '../services/epicService';
import { taskService } from '../services/taskService';
import { HubView } from '../types/navigation';

async function sendOrEdit(ctx: Context, text: string, replyMarkup?: InlineKeyboardMarkup, replace = false) {
  // The hub lives in a single inline message whenever possible. Editing that
  // message in place keeps chat noise low while leaving the currently visible
  // task or epic buttons stable under the user's thumb.
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
  async showStart(ctx: Context, replace = false) {
    await sendOrEdit(ctx, 'Choose what to manage.', buildStartKeyboard(), replace);
  },

  async showTasksList(ctx: Context, telegramUserId: string, history: HubView[], replace = false) {
    const tasks = await taskService.listTasks(telegramUserId);
    const text = tasks.length === 0 ? 'No tasks.' : 'Tasks';
    await sendOrEdit(ctx, text, buildTaskListKeyboard(tasks, history), replace);
  },

  async showEpicsList(ctx: Context, telegramUserId: string, history: HubView[], replace = false) {
    const epics = await epicService.listEpics(telegramUserId);
    const text = epics.length === 0 ? 'No epics.' : 'Epics';
    await sendOrEdit(ctx, text, buildEpicListKeyboard(epics, history), replace);
  },
};
