/*
  Warnings:

  - You are about to drop the `profile_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."profile_settings" DROP CONSTRAINT "profile_settings_userId_fkey";

-- DropTable
DROP TABLE "public"."profile_settings";

-- CreateTable
CREATE TABLE "public"."profile_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "googleIndexing" BOOLEAN NOT NULL DEFAULT true,
    "fontFamily" "public"."FontFamily" NOT NULL DEFAULT 'SANS',
    "theme" "public"."Theme" NOT NULL DEFAULT 'DARK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_preferences_userId_key" ON "public"."profile_preferences"("userId");

-- AddForeignKey
ALTER TABLE "public"."profile_preferences" ADD CONSTRAINT "profile_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
