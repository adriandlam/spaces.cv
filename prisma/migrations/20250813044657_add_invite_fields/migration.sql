/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - The required column `inviteCode` was added to the `user` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "inviteCode" TEXT NOT NULL,
ADD COLUMN     "inviteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "invitedById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_inviteCode_key" ON "public"."user"("inviteCode");

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
