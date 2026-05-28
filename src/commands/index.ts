import { Telegraf } from 'telegraf';

import { registerCancelCommand } from './cancel';
import { registerEpicCommands } from './epics';
import { registerHelpCommand } from './help';
import { registerStartCommand } from './start';
import { registerTaskCommands } from './tasks';

export function registerCommands(bot: Telegraf) {
  registerStartCommand(bot);
  registerHelpCommand(bot);
  registerCancelCommand(bot);
  registerEpicCommands(bot);
  registerTaskCommands(bot);
}
