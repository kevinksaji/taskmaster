export const TELEGRAM_COMMANDS = [
  { command: 'start', description: 'Welcome message and quick examples' },
  { command: 'back', description: 'Return to the main tasks or epics chooser' },
  { command: 'help', description: 'Show all commands and usage tips' },
  { command: 'epics', description: 'Open the epic flow' },
  { command: 'epic_create', description: 'Create a new epic' },
  { command: 'tasks', description: 'Open the task flow' },
  { command: 'task_create', description: 'Create a new task' },
  { command: 'cancel', description: 'Cancel the current flow' },
] as const;
