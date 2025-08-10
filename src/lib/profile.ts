import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import type { PublicProfile, ProfileModalData } from "@/types/profile";

export async function getPublicProfile(
  username: string
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
      sectionOrder: true,
      contacts: {
        where: {
          hidden: false,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  
  if (!user) return null;
  
  // Ensure sectionOrder has a default value if empty
  const sectionOrder = user.sectionOrder.length > 0 
    ? user.sectionOrder 
    : ["experience", "education", "projects", "contacts"];
  
  return {
    ...user,
    sectionOrder,
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
        sectionOrder: true,
        contacts: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!data) return null;
    
    // Ensure sectionOrder has a default value if empty
    const sectionOrder = data.sectionOrder.length > 0 
      ? data.sectionOrder 
      : ["experience", "education", "projects", "contacts"];
    
    return {
      ...data,
      sectionOrder,
    };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return null;
  }
}
