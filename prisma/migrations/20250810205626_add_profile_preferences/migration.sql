-- CreateEnum
CREATE TYPE "public"."FontFamily" AS ENUM ('SANS', 'SERIF', 'MONO');

-- CreateEnum
CREATE TYPE "public"."Theme" AS ENUM ('LIGHT', 'DARK');

-- CreateTable
CREATE TABLE "public"."profile_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "googleIndexing" BOOLEAN NOT NULL DEFAULT true,
    "fontFamily" "public"."FontFamily" NOT NULL DEFAULT 'SANS',
    "theme" "public"."Theme" NOT NULL DEFAULT 'DARK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_settings_userId_key" ON "public"."profile_settings"("userId");

-- AddForeignKey
ALTER TABLE "public"."profile_settings" ADD CONSTRAINT "profile_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
