import ProfilePage from "@/components/profile/profile-page";

export default async function ProfilePageWrapper({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;

	return <ProfilePage username={username} />;
}
