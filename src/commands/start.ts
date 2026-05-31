import { Context, Telegraf } from 'telegraf';

import { buildPrimaryNavigationKeyboard, PRIMARY_NAVIGATION_LABELS } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { conversationService } from '../services/conversationService';
import { getIdentity } from '../utils/telegram';

const startMessage = [
  '👋 Welcome to Taskmaster.',
  '',
  'Use the floating Tasks and Epics buttons below to switch between the two main flows.',
  '',
  'Tasks flow:',
  '• Lists every task as Task - Epic',
  '• Tap a task to complete it',
  '',
  'Epics flow:',
  '• Lists every epic as a button',
  '• Clicking an epic opens the tasks in that epic',
].join('\n');

export async function replyWithPrimaryNavigation(ctx: Context) {
  const identity = getIdentity(ctx);
  await conversationService.clearFlow(identity.userId);
  await ctx.reply(startMessage, {
    reply_markup: buildPrimaryNavigationKeyboard(),
  });
}

export function registerStartCommand(bot: Telegraf) {
  bot.start(withErrorHandling(async (ctx) => {
    await replyWithPrimaryNavigation(ctx);
  }));

  bot.command('back', withErrorHandling(async (ctx) => {
    await replyWithPrimaryNavigation(ctx);
  }));

  bot.hears(PRIMARY_NAVIGATION_LABELS.BACK, withErrorHandling(async (ctx) => {
    await replyWithPrimaryNavigation(ctx);
  }));
}
