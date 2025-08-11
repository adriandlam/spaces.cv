-- Enable pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "searchVector" tsvector,
ADD COLUMN     "searchVectorStale" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "searchVectorUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "searchableText" TEXT,
ALTER COLUMN "embeddingsStale" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "user_searchableText_idx" ON "public"."user" USING GIN ("searchableText" gin_trgm_ops);
CREATE INDEX "user_searchVector_idx" ON "public"."user" USING GIN ("searchVector");

-- Create trigger to auto-update search_vector when searchable_text changes
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" := to_tsvector('english', NEW."searchableText");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_search_vector
  BEFORE INSERT OR UPDATE OF "searchableText" ON "public"."user"
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();


-- Update existing users' searchVector from their searchableText
UPDATE "public"."user" 
SET "searchVector" = to_tsvector('english', "searchableText")
WHERE "searchableText" IS NOT NULL AND "searchVector" IS NULL;