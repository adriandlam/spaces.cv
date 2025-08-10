import ProfileModalClient from "@/components/profile/profile-modal-client";
import { getProfileModalData } from "@/lib/profile";

export default async function ProfileModal() {
	const profileData = await getProfileModalData();

	if (!profileData) {
		return <div>Unable to load profile data</div>;
	}

	return <ProfileModalClient {...profileData} />;
}
