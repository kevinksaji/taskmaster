import { Context } from 'telegraf';

import { buildEpicCreatedKeyboard, buildTaskCreatedKeyboard } from '../keyboards/followups';
import { buildEpicsFlowKeyboard, buildTasksFlowKeyboard } from '../keyboards/navigation';
import { botReplies } from '../bot/replies';
import { conversationService } from '../services/conversationService';
import { epicService } from '../services/epicService';
import { taskService } from '../services/taskService';
import { FlowType } from '../types/conversation';
import { EPIC_PURPOSE } from '../utils/callback-data';
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
    case FlowType.TASK_CREATE:
      await handleTaskCreate(ctx, identity.userId, identity.chatId, state.step, state.payload, text);
      return;
    default:
      await ctx.reply('Use the buttons shown in the current flow, or send /cancel to stop it.', {
        reply_markup: buildTasksFlowKeyboard(),
      });
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
        counts: { total: 0 },
      })}\n\n✅ Epic created successfully.`,
      {
        reply_markup: buildEpicCreatedKeyboard(created.id),
      },
    );
    await ctx.reply('Use /epic_create to create another epic, or /back to return to the main menu.', {
      reply_markup: buildEpicsFlowKeyboard(),
    });
    return;
  }

  await ctx.reply('Use the current buttons or send /cancel to exit this flow.', {
    reply_markup: buildEpicsFlowKeyboard(),
  });
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
      const task = await taskService.createTask({
        telegramUserId: userId,
        name: String(nextPayload.name ?? ''),
        epicId: String(payload.epicId ?? ''),
      });

      await conversationService.clearFlow(userId);
      await ctx.reply(`✅ Task created.\n\n${formatTaskDetails(task)}`, {
        reply_markup: buildTaskCreatedKeyboard(task.id),
      });
      await ctx.reply('Use /task_create to create another task, or /back to return to the main menu.', {
        reply_markup: buildTasksFlowKeyboard(),
      });
      return;
    }

    const epics = await epicService.listEpics(userId);
    if (epics.length === 0) {
      await conversationService.clearFlow(userId);
      await ctx.reply('You need at least one epic before creating a task. Use /epic_create first, or /back to return to the main menu.', {
        reply_markup: buildTasksFlowKeyboard(),
      });
      return;
    }

    await conversationService.updateFlow(userId, chatId, {
      flow: FlowType.TASK_CREATE,
      step: 'WAIT_EPIC_SELECTION',
      payload: nextPayload,
    });

    await ctx.reply('Choose an epic below. /task_create and /back will stay available while you are in this flow.', {
      reply_markup: buildTasksFlowKeyboard(),
    });
    await botReplies.showEpicSelection(ctx, userId, EPIC_PURPOSE.TASK_CREATE);
    return;
  }

  if (step === 'WAIT_EPIC_SELECTION') {
    await ctx.reply('Choose an epic using the inline buttons, or use /task_create to restart or /back to return to the main menu.', {
      reply_markup: buildTasksFlowKeyboard(),
    });
    return;
  }

  await ctx.reply('Use the current buttons or send /cancel to exit this flow.', {
    reply_markup: buildTasksFlowKeyboard(),
  });
}
