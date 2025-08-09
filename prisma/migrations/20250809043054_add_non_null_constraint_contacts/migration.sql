/*
  Warnings:

  - Made the column `userId` on table `contact` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."contact" DROP CONSTRAINT "contact_userId_fkey";

-- AlterTable
ALTER TABLE "public"."contact" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."contact" ADD CONSTRAINT "contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
