ALTER TABLE "NavigationState" RENAME TO "UserSession";

ALTER TABLE "UserSession" RENAME CONSTRAINT "NavigationState_pkey" TO "UserSession_pkey";
ALTER INDEX "NavigationState_telegramUserId_key" RENAME TO "UserSession_telegramUserId_key";
DROP INDEX IF EXISTS "NavigationState_chatId_idx";

ALTER TABLE "UserSession" RENAME COLUMN "currentView" TO "operationKind";
ALTER TABLE "UserSession" RENAME COLUMN "itemMap" TO "sessionData";

ALTER TABLE "UserSession"
ADD COLUMN "started" BOOLEAN NOT NULL DEFAULT false;

UPDATE "UserSession"
SET
  "started" = COALESCE(("sessionData"->>'started')::boolean, false),
  "sessionData" = CASE
    WHEN "sessionData" IS NULL THEN jsonb_build_object('taskNames', '[]'::jsonb)
    ELSE jsonb_build_object(
      'taskNames',
      COALESCE("sessionData"->'taskNames', '[]'::jsonb)
    )
  END;

ALTER TABLE "UserSession"
DROP COLUMN "chatId",
DROP COLUMN "history";

ALTER TABLE "UserSession"
ALTER COLUMN "operationKind" SET DEFAULT 'IDLE';