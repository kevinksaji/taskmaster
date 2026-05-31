import { Telegraf } from 'telegraf';

import { registerCancelCommands } from './c';
import { registerEpicCommands } from './e';
import { registerStartCommand } from './start';
import { registerTaskCommands } from './t';

export function registerCommands(bot: Telegraf) {
  registerStartCommand(bot);
  registerEpicCommands(bot);
  registerTaskCommands(bot);
  registerCancelCommands(bot);
}
