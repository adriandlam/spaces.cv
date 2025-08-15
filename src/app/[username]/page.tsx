import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ProfilePage from "@/components/profile/profile-page";
import { auth } from "@/lib/auth";
import { getCachedPublicProfile } from "./layout";

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
