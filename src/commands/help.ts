import { Telegraf } from 'telegraf';

import { buildStartKeyboard } from '../keyboards/navigation';
import { withErrorHandling } from '../middleware/withErrorHandling';

const helpMessage = [
  '🧭 Taskmaster commands',
  '',
  '/epics - Open the epic flow',
  '/tasks - Open the task flow',
  '/start - Show the start hub',
  '',
  'Examples:',
  '• /tasks',
  '• /epics',
  '',
  'The inline hub keeps Tasks, Epics, and Back available once you enter a list.',
  '',
  'Tapping a task completes it immediately. Tapping an epic deletes it and all of its tasks immediately.',
].join('\n');

export function registerHelpCommand(bot: Telegraf) {
  bot.command('help', withErrorHandling(async (ctx) => {
    await ctx.reply(helpMessage, {
      reply_markup: buildStartKeyboard(),
    });
  }));
}
