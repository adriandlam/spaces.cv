"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export function useProfile() {
  const { data: generalData, mutate: mutateGeneral } = useSWR(
    "/api/profile/general",
    fetcher
  );
  const { data: projectsData, mutate: mutateProjects } = useSWR(
    "/api/profile/projects",
    fetcher
  );
  const { data: educationData, mutate: mutateEducation } = useSWR(
    "/api/profile/education",
    fetcher
  );
  const {
    isLoading: isLoadingSectionOrder,
    data: sectionOrderData,
    mutate: mutateSectionOrder,
  } = useSWR("/api/profile/section-order", fetcher, {
    fallbackData: { sectionOrder: ["experience", "education", "projects"] },
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    user: generalData?.user,
    projects: projectsData?.projects || [],
    educations: educationData?.educations || [],
    sectionOrder: sectionOrderData?.sectionOrder || [
      "experience",
      "education",
      "projects",
    ],
    mutateGeneral,
    mutateProjects,
    mutateEducation,
    mutateSectionOrder,
    isLoadingSectionOrder,
  };
}
