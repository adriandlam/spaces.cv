/*
  Warnings:

  - The values [CAL] on the enum `ContactType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ContactType_new" AS ENUM ('EMAIL', 'PHONE', 'MOBILE', 'WEBSITE', 'TWITTER', 'LINKEDIN', 'GITHUB', 'INSTAGRAM', 'DISCORD', 'LINK');
ALTER TABLE "public"."contact" ALTER COLUMN "type" TYPE "public"."ContactType_new" USING ("type"::text::"public"."ContactType_new");
ALTER TYPE "public"."ContactType" RENAME TO "ContactType_old";
ALTER TYPE "public"."ContactType_new" RENAME TO "ContactType";
DROP TYPE "public"."ContactType_old";
COMMIT;
