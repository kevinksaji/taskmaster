import { Context } from 'telegraf';

import { botReplies } from '../bot/replies';
import { epicService } from '../services/epicService';
import { sessionService } from '../services/sessionService';
import { taskService } from '../services/taskService';
import { BOT_OPERATION_KINDS } from '../types/bot-state';
import { getIdentity, isCommandText } from '../utils/telegram';

function parsePrefixedLines(text: string, prefix: 't' | 'e') {
  const normalized = text.replace(/\r/g, '').trim();
  const matcher = new RegExp(`^${prefix}(\\s|$)`, 'i');
  if (!matcher.test(normalized)) {
    return null;
  }

  const lines = normalized.split('\n');
  const firstLine = (lines[0] ?? '').replace(new RegExp(`^${prefix}\\s*`, 'i'), '').trim();

  return [firstLine, ...lines.slice(1).map((line) => line.trim())]
    .filter(Boolean);
}

function parseEpicName(text: string) {
  const prefixed = parsePrefixedLines(text, 'e');
  if (prefixed?.[0]) {
    return prefixed[0];
  }

  return text.trim() || null;
}

export async function routeNavigationText(ctx: Context) {
  if (!('message' in ctx) || !ctx.message || !('text' in ctx.message)) {
    return;
  }

  const text = ctx.message.text.trim();
  if (!text || isCommandText(text)) {
    return;
  }

  const identity = getIdentity(ctx);

  // The rewrite is text-first: messages that start with `t` create pending task
  // batches, messages that start with `e` create epics, and plain text is only
  // interpreted when the user is already inside a pending operation.
  const taskLines = parsePrefixedLines(text, 't');
  if (taskLines) {
    await sessionService.startTaskBatch(identity.userId, taskLines);
    await botReplies.showTaskBatchEpicPicker(ctx, identity.userId);
    return;
  }

  const epicLines = parsePrefixedLines(text, 'e');
  if (epicLines) {
    const result = await epicService.createEpics({
      telegramUserId: identity.userId,
      names: epicLines,
    });

    if (result.created.length === 0) {
      await ctx.reply('No new epics were created.');
      return;
    }

    const createdNames = result.created.map((epic) => epic.name).join(', ');
    await ctx.reply(`Created epic${result.created.length > 1 ? 's' : ''}: ${createdNames}`);
    return;
  }

  const session = await sessionService.getSession(identity.userId);
  if (session.operation.kind !== BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME) {
    return;
  }

  const epicName = parseEpicName(text);
  if (!epicName) {
    await ctx.reply('Send the new epic name for these tasks.');
    return;
  }

  const epic = await epicService.createEpic({
    telegramUserId: identity.userId,
    name: epicName,
  });

  await taskService.createTasks({
    telegramUserId: identity.userId,
    epicId: epic.id,
    names: session.operation.taskNames,
  });

  await sessionService.clearOperation(identity.userId);
  await ctx.reply(`Created ${epic.name} and added ${session.operation.taskNames.length} task${session.operation.taskNames.length > 1 ? 's' : ''}.`);
  await botReplies.showTasksForEpic(ctx, identity.userId, epic.id);
}