import ProfileModalClient from "@/components/profile/profile-modal-client";
import { getProfileModalData } from "@/lib/profile";
import { notFound } from "next/navigation";

export default async function ProfileModal() {
	const profileData = await getProfileModalData();

	if (!profileData) {
		notFound();
	}

	return <ProfileModalClient {...profileData} />;
}
