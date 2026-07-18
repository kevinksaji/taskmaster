export const TELEGRAM_COMMANDS = [
  { command: 'start', description: 'Initialize Taskmaster' },
  { command: 't', description: 'Browse tasks by epic' },
  { command: 'e', description: 'Browse epics to delete' },
  { command: 'c', description: 'Cancel the current operation' },
  { command: 'a', description: 'Browse accounts' },
  { command: 's', description: 'Browse subscriptions' },
] as const;
