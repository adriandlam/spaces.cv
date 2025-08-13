import Nav from "@/components/nav";
import { headers } from "next/headers";

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
