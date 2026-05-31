export const FlowType = {
  EPIC_CREATE: 'EPIC_CREATE',
  TASK_CREATE: 'TASK_CREATE',
} as const;

export type FlowType = (typeof FlowType)[keyof typeof FlowType];

export type ConversationStateValue = {
  flow: FlowType;
  step: string;
  payload: Record<string, unknown>;
};
