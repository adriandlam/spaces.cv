-- AlterTable
ALTER TABLE "project" ADD COLUMN "from" TEXT;
ALTER TABLE "project" ADD COLUMN "to" TEXT;

-- Update existing rows to use year as from value
UPDATE "project" SET "from" = "year" WHERE "from" IS NULL;

-- Make from required after setting values
ALTER TABLE "project" ALTER COLUMN "from" SET NOT NULL;

-- Drop the old year column
ALTER TABLE "project" DROP COLUMN "year";