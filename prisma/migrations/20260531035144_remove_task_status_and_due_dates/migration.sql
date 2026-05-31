/*
  Warnings:

  - You are about to drop the column `dueDate` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Task` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Task_dueDate_idx";

-- DropIndex
DROP INDEX "Task_status_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "dueDate",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "TaskStatus";
