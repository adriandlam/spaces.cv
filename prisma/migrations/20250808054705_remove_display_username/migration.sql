/*
  Warnings:

  - You are about to drop the column `displayUsername` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "displayUsername";

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "public"."user"("username");
