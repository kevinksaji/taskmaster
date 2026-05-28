import { Telegraf } from 'telegraf';

import { withErrorHandling } from '../middleware/withErrorHandling';

const helpMessage = [
  '🧭 Taskmaster commands',
  '',
  '/epics - List all epics with quick actions',
  '/epic_create - Create an epic in a guided flow',
  '/epic_view - Pick an epic to inspect',
  '/epic_update - Pick an epic and update its name or description',
  '/epic_delete - Pick an epic and confirm deletion',
  '/tasks [todo|done|overdue|today] - List tasks with filters',
  '/task_create - Create a task in a guided flow',
  '/task_view - Pick a task to inspect',
  '/task_update - Pick a task and update any field',
  '/task_delete - Pick a task and confirm deletion',
  '/task_done - Pick a todo task and mark it done',
  '/task_undone - Pick a done task and mark it todo again',
  '/cancel - Cancel the current flow',
  '',
  'Examples:',
  '• /tasks overdue',
  '• /task_create',
  '• /epic_update',
  '',
  'Interactive flows use inline keyboards, so you never need to type internal IDs.',
].join('\n');

export function registerHelpCommand(bot: Telegraf) {
  bot.command('help', withErrorHandling(async (ctx) => {
    await ctx.reply(helpMessage);
  }));
}
