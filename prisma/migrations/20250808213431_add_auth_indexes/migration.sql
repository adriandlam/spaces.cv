/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token,userId]` on the table `session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier]` on the table `verification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."session_token_key";

-- CreateIndex
CREATE UNIQUE INDEX "account_userId_key" ON "public"."account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_userId_key" ON "public"."session"("token", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_key" ON "public"."verification"("identifier");
