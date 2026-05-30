/*
  Warnings:

  - You are about to drop the column `description` on the `Epic` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Epic" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "description";
