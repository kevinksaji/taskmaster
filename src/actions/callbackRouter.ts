import { Context } from 'telegraf';

import { botReplies } from '../bot/replies';
import { buildPrimaryNavigationKeyboard, buildTasksFlowKeyboard } from '../keyboards/navigation';
import { conversationService } from '../services/conversationService';
import { epicService } from '../services/epicService';
import { taskService } from '../services/taskService';
import { FlowType } from '../types/conversation';
import { parseTaskFilter } from '../types/domain';
import { EPIC_PURPOSE } from '../utils/callback-data';
import { UserFacingError } from '../utils/errors';
import { formatTaskDetails } from '../utils/formatters';
import { logger } from '../utils/logger';
import { answerCallback, deleteCurrentMessage, getIdentity } from '../utils/telegram';
import { startEpicCreateFlow, startTaskCreateFlow } from '../scenes/flowStarters';

export async function handleCallbackQuery(ctx: Context) {
  if (!('callbackQuery' in ctx) || !ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
    return;
  }

  await answerCallback(ctx);

  const identity = getIdentity(ctx);
  const data = String(ctx.callbackQuery.data);
  const [kind, arg1, arg2, arg3] = data.split('|');

  try {
    switch (kind) {
      case 'noop':
        return;
      case 'ca':
        await conversationService.clearFlow(identity.userId);
        await ctx.reply('Returned to the main menu.', {
          reply_markup: buildPrimaryNavigationKeyboard(),
        });
        return;
      case 'ne':
        await startEpicCreateFlow(ctx, identity);
        return;
      case 'nt':
        await startTaskCreateFlow(ctx, identity);
        return;
      case 'el':
        await botReplies.showEpicsList(ctx, identity.userId, Number(arg1 ?? '0'), true);
        return;
      case 'en':
        await botReplies.showEpicSelection(ctx, identity.userId, String(arg1 ?? ''), Number(arg2 ?? '0'), true);
        return;
      case 'es':
        await handleEpicSelection(ctx, identity.userId, identity.chatId, String(arg1 ?? ''), String(arg2 ?? ''));
        return;
      case 'et':
        await botReplies.showTasksForEpic(ctx, identity.userId, String(arg1 ?? ''), true);
        return;
      case 'tl':
        await botReplies.showTasksList(ctx, identity.userId, parseTaskFilter(arg1), Number(arg2 ?? '0'), true);
        return;
      case 'tv':
        await botReplies.showTaskDetails(ctx, identity.userId, String(arg1 ?? ''), true);
        return;
      case 'tx':
        await handleTaskDelete(ctx, identity.userId, String(arg1 ?? ''));
        return;
      case 'tc':
        await startTaskCreateFlow(ctx, identity, { epicId: String(arg1 ?? '') });
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

async function handleEpicSelection(ctx: Context, userId: string, chatId: string, purpose: string, epicId: string) {
  switch (purpose) {
    case EPIC_PURPOSE.TASK_CREATE: {
      const state = await conversationService.getActiveState(userId);
      if (!state || state.flow !== FlowType.TASK_CREATE) {
        throw new UserFacingError('That task creation flow expired. Start /task_create again.');
      }

      const task = await taskService.createTask({
        telegramUserId: userId,
        name: String(state.payload.name ?? ''),
        epicId,
      });

      await conversationService.clearFlow(userId);
      await ctx.reply(`✅ Task created.\n\n${formatTaskDetails(task)}`, {
        reply_markup: buildTasksFlowKeyboard(),
      });
      return;
    }
    default:
      throw new UserFacingError('That button expired. Please run the command again.');
  }
}

async function handleTaskDelete(ctx: Context, userId: string, taskId: string) {
  const deleted = await taskService.deleteTask(userId, taskId);

  await hideDeletedEntity(ctx, deleted.id, {
    listPrefix: `tv|${deleted.id}`,
    selectionPrefix: `ts|`,
    detailActionPrefix: `tx|${deleted.id}`,
  });
}

async function hideDeletedEntity(
  ctx: Context,
  entityId: string,
  mode: {
    listPrefix: string;
    selectionPrefix: string;
    detailActionPrefix: string;
  },
) {
  const message = 'callbackQuery' in ctx && ctx.callbackQuery && 'message' in ctx.callbackQuery
    ? ctx.callbackQuery.message
    : undefined;

  if (!message || !('reply_markup' in message) || !message.reply_markup?.inline_keyboard) {
    await deleteCurrentMessage(ctx);
    return;
  }

  const rows = message.reply_markup.inline_keyboard;
  const isListView = rows.some((row) => row.some((button) => hasCallback(button, mode.listPrefix)));
  const isSelectionView = rows.some((row) => row.some((button) => hasCallback(button, mode.selectionPrefix) && endsWithCallback(button, entityId)));
  const isDetailView = rows.some((row) => row.some((button) => hasCallback(button, mode.detailActionPrefix)));

  if (!isListView && !isSelectionView && isDetailView) {
    await deleteCurrentMessage(ctx);
    return;
  }

  const filteredRows = rows
    .filter((row) => !row.some((button) => referencesEntity(button, entityId)))
    .filter((row) => row.length > 0);

  if (filteredRows.length === 0) {
    await deleteCurrentMessage(ctx);
    return;
  }

  if ('editMessageReplyMarkup' in ctx && typeof ctx.editMessageReplyMarkup === 'function') {
    await ctx.editMessageReplyMarkup({
      inline_keyboard: filteredRows,
    });
    return;
  }

  await deleteCurrentMessage(ctx);
}

function referencesEntity(button: unknown, entityId: string) {
  const callbackData = getCallbackData(button);
  return typeof callbackData === 'string' && callbackData.includes(`|${entityId}`);
}

function hasCallback(button: unknown, prefix: string) {
  const callbackData = getCallbackData(button);
  return typeof callbackData === 'string' && callbackData.startsWith(prefix);
}

function endsWithCallback(button: unknown, entityId: string) {
  const callbackData = getCallbackData(button);
  return typeof callbackData === 'string' && callbackData.endsWith(`|${entityId}`);
}

function getCallbackData(button: unknown) {
  if (!button || typeof button !== 'object' || !('callback_data' in button)) {
    return undefined;
  }

  const candidate = (button as { callback_data?: unknown }).callback_data;
  return typeof candidate === 'string' ? candidate : undefined;
}
