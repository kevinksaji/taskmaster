import { Context } from 'telegraf';
import { InlineKeyboardMarkup, ParseMode } from 'telegraf/types';

const Quote = require('inspirational-quotes') as {
  getQuote(options?: { author?: boolean }): { text: string; author?: string };
};

import { buildEpicDeleteKeyboard } from '../keyboards/epics';
import { buildTaskBatchEpicKeyboard, buildTaskEpicBrowserKeyboard, buildTaskListKeyboard } from '../keyboards/tasks';
import { epicService } from '../services/epicService';
import { sessionService } from '../services/sessionService';
import { taskService } from '../services/taskService';
import { UserFacingError } from '../utils/errors';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function buildOverviewText(telegramUserId: string, heading: string) {
  const epics = await epicService.listEpics(telegramUserId);
  const taskCount = epics.reduce((total, epic) => total + epic._count.tasks, 0);
  const quote = Quote.getQuote();

  return [
    escapeHtml(heading),
    `📚 Epics: ${epics.length}`,
    `✅ Tasks: ${taskCount}`,
    '',
    `<i>${escapeHtml(`${quote.text}${quote.author ? ` - ${quote.author}` : ''}`)}</i>`,
  ].join('\n');
}

// This file is the bot's presentation layer for reusable Telegram responses.
// Routers and commands decide *what* should happen, while these helpers decide
// *how* the next bot message should look and whether an inline-button screen
// should replace the current message or send a new one.
async function sendOrEdit(
  ctx: Context,
  text: string,
  replyMarkup?: InlineKeyboardMarkup,
  replace = false,
  parseMode?: ParseMode,
) {
  // Callback-query flows usually edit the existing bot message in place so the
  // chat stays compact. Plain command and text flows send a fresh message.
  if (replace && 'editMessageText' in ctx && typeof ctx.editMessageText === 'function') {
    await ctx.editMessageText(text, {
      parse_mode: parseMode,
      reply_markup: replyMarkup,
    });
    return;
  }

  await ctx.reply(text, {
    parse_mode: parseMode,
    reply_markup: replyMarkup,
  });
}

export const botReplies = {
  // Show the first `/t` browser screen: one button per epic, then let the user
  // drill into that epic's tasks.
  async showTaskEpicBrowser(ctx: Context, telegramUserId: string, replace = false) {
    const epics = await epicService.listEpics(telegramUserId);
    const text = epics.length === 0
      ? 'No epics yet. Send e <epic name> to create one.'
      : 'Choose an epic to inspect its tasks.';

    await sendOrEdit(ctx, text, buildTaskEpicBrowserKeyboard(epics), replace);
  },

  // Show all tasks inside one epic. Each task button deletes that task, so this
  // screen doubles as the task-completion view for the simplified bot flow.
  async showTasksForEpic(ctx: Context, telegramUserId: string, epicId: string, replace = false) {
    const epic = await epicService.getEpicOrThrow(telegramUserId, epicId);
    const tasks = await taskService.listTasksForEpic(telegramUserId, epicId);
    const text = tasks.length === 0
      ? `No tasks in ${epic.name}.`
      : `${epic.name}`;

    await sendOrEdit(ctx, text, buildTaskListKeyboard(tasks, epicId), replace);
  },

  // Show the `/e` browser screen where selecting an epic deletes it together
  // with its tasks.
  async showEpicDeleteBrowser(ctx: Context, telegramUserId: string, replace = false) {
    const epics = await epicService.listEpics(telegramUserId);
    const text = epics.length === 0
      ? 'No epics to delete.'
      : 'Choose an epic to delete it and all of its tasks.';

    await sendOrEdit(ctx, text, buildEpicDeleteKeyboard(epics), replace);
  },

  // After the user sends `t ...`, this screen asks where the whole staged task
  // batch should go. The inline keyboard can either pick an existing epic or
  // branch into the follow-up epic-creation step.
  async showTaskBatchEpicPicker(ctx: Context, telegramUserId: string, replace = false) {
    const epics = await epicService.listEpics(telegramUserId);
    const text = epics.length === 0
      ? 'Choose Create epic to create an epic for these tasks.'
      : 'Choose the epic that should receive these tasks.';

    await sendOrEdit(ctx, text, buildTaskBatchEpicKeyboard(epics), replace);
  },

  async showOverview(ctx: Context, telegramUserId: string, heading: string, replace = false) {
    const text = await buildOverviewText(telegramUserId, heading);
    await sendOrEdit(ctx, text, undefined, replace, 'HTML');
  },

  // Shared terminal messages for small flow transitions.
  async showCancelled(ctx: Context, telegramUserId: string, replace = false) {
    const text = await buildOverviewText(telegramUserId, '🧹 Reset complete');
    await sendOrEdit(ctx, text, undefined, replace, 'HTML');
  },

  async showTaskBatchNeedsEpicName(ctx: Context, replace = false) {
    await sendOrEdit(ctx, 'Send the new epic name for these pending tasks.', undefined, replace);
  },

  // A stale callback means the inline button no longer maps to a valid session
  // state, usually because the user already completed or cancelled that flow.
  async showStaleAction(ctx: Context) {
    throw new UserFacingError('That action expired. Please run the command again.');
  },
};
