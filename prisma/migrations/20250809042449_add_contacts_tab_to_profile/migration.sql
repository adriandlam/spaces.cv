-- CreateEnum
CREATE TYPE "public"."ContactType" AS ENUM ('EMAIL', 'PHONE', 'MOBILE', 'WEBSITE', 'TWITTER', 'LINKEDIN', 'GITHUB', 'INSTAGRAM', 'DISCORD', 'LINK', 'CAL');

-- AlterTable
ALTER TABLE "public"."education" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."user" ALTER COLUMN "sectionOrder" SET DEFAULT ARRAY['experience', 'education', 'projects', 'contacts']::TEXT[];

-- CreateTable
CREATE TABLE "public"."contact" (
    "id" TEXT NOT NULL,
    "type" "public"."ContactType" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."contact" ADD CONSTRAINT "contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
