/*
  Warnings:

  - The values [MOBILE,INSTAGRAM] on the enum `ContactType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `label` on the `contact` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ContactType_new" AS ENUM ('EMAIL', 'PHONE', 'WEBSITE', 'TWITTER', 'LINKEDIN', 'GITHUB', 'DISCORD', 'LINK');
ALTER TABLE "public"."contact" ALTER COLUMN "type" TYPE "public"."ContactType_new" USING ("type"::text::"public"."ContactType_new");
ALTER TYPE "public"."ContactType" RENAME TO "ContactType_old";
ALTER TYPE "public"."ContactType_new" RENAME TO "ContactType";
DROP TYPE "public"."ContactType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."contact" DROP COLUMN "label";
