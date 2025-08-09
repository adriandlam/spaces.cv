/*
  Warnings:

  - Made the column `href` on table `contact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."contact" ALTER COLUMN "href" SET NOT NULL;
