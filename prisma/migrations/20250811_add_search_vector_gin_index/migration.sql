-- CreateIndex for searchVector GIN index
CREATE INDEX IF NOT EXISTS "user_searchVector_idx" ON "public"."user" USING GIN ("searchVector");

-- Update existing users' searchVector from their searchableText
UPDATE "public"."user" 
SET "searchVector" = to_tsvector('english', "searchableText")
WHERE "searchableText" IS NOT NULL AND "searchVector" IS NULL;