import { gateway } from "@ai-sdk/gateway";
import { embedMany } from "ai";
import prisma from "../prisma";
import { inngest } from "./client";

export const batchBuildSearchIndex = inngest.createFunction(
  {
    id: "batch-build-search-index",
    name: "Batch Build Search Index",
    description:
      "Builds the search index for all users with stale embeddings or search vector",
    batchEvents: {
      maxSize: 5,
      timeout: "30s",
    },
  },
  { event: "search/build" },
  //   { cron: process.env.NODE_ENV === "production" ? "0 * * * * " : "*/1 * * * *" }
  async ({ step, event, events, logger }) => {
    const userIds = [
      ...new Set(events.map((event) => event.data.userId).filter(Boolean)),
    ];

    const staleUsers = await step.run("fetch-stale-users", async () => {
      logger.debug({ userIds, eventId: event.id }, "Fetching stale users");

      return await prisma.user.findMany({
        take: process.env.NODE_ENV === "production" ? 50 : 10,
        where: {
          OR: [
            {
              id: {
                in: userIds,
              },
            },
            {
              embeddingsStale: true,
            },
            {
              searchVectorStale: true,
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          username: true,
          title: true,
          about: true,
          location: true,
          website: true,
          customStatus: true,
          embeddingsStale: true,
          searchVectorStale: true,
          projects: {
            where: { hidden: false },
            select: {
              title: true,
              description: true,
              company: true,
              collaborators: true,
              skills: true,
              from: true,
              to: true,
            },
          },
          education: {
            where: { hidden: false },
            select: {
              degree: true,
              institution: true,
              location: true,
              description: true,
              fieldOfStudy: true,
              activities: true,
              from: true,
              to: true,
            },
          },
          workExperiences: {
            where: { hidden: false },
            select: {
              title: true,
              company: true,
              location: true,
              description: true,
              skills: true,
              from: true,
              to: true,
            },
          },
          contacts: {
            where: { hidden: false },
            select: {
              type: true,
              value: true,
            },
          },
        },
      });
    });

    if (staleUsers.length === 0) {
      logger.warn({ eventId: event.id }, "No stale users found");
      return { message: "No stale users found" };
    }

    const formattedUsers = staleUsers.map((user) => {
      // Combine user data into searchable text - limited to discoverable info for default search
      const profileText = [
        // Basic discoverable info only
        user.name,
        user.username,
        user.title,
        user.location,
        user.customStatus,

        ...user.workExperiences.map(
          (exp) => `${exp.title || ""} ${exp.company || ""}`
        ),

        ...user.education.map(
          (edu) =>
            `${edu.degree || ""} ${edu.institution || ""} ${
              edu.fieldOfStudy || ""
            }`
        ),

        ...user.projects.map(
          (proj) => `${proj.title || ""} ${proj.company || ""}`
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .trim()
        .replace(/\s+/g, " ");

      return {
        id: user.id,
        text: profileText,
        embeddingsStale: user.embeddingsStale,
        searchVectorStale: user.searchVectorStale,
      };
    });

    const usersNeedingEmbeddings = formattedUsers.filter(
      (user) => user.embeddingsStale
    );

    if (usersNeedingEmbeddings.length > 0) {
      await step.run("generate-embeddings", async () => {
        logger.debug(
          { eventId: event.id, count: usersNeedingEmbeddings.length },
          "Processing embeddings"
        );

        const { embeddings } = await embedMany({
          model: gateway.textEmbeddingModel(
            process.env.EMBEDDING_MODEL ?? "openai/text-embedding-3-small"
          ),
          values: usersNeedingEmbeddings.map((user) => user.text),
        }).catch((error) => {
          logger.error(
            { eventId: event.id, error },
            "Failed to generate embeddings"
          );
          throw error;
        });

        await Promise.all(
          usersNeedingEmbeddings.map(async (user, index) => {
            const embedding = embeddings[index];
            return prisma.$executeRaw`
              UPDATE "user"
              SET embedding = ${embedding}::vector(1536),
                  "embeddingsStale" = false,
                  "embeddingUpdatedAt" = NOW()
              WHERE id = ${user.id}
            `.catch((error) => {
              logger.error(
                { eventId: event.id, userId: user.id, error },
                "Failed to update user embeddings"
              );
              throw error;
            });
          })
        );

        return {
          message: `Updated embeddings for ${usersNeedingEmbeddings.length} users`,
          userIds: usersNeedingEmbeddings.map((u) => u.id),
        };
      });
    }

    const usersNeedingSearchIndex = formattedUsers.filter(
      (user) => user.searchVectorStale
    );

    if (usersNeedingSearchIndex.length > 0) {
      await step.run("build-search-index", async () => {
        logger.debug(
          { eventId: event.id, count: usersNeedingSearchIndex.length },
          "Building GIN index"
        );

        await Promise.all(
          usersNeedingSearchIndex.map(async (user) => {
            return prisma.$executeRaw`
              UPDATE "user"
              SET "searchableText" = ${user.text}, "searchVector" = to_tsvector('english', ${user.text}), "searchVectorStale" = false, "searchVectorUpdatedAt" = NOW()
              WHERE id = ${user.id}
            `.catch((error) => {
              logger.error(
                { eventId: event.id, userId: user.id, error },
                "Failed to update user search index"
              );
              throw error;
            });
          })
        );

        return {
          message: `Updated search index for ${usersNeedingSearchIndex.length} users`,
          userIds: usersNeedingSearchIndex.map((u) => u.id),
        };
      });
    }

    return {
      message: "Batch search index build completed",
      embeddingsUpdated: usersNeedingEmbeddings.length,
      searchIndexUpdated: usersNeedingSearchIndex.length,
      totalProcessed: staleUsers.length,
    };
  }
);
