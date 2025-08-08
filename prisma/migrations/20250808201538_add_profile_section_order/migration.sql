-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "sectionOrder" TEXT[] DEFAULT ARRAY['experience', 'education', 'projects']::TEXT[];
