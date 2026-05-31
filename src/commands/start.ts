import { Telegraf } from 'telegraf';

import { buildPrimaryNavigationKeyboard } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { conversationService } from '../services/conversationService';
import { getIdentity } from '../utils/telegram';

const startMessage = [
  '👋 Welcome to Taskmaster.',
  '',
  'Use the floating /tasks and /epics buttons below to switch between the two main flows.',
  '',
  'Tasks flow:',
  '• Lists every task as Task - Epic',
  '• Clicking a task shows the completion action',
  '',
  'Epics flow:',
  '• Lists every epic as a button',
  '• Clicking an epic opens the tasks in that epic',
].join('\n');

export async function replyWithPrimaryNavigation(ctx: Parameters<Telegraf['start']>[0] extends never ? never : any) {
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
}
