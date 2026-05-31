export const HUB_VIEWS = {
  HOME: 'HOME',
  TASKS: 'TASKS',
  EPICS: 'EPICS',
} as const;

export type HubView = (typeof HUB_VIEWS)[keyof typeof HUB_VIEWS];