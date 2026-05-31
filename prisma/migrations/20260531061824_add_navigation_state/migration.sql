-- CreateTable
CREATE TABLE "NavigationState" (
    "id" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "currentView" TEXT NOT NULL,
    "history" JSONB,
    "itemMap" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NavigationState_telegramUserId_key" ON "NavigationState"("telegramUserId");

-- CreateIndex
CREATE INDEX "NavigationState_chatId_idx" ON "NavigationState"("chatId");
