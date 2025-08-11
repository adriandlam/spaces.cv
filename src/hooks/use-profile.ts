"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export function useProfile() {
	const {
		isLoading: isLoadingGeneral,
		data: generalData,
		mutate: mutateGeneral,
	} = useSWR("/api/me/profile/general", fetcher);
	const {
		isLoading: isLoadingProjects,
		data: projectsData,
		mutate: mutateProjects,
	} = useSWR("/api/me/profile/projects", fetcher);
	const {
		isLoading: isLoadingEducation,
		data: educationData,
		mutate: mutateEducation,
	} = useSWR("/api/me/profile/education", fetcher);
	const {
		isLoading: isLoadingContacts,
		data: contactsData,
		mutate: mutateContacts,
	} = useSWR("/api/me/profile/contacts", fetcher);
	const {
		isLoading: isLoadingprofileOrder,
		data: profileOrderData,
		mutate: mutateprofileOrder,
	} = useSWR("/api/me/profile/section-order", fetcher, {
		fallbackData: {
			profileOrder: ["experience", "education", "projects", "contacts"],
		},
		revalidateOnFocus: false,
		dedupingInterval: 60000, // 1 minute
	});

	return {
		user: generalData?.user,
		projects: projectsData?.projects || [],
		education: educationData?.education || [],
		contacts: contactsData?.contacts || [],
		profileOrder: profileOrderData?.profileOrder || [
			"experience",
			"education",
			"projects",
			"contacts",
		],
		mutateGeneral,
		mutateProjects,
		mutateEducation,
		mutateContacts,
		mutateprofileOrder,
		isLoadingprofileOrder,
		isLoadingGeneral,
		isLoadingProjects,
		isLoadingEducation,
		isLoadingContacts,
	};
}
