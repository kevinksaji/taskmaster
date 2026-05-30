import { Telegraf } from 'telegraf';

import { buildPrimaryNavigationKeyboard } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';
import { dismissReplyKeyboard } from '../utils/telegram';

const helpMessage = [
  '🧭 Taskmaster commands',
  '',
  '/epics - List all epics with quick actions',
  '/epic_create - Create an epic in a guided flow',
  '/epic_view - Pick an epic to inspect',
  '/epic_delete - Pick an epic to delete',
  '/tasks [todo|done|overdue|today] - List tasks with filters',
  '/task_create - Create a task in a guided flow',
  '/task_view - Pick a task to inspect',
  '/task_delete - Pick a task to delete',
  '/cancel - Cancel the current flow',
  '',
  'Examples:',
  '• /tasks overdue',
  '• /task_create',
  '• /epic_delete',
  '',
  'The Tasks and Epics buttons open the main action hubs with less button clutter.',
  '',
  'Interactive flows use inline keyboards, so you never need to type internal IDs.',
].join('\n');

export function registerHelpCommand(bot: Telegraf) {
  bot.command('help', withErrorHandling(async (ctx) => {
    await dismissReplyKeyboard(ctx);
    await ctx.reply(helpMessage, {
      reply_markup: buildPrimaryNavigationKeyboard(),
    });
  }));
}
