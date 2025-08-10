import ProfileModalClient from "@/components/profile/profile-modal-client";
import { getProfileModalData } from "@/lib/profile";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ProfileModal() {
	const profileData = await getProfileModalData();
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!profileData || !session) {
		notFound();
	}

	return <ProfileModalClient user={session.user} {...profileData} />;
}
