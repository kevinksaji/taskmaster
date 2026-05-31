export function showTaskEpicBrowserData() {
  return 'tb';
}

export function showEpicTasksData(epicId: string) {
  return `tv|${epicId}`;
}

export function deleteTaskData(taskId: string, epicId: string) {
  return `td|${taskId}|${epicId}`;
}

export function showEpicDeleteBrowserData() {
  return 'eb';
}

export function deleteEpicData(epicId: string) {
  return `ed|${epicId}`;
}

export function selectTaskEpicData(epicId: string) {
  return `ts|${epicId}`;
}

export function createEpicForTasksData() {
  return 'tc';
}

export function cancelData() {
  return 'cx';
}