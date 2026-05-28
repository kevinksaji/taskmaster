import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/types';

type CallbackMarkupButton = ReturnType<typeof Markup.button.callback>;

export function inlineKeyboard(rows: CallbackMarkupButton[][]): InlineKeyboardMarkup {
  return Markup.inlineKeyboard(rows).reply_markup;
}

export function paginationRow(previousData: string | null, nextData: string | null, page: number, pageCount: number) {
  const row: CallbackMarkupButton[] = [];

  if (previousData) {
    row.push(Markup.button.callback('⬅️ Prev', previousData));
  }

  row.push(Markup.button.callback(`${page + 1}/${pageCount}`, 'noop'));

  if (nextData) {
    row.push(Markup.button.callback('Next ➡️', nextData));
  }

  return row;
}

export function cancelRow(callbackData = 'ca') {
  return [Markup.button.callback('Cancel', callbackData)];
}
