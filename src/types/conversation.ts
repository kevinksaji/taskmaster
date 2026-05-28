export const FlowType = {
  EPIC_CREATE: 'EPIC_CREATE',
  EPIC_UPDATE: 'EPIC_UPDATE',
  TASK_CREATE: 'TASK_CREATE',
  TASK_UPDATE: 'TASK_UPDATE',
  TASK_DELETE: 'TASK_DELETE',
  TASK_DONE: 'TASK_DONE',
  TASK_UNDONE: 'TASK_UNDONE',
  EPIC_DELETE: 'EPIC_DELETE',
} as const;

export type FlowType = (typeof FlowType)[keyof typeof FlowType];

export type ConversationStateValue = {
  flow: FlowType;
  step: string;
  payload: Record<string, unknown>;
};
