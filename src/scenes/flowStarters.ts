import { Context } from 'telegraf';

import { buildPrimaryNavigationKeyboard } from '../keyboards/navigation';
import { buildTaskUpdateFieldKeyboard } from '../keyboards/tasks';
import { conversationService } from '../services/conversationService';
import { FlowType } from '../types/conversation';
import { TelegramIdentity } from '../utils/telegram';

export async function startEpicCreateFlow(ctx: Context, identity: TelegramIdentity) {
  await conversationService.startFlow(identity.userId, identity.chatId, FlowType.EPIC_CREATE, 'WAIT_NAME');
  await ctx.reply('📘 Let’s create an epic.\n\nSend the epic name.', {
    reply_markup: buildPrimaryNavigationKeyboard(),
  });
}

export async function startTaskCreateFlow(ctx: Context, identity: TelegramIdentity, payload: Record<string, unknown> = {}) {
  await conversationService.startFlow(identity.userId, identity.chatId, FlowType.TASK_CREATE, 'WAIT_NAME', payload);
  await ctx.reply('📝 Let’s create a task.\n\nSend the task name.', {
    reply_markup: buildPrimaryNavigationKeyboard(),
  });
}

export async function startEpicUpdateFlow(ctx: Context, identity: TelegramIdentity, epicId: string) {
  await conversationService.startFlow(identity.userId, identity.chatId, FlowType.EPIC_UPDATE, 'WAIT_NAME_VALUE', { epicId });
  await ctx.reply('Send the new epic name.', {
    reply_markup: buildPrimaryNavigationKeyboard(),
  });
}

export async function startTaskUpdateFlow(ctx: Context, identity: TelegramIdentity, taskId: string) {
  await conversationService.startFlow(identity.userId, identity.chatId, FlowType.TASK_UPDATE, 'WAIT_FIELD', { taskId });
  await ctx.reply('Choose what to update on this task:', {
    reply_markup: buildTaskUpdateFieldKeyboard(),
  });
}
