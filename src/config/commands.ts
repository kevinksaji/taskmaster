export const TELEGRAM_COMMANDS = [
  { command: 'start', description: 'Welcome message and quick examples' },
  { command: 'help', description: 'Show all commands and usage tips' },
  { command: 'epics', description: 'List your epics with quick actions' },
  { command: 'epic_create', description: 'Create a new epic' },
  { command: 'epic_view', description: 'Pick an epic to view' },
  { command: 'epic_delete', description: 'Pick an epic to delete' },
  { command: 'tasks', description: 'List tasks with optional filters' },
  { command: 'task_create', description: 'Create a new task' },
  { command: 'task_view', description: 'Pick a task to view' },
  { command: 'task_delete', description: 'Pick a task to delete' },
  { command: 'cancel', description: 'Cancel the current flow' },
] as const;
