import { Telegraf } from 'telegraf';

import { registerEpicCommands } from './epics';
import { registerHelpCommand } from './help';
import { registerStartCommand } from './start';
import { registerTaskCommands } from './tasks';

export function registerCommands(bot: Telegraf) {
  registerStartCommand(bot);
  registerHelpCommand(bot);
  registerEpicCommands(bot);
  registerTaskCommands(bot);
}
