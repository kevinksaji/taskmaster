import { TaskStatus } from '@prisma/client';
import { Context } from 'telegraf';

import { botReplies } from '../bot/replies';
import { buildStatusChoiceKeyboard, buildTaskActionKeyboard, buildTaskUpdateFieldKeyboard } from '../keyboards/tasks';
import { conversationService } from '../services/conversationService';
import { epicService } from '../services/epicService';
import { taskService } from '../services/taskService';
import { FlowType } from '../types/conversation';
import { TaskFilter, parseTaskFilter } from '../types/domain';
import { EPIC_PURPOSE, TASK_PURPOSE } from '../utils/callback-data';
import { formatTaskDetails } from '../utils/formatters';
import { UserFacingError } from '../utils/errors';
import { logger } from '../utils/logger';
import { answerCallback, getIdentity } from '../utils/telegram';
import { startEpicCreateFlow, startEpicUpdateFlow, startTaskCreateFlow, startTaskUpdateFlow } from '../scenes/flowStarters';

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
        await ctx.reply('Cancelled the current flow.');
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
      case 'ev':
        await botReplies.showEpicDetails(ctx, identity.userId, String(arg1 ?? ''), true);
        return;
      case 'eu':
        await startEpicUpdateFlow(ctx, identity, String(arg1 ?? ''));
        return;
      case 'ed':
        await botReplies.showEpicDeleteConfirmation(ctx, identity.userId, String(arg1 ?? ''), true);
        return;
      case 'edf':
        await handleEpicDelete(ctx, identity.userId, String(arg1 ?? ''), String(arg2 ?? ''));
        return;
      case 'et':
        await botReplies.showTasksForEpic(ctx, identity.userId, String(arg1 ?? ''), true);
        return;
      case 'euf':
        await handleEpicUpdateField(ctx, identity.userId, identity.chatId, String(arg1 ?? ''));
        return;
      case 'tl':
        await botReplies.showTasksList(ctx, identity.userId, parseTaskFilter(arg1), Number(arg2 ?? '0'), true);
        return;
      case 'tp':
        await botReplies.showTaskSelection(ctx, identity.userId, String(arg1 ?? ''), parseTaskFilter(arg2), Number(arg3 ?? '0'), true);
        return;
      case 'tf':
        await botReplies.showTaskSelection(ctx, identity.userId, String(arg1 ?? ''), parseTaskFilter(arg2), 0, true);
        return;
      case 'ts':
        await handleTaskSelection(ctx, identity.userId, identity.chatId, String(arg1 ?? ''), String(arg2 ?? ''));
        return;
      case 'tv':
        await botReplies.showTaskDetails(ctx, identity.userId, String(arg1 ?? ''), true);
        return;
      case 'tu':
        await startTaskUpdateFlow(ctx, identity, String(arg1 ?? ''));
        return;
      case 'tx':
        await botReplies.showTaskDeleteConfirmation(ctx, identity.userId, String(arg1 ?? ''), true);
        return;
      case 'txf':
        await handleTaskDelete(ctx, identity.userId, String(arg1 ?? ''), String(arg2 ?? ''));
        return;
      case 'tt':
        await taskService.setTaskStatus(identity.userId, String(arg1 ?? ''), normalizeStatus(String(arg2 ?? 'TODO')));
        await botReplies.showTaskDetails(ctx, identity.userId, String(arg1 ?? ''), true);
        return;
      case 'tc':
        await startTaskCreateFlow(ctx, identity, { epicId: String(arg1 ?? '') });
        return;
      case 'tuf':
        await handleTaskUpdateField(ctx, identity.userId, identity.chatId, String(arg1 ?? ''));
        return;
      case 'tus':
        await handleTaskUpdateStatus(ctx, identity.userId, String(arg1 ?? ''));
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
    case EPIC_PURPOSE.VIEW:
      await botReplies.showEpicDetails(ctx, userId, epicId, true);
      return;
    case EPIC_PURPOSE.UPDATE:
      await startEpicUpdateFlow(ctx, getIdentity(ctx), epicId);
      return;
    case EPIC_PURPOSE.DELETE:
      await botReplies.showEpicDeleteConfirmation(ctx, userId, epicId, true);
      return;
    case EPIC_PURPOSE.TASK_CREATE: {
      const state = await conversationService.getActiveState(userId);
      if (!state || state.flow !== FlowType.TASK_CREATE) {
        throw new UserFacingError('That task creation flow expired. Start /task_create again.');
      }

      await conversationService.updateFlow(userId, chatId, {
        flow: FlowType.TASK_CREATE,
        step: 'WAIT_DUE_DATE',
        payload: {
          ...state.payload,
          epicId,
        },
      });
      await ctx.reply('Epic selected. Send a due date, or type skip. Examples: 2026-06-15, tomorrow, next monday, in 3 days.');
      return;
    }
    case EPIC_PURPOSE.TASK_UPDATE: {
      const state = await conversationService.getActiveState(userId);
      if (!state || state.flow !== FlowType.TASK_UPDATE) {
        throw new UserFacingError('That task update flow expired. Start /task_update again.');
      }

      const taskId = String(state.payload.taskId ?? '');
      const task = await taskService.updateTask({ telegramUserId: userId, taskId, epicId });
      await conversationService.clearFlow(userId);
      await ctx.reply(`✅ Task updated.\n\n${formatTaskDetails(task)}`);
      return;
    }
    default:
      throw new UserFacingError('That button expired. Please run the command again.');
  }
}

