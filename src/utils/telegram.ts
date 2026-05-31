import { Context } from 'telegraf';

import { logger } from './logger';

export type TelegramIdentity = {
  userId: string;
  chatId: string;
  firstName: string;
};

export function getIdentity(ctx: Context): TelegramIdentity {
  const from = ctx.from;
  const chat = ctx.chat;

  if (!from || !chat) {
    throw new Error('Telegram identity is missing from update context.');
  }

  return {
    userId: String(from.id),
    chatId: String(chat.id),
    firstName: from.first_name ?? 'there',
  };
}

export function isCommandText(text: string | undefined): boolean {
  return Boolean(text?.trim().startsWith('/'));
}

export async function answerCallback(ctx: Context, text?: string) {
  if (!('answerCbQuery' in ctx) || typeof ctx.answerCbQuery !== 'function') {
    return;
  }

  try {
    await ctx.answerCbQuery(text);
  } catch (error) {
    logger.warn('telegram.callback.answer_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
