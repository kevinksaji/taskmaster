import { Context } from 'telegraf';

import { getErrorMessage, UserFacingError } from '../utils/errors';
import { logger } from '../utils/logger';

export function withErrorHandling(handler: (ctx: Context) => Promise<void>) {
  return async (ctx: Context) => {
    try {
      await handler(ctx);
    } catch (error) {
      logger.error('telegram.handler.failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        updateType: ctx.updateType,
      });

      const message = error instanceof UserFacingError
        ? error.message
        : 'Something went wrong while handling that request. Please try again.';

      await ctx.reply(message);
    }
  };
}
