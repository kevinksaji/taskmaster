import { ReplyKeyboardMarkup } from 'telegraf/types';

export const PRIMARY_NAVIGATION_LABELS = {
  TASKS: '/tasks',
  EPICS: '/epics',
  TASK_CREATE: '/task_create',
  EPIC_CREATE: '/epic_create',
  MAIN: '/start',
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

export function buildTasksFlowKeyboard(): ReplyKeyboardMarkup {
  return {
    keyboard: [[
      { text: PRIMARY_NAVIGATION_LABELS.TASK_CREATE },
      { text: PRIMARY_NAVIGATION_LABELS.MAIN },
    ]],
    resize_keyboard: true,
    is_persistent: true,
    input_field_placeholder: 'Create a task or go back to main',
  };
}

export function buildEpicsFlowKeyboard(): ReplyKeyboardMarkup {
  return {
    keyboard: [[
      { text: PRIMARY_NAVIGATION_LABELS.MAIN },
      { text: PRIMARY_NAVIGATION_LABELS.EPIC_CREATE },
    ]],
    resize_keyboard: true,
    is_persistent: true,
    input_field_placeholder: 'Go back to main or create an epic',
  };
}
