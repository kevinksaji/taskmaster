import { showTaskEpicBrowserData, showEpicTasksData, deleteTaskData, selectTaskEpicData } from '../utils/callback-data';
import { inlineKeyboard, toCallbackButton } from './common';
import { buildBackAndCancelRow, buildCancelRow, buildCreateEpicAndCancelRow } from './navigation';

type EpicLike = {
  id: string;
  name: string;
};

type TaskLike = {
  id: string;
  name: string;
};

export function buildTaskEpicBrowserKeyboard(epics: EpicLike[]) {
  return inlineKeyboard([
    ...epics.map((epic) => [toCallbackButton(epic.name, showEpicTasksData(epic.id))]),
    buildCancelRow(),
  ]);
}

export function buildTaskListKeyboard(tasks: TaskLike[], epicId: string) {
  return inlineKeyboard([
    ...tasks.map((task) => [toCallbackButton(task.name, deleteTaskData(task.id, epicId))]),
    buildBackAndCancelRow(showTaskEpicBrowserData()),
  ]);
}

export function buildTaskBatchEpicKeyboard(epics: EpicLike[]) {
  return inlineKeyboard([
    ...epics.map((epic) => [toCallbackButton(epic.name, selectTaskEpicData(epic.id))]),
    buildCreateEpicAndCancelRow(),
  ]);
}
