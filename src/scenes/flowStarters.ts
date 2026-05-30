import { Context } from 'telegraf';

import { buildEpicsFlowKeyboard, buildTasksFlowKeyboard } from '../keyboards/navigation';
import { conversationService } from '../services/conversationService';
import { FlowType } from '../types/conversation';
import { TelegramIdentity } from '../utils/telegram';

export async function startEpicCreateFlow(ctx: Context, identity: TelegramIdentity) {
  await conversationService.startFlow(identity.userId, identity.chatId, FlowType.EPIC_CREATE, 'WAIT_NAME');
  await ctx.reply('📘 Let’s create an epic.\n\nSend the epic name.', {
    reply_markup: buildEpicsFlowKeyboard(),
  });
}

export async function startTaskCreateFlow(ctx: Context, identity: TelegramIdentity, payload: Record<string, unknown> = {}) {
  await conversationService.startFlow(identity.userId, identity.chatId, FlowType.TASK_CREATE, 'WAIT_NAME', payload);
  await ctx.reply('📝 Let’s create a task.\n\nSend the task name.', {
    reply_markup: buildTasksFlowKeyboard(),
  });
}
