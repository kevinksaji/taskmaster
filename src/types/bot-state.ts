export const BOT_OPERATION_KINDS = {
  IDLE: 'IDLE',
  TASK_BATCH_PICK_EPIC: 'TASK_BATCH_PICK_EPIC',
  TASK_BATCH_CREATE_EPIC_NAME: 'TASK_BATCH_CREATE_EPIC_NAME',
} as const;

export type BotOperationKind = (typeof BOT_OPERATION_KINDS)[keyof typeof BOT_OPERATION_KINDS];

export type BotSession = {
  started: boolean;
  lastQuoteText: string | null;
  operation:
    | { kind: typeof BOT_OPERATION_KINDS.IDLE }
    | { kind: typeof BOT_OPERATION_KINDS.TASK_BATCH_PICK_EPIC; taskNames: string[] }
    | { kind: typeof BOT_OPERATION_KINDS.TASK_BATCH_CREATE_EPIC_NAME; taskNames: string[] };
};

export const DEFAULT_BOT_SESSION: BotSession = {
  started: false,
  lastQuoteText: null,
  operation: { kind: BOT_OPERATION_KINDS.IDLE },
};