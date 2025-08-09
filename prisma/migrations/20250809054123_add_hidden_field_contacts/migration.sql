/*
  Warnings:

  - The `skills` column on the `work_experience` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."contact" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."project" ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."work_experience" DROP COLUMN "skills",
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
