import { Markup } from 'telegraf';
import { InlineKeyboardButton, InlineKeyboardMarkup } from 'telegraf/types';

type CallbackButton = ReturnType<typeof Markup.button.callback>;

export function inlineKeyboard(rows: CallbackButton[][]): InlineKeyboardMarkup {
  return Markup.inlineKeyboard(rows).reply_markup;
}

export function toCallbackButton(text: string, callbackData: string): CallbackButton {
  return Markup.button.callback(text, callbackData);
}

export function isInlineKeyboardButton(button: unknown): button is InlineKeyboardButton {
  return Boolean(button && typeof button === 'object' && 'callback_data' in button);
}
