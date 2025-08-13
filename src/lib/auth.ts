import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, username } from "better-auth/plugins";
import { inngest } from "./inngest/client";
import prisma from "./prisma";
import resend from "./resend";
import { cookies } from "next/headers";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create default ProfilePreferences for new users
          await prisma.profilePreferences.create({
            data: {
              userId: user.id,
              hidden: false,
              googleIndexing: true,
              fontFamily: "SANS",
              theme: "DARK",
            },
          });

          const inviteReferrer = await getInviteReferrer();
          if (inviteReferrer) {
            const inviter = await prisma.user.update({
              where: { inviteCode: inviteReferrer },
              data: {
                invitedUsers: {
                  connect: {
                    id: user.id,
                  },
                },
              },
            });

            if (inviter && inviter.id !== user.id) {
              await prisma.user.update({
                where: { id: inviter.id },
                data: {
                  invitedById: inviter.id,
                  inviteCount: {
                    increment: 1,
                  },
                },
              });

              await clearInviteReferrer();
            }
          }
        },
      },
      update: {
        after: async (user) => {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              embeddingsStale: true,
              searchVectorStale: true,
            },
          });
          await inngest.send({
            name: "search/build",
            data: {
              userId: user.id,
            },
            ts: Date.now() + 30000,
          });
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    username(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        resend.emails.send({
          from: "Spaces <hello@spaces.cv>",
          to: email,
          subject: "Magic Link",
          html: `<p>Click <a href="${url}">here</a> to sign in</p>`,
        });
      },
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 30 * 60, // 30 minutes
    },
  },
  user: {
    additionalFields: {
      onboarded: {
        type: "boolean",
        defaultValue: false,
      },
      onboardedAt: {
        type: "date",
        defaultValue: null,
      },
      username: {
        type: "string",
        defaultValue: null,
        unique: true,
        required: false,
        input: true,
        // validate: (value: string) => {
        //   if (value.length < 3 || value.length > 32) {
        //     return "Username must be between 3 and 32 characters";
        //   }
        //   return true;
        // },
      },
      title: {
        type: "string",
        defaultValue: null,
        input: true,
      },
      location: {
        type: "string",
        defaultValue: null,
        input: true,
      },
      about: {
        type: "string",
        defaultValue: null,
        input: true,
      },
      website: {
        type: "string",
        defaultValue: null,
        input: true,
      },
      profileOrder: {
        type: "string[]",
        defaultValue: ["experience", "education", "projects", "contacts"],
        input: true,
      },
      customStatus: {
        type: "string",
        defaultValue: null,
        input: true,
      },
      upvotes: {
        type: "number",
        defaultValue: 1,
      },
      inviteCount: {
        type: "number",
        defaultValue: 0,
      },
      inviteCode: {
        type: "string",
        defaultValue: null,
      },
    },
  },
});

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

async function getInviteReferrer() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("invite_referrer")?.value;
  } catch {
    return null;
  }
}

async function clearInviteReferrer() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("invite_referrer");
  } catch {
    return;
  }
}
