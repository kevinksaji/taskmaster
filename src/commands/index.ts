import { Telegraf } from 'telegraf';

import { registerAccountCommands } from './a';
import { registerCancelCommands } from './c';
import { registerEpicCommands } from './e';
import { registerStartCommand } from './start';
import { registerSubscriptionCommands } from './s';
import { registerTaskCommands } from './t';

export function registerCommands(bot: Telegraf) {
  registerStartCommand(bot);
  registerEpicCommands(bot);
  registerTaskCommands(bot);
  registerCancelCommands(bot);
  registerAccountCommands(bot);
  registerSubscriptionCommands(bot);
}
