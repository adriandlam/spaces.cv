import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { ProfileModalData, PublicProfile } from "@/types/profile";

export async function getPublicProfile(
	username: string,
): Promise<PublicProfile | null> {
	const user = await prisma.user.findUnique({
		where: {
			username: username.toLowerCase(),
		},
		select: {
			id: true,
			name: true,
			username: true,
			image: true,
			title: true,
			about: true,
			location: true,
			website: true,
			projects: {
				orderBy: { createdAt: "asc" },
			},
			education: {
				where: {
					hidden: false,
				},
				orderBy: { from: "asc" },
			},
			workExperiences: {
				orderBy: { from: "asc" },
			},
			profileOrder: true,
			contacts: {
				where: {
					hidden: false,
				},
				orderBy: { createdAt: "asc" },
			},
			profilePreferences: true,
		},
	});

	if (!user) return null;

	// Ensure profileOrder has a default value if empty
	const profileOrder =
		user.profileOrder.length > 0
			? user.profileOrder
			: ["experience", "education", "projects", "contacts"];

	return {
		...user,
		profileOrder,
	} as PublicProfile;
}

export async function getProfileModalData(): Promise<ProfileModalData | null> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return null;
		}

		const data = await prisma.user.findUnique({
			where: {
				id: session.user.id,
			},
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				title: true,
				about: true,
				location: true,
				website: true,
				image: true,
				projects: {
					orderBy: { createdAt: "asc" },
				},
				education: {
					orderBy: { from: "asc" },
				},
				workExperiences: {
					orderBy: { from: "asc" },
				},
				profileOrder: true,
				contacts: {
					orderBy: { createdAt: "asc" },
				},
				profilePreferences: true,
			},
		});

		if (!data || !data.profilePreferences) return null;

		return data as ProfileModalData;
	} catch (error) {
		console.error("Error fetching profile data:", error);
		return null;
	}
}
