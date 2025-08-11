-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "embedding" vector(1536),
ADD COLUMN     "embeddingModel" TEXT DEFAULT 'openai/text-embedding-3-small',
ADD COLUMN     "embeddingUpdate" TIMESTAMP(3),
ADD COLUMN     "embeddingsStale" BOOLEAN NOT NULL DEFAULT false;
