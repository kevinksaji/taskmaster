import { Context } from 'telegraf';

import { buildEpicCreatedKeyboard, buildTaskCreatedKeyboard } from '../keyboards/followups';
import { botReplies } from '../bot/replies';
import { conversationService } from '../services/conversationService';
import { epicService } from '../services/epicService';
import { taskService } from '../services/taskService';
import { FlowType } from '../types/conversation';
import { EPIC_PURPOSE } from '../utils/callback-data';
import { parseHumanDate } from '../utils/date';
import { formatEpicDetails, formatTaskDetails } from '../utils/formatters';
import { getIdentity, isCommandText } from '../utils/telegram';

export async function routeTextFlow(ctx: Context) {
  if (!('message' in ctx) || !ctx.message || !('text' in ctx.message)) {
    return;
  }

  const text = ctx.message.text.trim();
  if (isCommandText(text)) {
    return;
  }

  const identity = getIdentity(ctx);
  const state = await conversationService.getActiveState(identity.userId);
  if (!state) {
    return;
  }

  switch (state.flow) {
    case FlowType.EPIC_CREATE:
      await handleEpicCreate(ctx, identity.userId, identity.chatId, state.step, state.payload, text);
      return;
    case FlowType.EPIC_UPDATE:
      await handleEpicUpdate(ctx, identity.userId, identity.chatId, state.step, state.payload, text);
      return;
    case FlowType.TASK_CREATE:
      await handleTaskCreate(ctx, identity.userId, identity.chatId, state.step, state.payload, text);
      return;
    case FlowType.TASK_UPDATE:
      await handleTaskUpdate(ctx, identity.userId, identity.chatId, state.step, state.payload, text);
      return;
    default:
      await ctx.reply('Use the buttons shown in the current flow, or send /cancel to stop it.');
  }
}

async function handleEpicCreate(
  ctx: Context,
  userId: string,
  chatId: string,
  step: string,
  payload: Record<string, unknown>,
  text: string,
) {
  if (step === 'WAIT_NAME') {
    const created = await epicService.createEpic({
      telegramUserId: userId,
      name: text,
    });

    await conversationService.clearFlow(userId);
    await ctx.reply(
      `${formatEpicDetails({
        epic: created,
        tasks: [],
        counts: { total: 0, todo: 0, done: 0 },
      })}\n\n✅ Epic created successfully.`,
      {
        reply_markup: buildEpicCreatedKeyboard(created.id),
      },
    );
    return;
  }

  await ctx.reply('Use the current buttons or send /cancel to exit this flow.');
}

async function handleEpicUpdate(
  ctx: Context,
  userId: string,
  userChatId: string,
  step: string,
  payload: Record<string, unknown>,
  text: string,
) {
  const epicId = String(payload.epicId ?? '');
  if (!epicId) {
    await conversationService.clearFlow(userId);
    await ctx.reply('That update flow expired. Please start /epic_update again.');
    return;
  }

  if (step === 'WAIT_NAME_VALUE') {
    await epicService.updateEpic({
      telegramUserId: userId,
      epicId,
      name: text,
    });
    const details = await epicService.getEpicDetails(userId, epicId);

    await conversationService.clearFlow(userId);
    await ctx.reply(`✅ Epic updated.\n\n${formatEpicDetails(details)}`);
    return;
  }

  if (step === 'WAIT_FIELD') {
    await conversationService.updateFlow(userId, userChatId, {
      flow: FlowType.EPIC_UPDATE,
      step: 'WAIT_NAME_VALUE',
      payload,
    });
    await ctx.reply('Send the new epic name, or send /cancel.');
    return;
  }

  await ctx.reply('Use the current buttons or send /cancel to exit this flow.');
}

async function handleTaskCreate(
  ctx: Context,
  userId: string,
  chatId: string,
  step: string,
  payload: Record<string, unknown>,
  text: string,
) {
  if (step === 'WAIT_NAME') {
    const nextPayload = {
      ...payload,
      name: text,
    };

    if (payload.epicId) {
      await conversationService.updateFlow(userId, chatId, {
        flow: FlowType.TASK_CREATE,
        step: 'WAIT_DUE_DATE',
        payload: nextPayload,
      });
      await ctx.reply('Send a due date, or type skip. Examples: 2026-06-15, tomorrow, next monday, in 3 days.');
      return;
    }

    const epics = await epicService.listEpics(userId);
    if (epics.length === 0) {
      await conversationService.clearFlow(userId);
      await ctx.reply('You need at least one epic before creating a task. Use /epic_create first.');
      return;
    }

    await conversationService.updateFlow(userId, chatId, {
      flow: FlowType.TASK_CREATE,
      step: 'WAIT_EPIC_SELECTION',
      payload: nextPayload,
    });

    await botReplies.showEpicSelection(ctx, userId, EPIC_PURPOSE.TASK_CREATE);
    return;
  }

  if (step === 'WAIT_EPIC_SELECTION') {
    await ctx.reply('Choose an epic using the inline buttons, or send /cancel.');
    return;
  }

  if (step === 'WAIT_DUE_DATE') {
    let dueDate: string | null = null;
    if (text.toLowerCase() !== 'skip') {
      const parsed = parseHumanDate(text);
      if (!parsed.ok) {
        await ctx.reply(parsed.error);
        return;
      }

      dueDate = parsed.value.toISOString();
    }

    const task = await taskService.createTask({
      telegramUserId: userId,
      name: String(payload.name ?? ''),
      epicId: String(payload.epicId ?? ''),
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await conversationService.clearFlow(userId);
    await ctx.reply(`✅ Task created.\n\n${formatTaskDetails(task)}`, {
      reply_markup: buildTaskCreatedKeyboard(task.id),
    });
    return;
  }

  await ctx.reply('Use the current buttons or send /cancel to exit this flow.');
}

async function handleTaskUpdate(
  ctx: Context,
  userId: string,
  chatId: string,
  step: string,
  payload: Record<string, unknown>,
  text: string,
) {
  const taskId = String(payload.taskId ?? '');
  if (!taskId) {
    await conversationService.clearFlow(userId);
    await ctx.reply('That update flow expired. Please start /task_update again.');
    return;
  }

  if (step === 'WAIT_FIELD' || step === 'WAIT_EPIC_SELECTION' || step === 'WAIT_STATUS_VALUE') {
    await conversationService.updateFlow(userId, chatId, {
      flow: FlowType.TASK_UPDATE,
      step,
      payload,
    });
    await ctx.reply('Use the inline buttons for this step, or send /cancel.');
    return;
  }

  if (step === 'WAIT_NAME_VALUE') {
    const task = await taskService.updateTask({ telegramUserId: userId, taskId, name: text });
    await conversationService.clearFlow(userId);
    await ctx.reply(`✅ Task updated.\n\n${formatTaskDetails(task)}`);
    return;
  }

  if (step === 'WAIT_DUE_DATE_VALUE') {
    let dueDate: Date | null = null;
    if (text.toLowerCase() !== 'skip') {
      const parsed = parseHumanDate(text);
      if (!parsed.ok) {
        await ctx.reply(parsed.error);
        return;
      }

      dueDate = parsed.value;
    }

    const task = await taskService.updateTask({
      telegramUserId: userId,
      taskId,
      dueDate,
    });
    await conversationService.clearFlow(userId);
    await ctx.reply(`✅ Task updated.\n\n${formatTaskDetails(task)}`);
    return;
  }

  await ctx.reply('Use the current buttons or send /cancel to exit this flow.');
}
