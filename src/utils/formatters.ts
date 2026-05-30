import { TaskStatus } from '@prisma/client';

import { formatDate, isOverdue } from './date';

type EpicSummaryInput = {
  id: string;
  name: string;
  _count?: { tasks: number };
};

type TaskSummaryInput = {
  id: string;
  name: string;
  dueDate: Date | null;
  status: TaskStatus;
  epic: { id: string; name: string };
};

export function formatEpicList(epics: EpicSummaryInput[]): string {
  if (epics.length === 0) {
    return '📭 No epics yet. Use /epic_create to add your first epic.';
  }

  return [
    '📚 Your epics',
    '',
    ...epics.map((epic, index) => {
      const taskCount = epic._count?.tasks ?? 0;
      return `${index + 1}. ${epic.name}\nTasks: ${taskCount}`;
    }),
  ].join('\n\n');
}

export function formatEpicDetails(input: {
  epic: EpicSummaryInput;
  tasks: TaskSummaryInput[];
  counts: { total: number; todo: number; done: number };
}): string {
  const lines = [
    `📘 ${input.epic.name}`,
    `Tasks: ${input.counts.total} total`,
    `Todo: ${input.counts.todo}`,
    `Done: ${input.counts.done}`,
  ];

  if (input.tasks.length > 0) {
    lines.push('');
    lines.push('Tasks in this epic:');
    lines.push(...input.tasks.slice(0, 8).map((task) => `• ${task.name} (${formatTaskStatus(task.status)})`));
    if (input.tasks.length > 8) {
      lines.push(`• and ${input.tasks.length - 8} more`);
    }
  }

  return lines.join('\n');
}

export function formatTaskStatus(status: TaskStatus): string {
  return status === TaskStatus.DONE ? 'Done' : 'Todo';
}

export function formatTaskList(tasks: TaskSummaryInput[], title: string): string {
  if (tasks.length === 0) {
    return `📭 No tasks found for ${title}.`;
  }

  return [
    `🗂️ Tasks: ${title}`,
    '',
    ...tasks.map((task, index) => {
      const dueLabel = task.dueDate ? formatDate(task.dueDate) : 'No due date';
      const overdue = isOverdue(task) ? ' • overdue' : '';
      return `${index + 1}. ${task.name}\nEpic: ${task.epic.name}\nStatus: ${formatTaskStatus(task.status)}\nDue: ${dueLabel}${overdue}`;
    }),
  ].join('\n\n');
}

export function formatTaskDetails(task: TaskSummaryInput): string {
  const overdue = isOverdue(task) ? 'Yes' : 'No';

  return [
    `📝 ${task.name}`,
    `Epic: ${task.epic.name}`,
    `Status: ${formatTaskStatus(task.status)}`,
    `Due date: ${formatDate(task.dueDate)}`,
    `Overdue: ${overdue}`,
  ].join('\n');
}
