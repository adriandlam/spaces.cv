import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { embed } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("mode") || "default";
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (mode === "ai") {
      // TODO: Implement actual AI features with LLM
      // - Natural language query understanding
      // - Conversational responses
      // - Insights about results

      const queryEmbedding = await embed({
        model: gateway.textEmbeddingModel(
          process.env.EMBEDDING_MODEL ?? "openai/text-embedding-3-small"
        ),
        value: query,
      });

      // Hybrid search using rank fusion (RRF - Reciprocal Rank Fusion)
      const users = await prisma.$queryRaw`
      WITH semantic_search AS (
        SELECT 
          id, name, username, image, "customStatus",
          1 - (embedding <=> ${queryEmbedding.embedding}::vector) as semantic_score,
          ROW_NUMBER() OVER (ORDER BY embedding <=> ${queryEmbedding.embedding}::vector) as semantic_rank
        FROM "user"
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> ${queryEmbedding.embedding}::vector
        LIMIT 100
      ),
      fulltext_search AS (
        SELECT 
          id, name, username, image, "customStatus",
          ts_rank("searchVector", plainto_tsquery(${query})) as fulltext_score,
          ROW_NUMBER() OVER (ORDER BY ts_rank("searchVector", plainto_tsquery(${query})) DESC) as fulltext_rank
        FROM "user"
        WHERE "searchVector" @@ plainto_tsquery(${query})
        ORDER BY ts_rank("searchVector", plainto_tsquery(${query})) DESC
        LIMIT 100
      ),
      combined AS (
        SELECT DISTINCT
          COALESCE(s.id, f.id) as id,
          COALESCE(s.name, f.name) as name,
          COALESCE(s.username, f.username) as username,
          COALESCE(s.image, f.image) as image,
          COALESCE(s."customStatus", f."customStatus") as "customStatus",
          COALESCE(s.semantic_score, 0) as semantic_score,
          COALESCE(f.fulltext_score, 0) as fulltext_score,
          COALESCE(s.semantic_rank, 101) as semantic_rank,
          COALESCE(f.fulltext_rank, 101) as fulltext_rank,
          -- Reciprocal Rank Fusion with k=60 (common value)
          (1.0 / (60 + COALESCE(s.semantic_rank, 101))) + (1.0 / (60 + COALESCE(f.fulltext_rank, 101))) as rrf_score
        FROM semantic_search s
        FULL OUTER JOIN fulltext_search f ON s.id = f.id
      )
      SELECT id, name, username, image, "customStatus", semantic_score, fulltext_score, rrf_score
      FROM combined
      ORDER BY rrf_score DESC, semantic_score DESC, fulltext_score DESC
      LIMIT 50
    `;
      return NextResponse.json({ users });
    }

    // Debug: Check actual searchVector content
    const debugData = await prisma.$queryRaw`
      SELECT 
        name, username, "searchableText", "searchVector"::text as search_vector_text
      FROM "user"
      LIMIT 5
    `;

    console.log("Debug data:", debugData);
    console.log("Search query:", query);

    // Try the searchVector query with prefix matching
    let users = await prisma.$queryRaw`
      SELECT 
        id, name, username, image, "customStatus",
        ts_rank("searchVector", to_tsquery('english', ${
          query + ":*"
        })) as fulltext_score
      FROM "user"
      WHERE "searchVector" IS NOT NULL 
        AND "searchVector" @@ to_tsquery('english', ${query + ":*"})
      ORDER BY ts_rank("searchVector", to_tsquery('english', ${
        query + ":*"
      })) DESC
      LIMIT 50
    `;

    // If no results, fallback to searchableText ILIKE search
    if (!users || (Array.isArray(users) && users.length === 0)) {
      users = await prisma.$queryRaw`
        SELECT id, name, username, image, "customStatus"
        FROM "user"
        WHERE "searchableText" ILIKE ${`%${query}%`}
        ORDER BY LENGTH("searchableText") ASC
        LIMIT 50
      `;
    }

    return NextResponse.json({ users });
  } catch (error) {
    logger.error(
      {
        requestId,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      },
      "Search fetch failed"
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
