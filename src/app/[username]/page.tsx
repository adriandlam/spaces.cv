import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import ProfilePage from "@/components/profile/profile-page";
import { auth } from "@/lib/auth";
import { getPublicProfile } from "@/lib/profile";
import type { Metadata } from "next";

// Cache the profile fetch to avoid duplicate calls between generateMetadata and page component
const getCachedPublicProfile = cache(async (username: string) => {
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

export default async function ProfilePageWrapper({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;

	const [profile, session] = await Promise.all([
		getCachedPublicProfile(username),
		auth.api
			.getSession({
				headers: await headers(),
			})
			.then((res) => res?.session),
	]);

	if (!profile || profile.profilePreferences.hidden) {
		notFound();
	}

	return <ProfilePage profile={profile} session={session ?? null} />;
}
