import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { TaskStatus } from '@prisma/client';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

const weekdayMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export type ParsedDateResult =
  | { ok: true; value: Date }
  | { ok: false; error: string };

export function parseHumanDate(input: string): ParsedDateResult {
  const normalized = input.trim().toLowerCase();

  if (!normalized) {
    return { ok: false, error: 'Please enter a due date or type skip.' };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const parsed = dayjs(normalized, 'YYYY-MM-DD', true);
    if (!parsed.isValid()) {
      return { ok: false, error: 'That date is not valid. Try 2026-06-15.' };
    }

    return { ok: true, value: parsed.startOf('day').toDate() };
  }

  if (normalized === 'tomorrow') {
    return { ok: true, value: dayjs().add(1, 'day').startOf('day').toDate() };
  }

  const inDaysMatch = normalized.match(/^in\s+(\d+)\s+days?$/);
  if (inDaysMatch) {
    const days = Number(inDaysMatch[1]);
    if (days < 0) {
      return { ok: false, error: 'Use a positive number of days.' };
    }

    return { ok: true, value: dayjs().add(days, 'day').startOf('day').toDate() };
  }

  const nextWeekdayMatch = normalized.match(/^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  if (nextWeekdayMatch) {
    const weekdayName = nextWeekdayMatch[1] as keyof typeof weekdayMap;
    const target = weekdayMap[weekdayName];
    if (target === undefined) {
      return {
        ok: false,
        error: 'I could not understand that weekday. Try next monday or a full date like 2026-06-15.',
      };
    }

    const today = dayjs();
    let delta = (target - today.day() + 7) % 7;
    if (delta === 0) {
      delta = 7;
    }

    return { ok: true, value: today.add(delta, 'day').startOf('day').toDate() };
  }

  return {
    ok: false,
    error: 'I could not understand that date. Try 2026-06-15, tomorrow, next monday, or in 3 days.',
  };
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) {
    return 'No due date';
  }

  return dayjs(date).format('ddd, D MMM YYYY');
}

export function isOverdue(task: { dueDate: Date | null; status: TaskStatus }): boolean {
  if (!task.dueDate || task.status === TaskStatus.DONE) {
    return false;
  }

  return dayjs(task.dueDate).endOf('day').isBefore(dayjs());
}

export function isToday(date: Date | null | undefined): boolean {
  if (!date) {
    return false;
  }

  const value = dayjs(date);
  return value.isAfter(dayjs().startOf('day')) && value.isBefore(dayjs().endOf('day'));
}
