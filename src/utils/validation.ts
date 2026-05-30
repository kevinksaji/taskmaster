import { z } from 'zod';

export const epicNameSchema = z.string().trim().min(1, 'Epic name cannot be blank.').max(120, 'Epic name must be 120 characters or fewer.');
export const taskNameSchema = z.string().trim().min(1, 'Task name cannot be blank.').max(120, 'Task name must be 120 characters or fewer.');
