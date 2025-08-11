import {
	inferAdditionalFields,
	magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL:
		process.env.NODE_ENV === "development"
			? "http://localhost:3000"
			: `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
	plugins: [magicLinkClient(), inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
