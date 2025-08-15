import Nav from "@/components/nav";
import { headers } from "next/headers";
import { cache } from "react";
import { getPublicProfile } from "@/lib/profile";
import type { Metadata } from "next";

export default async function ProfileLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{
		username: string;
	}>;
}) {
	const { username } = await params;

	const headersList = await headers();
	const referer = headersList.get("referer");

	const isDirectAccess = referer?.includes(username);

	return (
		<div className="flex">
			{!isDirectAccess && referer && <Nav />}
			<div className="max-w-2xl w-full mx-auto py-18">{children}</div>
		</div>
	);
}

// Cache the profile fetch to avoid duplicate calls between generateMetadata and page component
export const getCachedPublicProfile = cache(async (username: string) => {
	return await getPublicProfile(username);
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ username: string }>;
}): Promise<Metadata> {
	const { username } = await params;

	const profile = await getCachedPublicProfile(username);

	if (!profile) {
		return {
			title: "Profile Not Found",
			robots: { index: false, follow: false },
		};
	}

	return {
		title: profile.name,
		description:
			profile.about ||
			profile.title ||
			`View ${profile.name}'s professional profile`,
		robots: {
			index: !profile.profilePreferences.hidden,
			follow: !profile.profilePreferences.hidden,
		},
	};
}
