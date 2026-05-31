import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/types';

type CallbackMarkupButton = ReturnType<typeof Markup.button.callback>;

export function inlineKeyboard(rows: CallbackMarkupButton[][]): InlineKeyboardMarkup {
  return Markup.inlineKeyboard(rows).reply_markup;
}
