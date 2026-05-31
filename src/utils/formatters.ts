type EpicSummaryInput = {
  id: string;
  name: string;
  _count?: { tasks: number };
};

type TaskSummaryInput = {
  id: string;
  name: string;
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
  counts: { total: number };
}): string {
  const lines = [
    `📘 ${input.epic.name}`,
    `Tasks: ${input.counts.total} total`,
  ];

  if (input.tasks.length > 0) {
    lines.push('');
    lines.push('Tasks in this epic:');
    lines.push(...input.tasks.slice(0, 8).map((task) => `• ${task.name}`));
    if (input.tasks.length > 8) {
      lines.push(`• and ${input.tasks.length - 8} more`);
    }
  }

  return lines.join('\n');
}

export function formatTaskList(tasks: TaskSummaryInput[], title: string): string {
  if (tasks.length === 0) {
    return `📭 No tasks found for ${title}.`;
  }

  return [
    `🗂️ Tasks: ${title}`,
    '',
    ...tasks.map((task, index) => {
      return `${index + 1}. ${task.name}\nEpic: ${task.epic.name}`;
    }),
  ].join('\n\n');
}

export function formatTaskDetails(task: TaskSummaryInput): string {
  return [
    `📝 ${task.name}`,
    `Epic: ${task.epic.name}`,
  ].join('\n');
}
