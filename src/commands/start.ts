import { Telegraf } from 'telegraf';

import { buildPrimaryNavigationKeyboard } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { getIdentity } from '../utils/telegram';

const startMessage = [
  '👋 Welcome to Taskmaster.',
  '',
  'Taskmaster uses Scrum-style naming:',
  '• Epic = a group of related tasks',
  '• Task = one action item inside an epic',
  '',
  'Examples:',
  '• Epic: Things to buy for going overseas',
  '• Task: Moisturiser under that epic',
  '• Epic: Pending tasks',
  '• Task: Wash the car under that epic',
  '',
  'Use the floating Tasks and Epics buttons for the main management hubs.',
  '',
  'You never need to memorise IDs. When selection is needed, I will show inline buttons.',
  '',
  'Commands:',
  '/epics, /epic_create, /epic_view, /epic_update, /epic_delete',
  '/tasks, /task_create, /task_view, /task_update, /task_delete',
  '/task_done, /task_undone, /cancel, /help',
].join('\n');

export function registerStartCommand(bot: Telegraf) {
  bot.start(withErrorHandling(async (ctx) => {
    getIdentity(ctx);
    await ctx.reply(startMessage, {
      reply_markup: buildPrimaryNavigationKeyboard(),
    });
  }));
}