async function handleTaskSelection(ctx: Context, userId: string, _chatId: string, purpose: string, taskId: string) {
  switch (purpose) {
    case TASK_PURPOSE.VIEW:
      await botReplies.showTaskDetails(ctx, userId, taskId, true);
      return;
    case TASK_PURPOSE.UPDATE:
      await startTaskUpdateFlow(ctx, getIdentity(ctx), taskId);
      return;
    case TASK_PURPOSE.DELETE:
      await botReplies.showTaskDeleteConfirmation(ctx, userId, taskId, true);
      return;
    case TASK_PURPOSE.DONE: {
      const task = await taskService.setTaskStatus(userId, taskId, TaskStatus.DONE);
      await conversationService.clearFlow(userId);
      await ctx.reply(`✅ Task marked done.\n\n${formatTaskDetails(task)}`, {
        reply_markup: buildTaskActionKeyboard(task.id, task.status, task.epicId),
      });
      return;
    }
    case TASK_PURPOSE.UNDONE: {
      const task = await taskService.setTaskStatus(userId, taskId, TaskStatus.TODO);
      await conversationService.clearFlow(userId);
      await ctx.reply(`✅ Task moved back to todo.\n\n${formatTaskDetails(task)}`);
      return;
    }
    default:
      throw new UserFacingError('That button expired. Please run the command again.');
  }
}

async function handleEpicDelete(ctx: Context, userId: string, epicId: string, action: string) {
  if (action !== 'delete' && action !== 'cascade') {
    throw new UserFacingError('That delete action is no longer valid.');
  }

  const deleted = await epicService.deleteEpic({
    telegramUserId: userId,
    epicId,
    cascade: action === 'cascade',
  });

  if ('editMessageText' in ctx && typeof ctx.editMessageText === 'function') {
    await ctx.editMessageText(`🗑️ Deleted epic ${deleted.epic.name}.`);
    return;
  }

  await ctx.reply(`🗑️ Deleted epic ${deleted.epic.name}.`);
}

async function handleTaskDelete(ctx: Context, userId: string, taskId: string, action: string) {
  if (action !== 'delete') {
    throw new UserFacingError('That delete action is no longer valid.');
  }

  const deleted = await taskService.deleteTask(userId, taskId);

  if ('editMessageText' in ctx && typeof ctx.editMessageText === 'function') {
    await ctx.editMessageText(`🗑️ Deleted task ${deleted.name}.`);
    return;
  }

  await ctx.reply(`🗑️ Deleted task ${deleted.name}.`);
}

async function handleEpicUpdateField(ctx: Context, userId: string, chatId: string, field: string) {
  const state = await conversationService.getActiveState(userId);
  if (!state || state.flow !== FlowType.EPIC_UPDATE) {
    throw new UserFacingError('That epic update flow expired. Start /epic_update again.');
  }

  if (field !== 'name') {
    throw new UserFacingError('Choose one of the available fields.');
  }

  await conversationService.updateFlow(userId, chatId, {
    flow: FlowType.EPIC_UPDATE,
    step: 'WAIT_NAME_VALUE',
    payload: state.payload,
  });

  await ctx.reply('Send the new epic name.');
}

async function handleTaskUpdateField(ctx: Context, userId: string, chatId: string, field: string) {
  const state = await conversationService.getActiveState(userId);
  if (!state || state.flow !== FlowType.TASK_UPDATE) {
    throw new UserFacingError('That task update flow expired. Start /task_update again.');
  }

  if (field === 'epic') {
    await conversationService.updateFlow(userId, chatId, {
      flow: FlowType.TASK_UPDATE,
      step: 'WAIT_EPIC_SELECTION',
      payload: state.payload,
    });
    await botReplies.showEpicSelection(ctx, userId, EPIC_PURPOSE.TASK_UPDATE);
    return;
  }

  if (field === 'status') {
    await conversationService.updateFlow(userId, chatId, {
      flow: FlowType.TASK_UPDATE,
      step: 'WAIT_STATUS_VALUE',
      payload: state.payload,
    });
    await ctx.reply('Choose the new status:', {
      reply_markup: buildStatusChoiceKeyboard(),
    });
    return;
  }

  const nextStepMap: Record<string, string> = {
    name: 'WAIT_NAME_VALUE',
    dueDate: 'WAIT_DUE_DATE_VALUE',
  };

  const nextStep = nextStepMap[field];
  if (!nextStep) {
    throw new UserFacingError('Choose one of the available task fields.');
  }

  await conversationService.updateFlow(userId, chatId, {
    flow: FlowType.TASK_UPDATE,
    step: nextStep,
    payload: state.payload,
  });

  const promptByField: Record<string, string> = {
    name: 'Send the new task name.',
    dueDate: 'Send the new due date, or type skip to clear it.',
  };

  const prompt = promptByField[field];
  if (!prompt) {
    throw new UserFacingError('Choose one of the available task fields.');
  }

  await ctx.reply(prompt);
}

async function handleTaskUpdateStatus(ctx: Context, userId: string, statusValue: string) {
  const state = await conversationService.getActiveState(userId);
  if (!state || state.flow !== FlowType.TASK_UPDATE) {
    throw new UserFacingError('That task update flow expired. Start /task_update again.');
  }

  const taskId = String(state.payload.taskId ?? '');
  const task = await taskService.updateTask({
    telegramUserId: userId,
    taskId,
    status: normalizeStatus(statusValue),
  });

  await conversationService.clearFlow(userId);
  await ctx.reply(`✅ Task updated.\n\n${formatTaskDetails(task)}`);
}

function normalizeStatus(value: string): TaskStatus {
  return value === TaskStatus.DONE ? TaskStatus.DONE : TaskStatus.TODO;
}
