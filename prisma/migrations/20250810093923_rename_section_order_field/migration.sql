/*
  Warnings:

  - You are about to drop the column `sectionOrder` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "sectionOrder",
ADD COLUMN     "profileOrder" TEXT[] DEFAULT ARRAY['experience', 'education', 'projects', 'contacts']::TEXT[];
