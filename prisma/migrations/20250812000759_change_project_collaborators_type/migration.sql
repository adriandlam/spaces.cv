/*
  Warnings:

  - The `collaborators` column on the `project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "public"."user_searchVector_idx";

-- AlterTable
ALTER TABLE "public"."project" DROP COLUMN "collaborators",
ADD COLUMN     "collaborators" TEXT[] DEFAULT ARRAY[]::TEXT[];
