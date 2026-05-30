import { ReplyKeyboardMarkup } from 'telegraf/types';

export const PRIMARY_NAVIGATION_LABELS = {
  TASKS: '/tasks',
  EPICS: '/epics',
} as const;

export function buildPrimaryNavigationKeyboard(): ReplyKeyboardMarkup {
  return {
    keyboard: [[
      { text: PRIMARY_NAVIGATION_LABELS.TASKS },
      { text: PRIMARY_NAVIGATION_LABELS.EPICS },
    ]],
    resize_keyboard: true,
    is_persistent: true,
    input_field_placeholder: 'Choose /tasks or /epics',
  };
}
