import { cancelData, createEpicForTasksData } from '../utils/callback-data';
import { toCallbackButton } from './common';

export function buildCancelRow() {
  return [toCallbackButton('Cancel', cancelData())];
}

export function buildBackAndCancelRow(backData: string) {
  return [
    toCallbackButton('Back', backData),
    toCallbackButton('Cancel', cancelData()),
  ];
}

export function buildCreateEpicAndCancelRow() {
  return [
    toCallbackButton('Create epic', createEpicForTasksData()),
    toCallbackButton('Cancel', cancelData()),
  ];
}
