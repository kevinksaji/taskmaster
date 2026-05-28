import { Telegraf } from 'telegraf';

import { TELEGRAM_COMMANDS } from '../config/commands';
import { logger } from '../utils/logger';

let bootstrapPromise: Promise<void> | null = null;

export function ensureBotBootstrap(bot: Telegraf) {
  if (!bootstrapPromise) {
    bootstrapPromise = bot.telegram.setMyCommands([...TELEGRAM_COMMANDS]).then(() => {
      logger.info('telegram.commands.registered', { commandCount: TELEGRAM_COMMANDS.length });
    }).catch((error) => {
      bootstrapPromise = null;
      logger.error('telegram.commands.register_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    });
  }

  return bootstrapPromise;
}
