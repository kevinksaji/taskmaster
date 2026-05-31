import { Telegraf } from 'telegraf';

import { buildPrimaryNavigationKeyboard } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';

const helpMessage = [
  '🧭 Taskmaster commands',
  '',
  '/epics - Open the epic flow',
  '/epic_create - Create an epic in a guided flow',
  '/tasks - Open the task flow',
  '/task_create - Create a task in a guided flow',
  '/back - Return to the main tasks or epics chooser',
  '/cancel - Cancel the current flow',
  '',
  'Examples:',
  '• /tasks',
  '• /task_create',
  '• /epics',
  '',
  'The /tasks and /epics buttons below switch the bot between the two main flows.',
  '',
  'Interactive flows use inline keyboards, so you never need to type internal IDs.',
].join('\n');

export function registerHelpCommand(bot: Telegraf) {
  bot.command('help', withErrorHandling(async (ctx) => {
    await ctx.reply(helpMessage, {
      reply_markup: buildPrimaryNavigationKeyboard(),
    });
  }));
}
