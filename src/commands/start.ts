import { Context, Telegraf } from 'telegraf';

import { botReplies } from '../bot/replies';
import { withErrorHandling } from '../middleware/withErrorHandling';

const startMessage = [
  '👋 Welcome to Taskmaster.',
  '',
  'Tap Tasks to see every task as a button.',
  'Tap a task button to complete it immediately.',
  '',
  'Tap Epics to see every epic as a button.',
  'Tap an epic button to delete that epic and all of its tasks immediately.',
  '',
  'Use Back in the hub to return to the previous screen.',
].join('\n');

export async function replyWithPrimaryNavigation(ctx: Context) {
  await ctx.reply(startMessage, { reply_markup: undefined });
  await botReplies.showStart(ctx);
}

export function registerStartCommand(bot: Telegraf) {
  bot.start(withErrorHandling(async (ctx) => {
    await replyWithPrimaryNavigation(ctx);
  }));
}
