/*
  Warnings:

  - Added the required column `displayUsername` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "displayUsername" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;
