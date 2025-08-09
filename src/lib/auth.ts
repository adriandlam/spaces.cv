import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, username } from "better-auth/plugins";
import prisma from "./prisma";
import resend from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
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
      sendMagicLink: async ({ email: _email, token: _token, url }) => {
        resend.emails.send({
          from: "Acme <onboarding@resend.dev>",
          to: "delivered@resend.dev",
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
      sectionOrder: {
        type: "string[]",
        defaultValue: [],
        input: true,
      },
    },
  },
});
