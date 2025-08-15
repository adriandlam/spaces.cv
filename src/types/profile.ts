import type { z } from "zod";
import type {
	Contact,
	Education,
	ProfilePreferences,
	Project,
	WorkExperience,
} from "@/app/generated/prisma";
import type { auth } from "@/lib/auth";
import type {
	contactFormSchema,
	educationFormSchema,
	experienceFormSchema,
	generalFormSchema,
	profileFormSchema,
	projectFormSchema,
} from "@/lib/validations/profile";

export type SessionUser = Awaited<ReturnType<typeof auth.api.getSession>>;

export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type GeneralFormData = z.infer<typeof generalFormSchema>;
export type ProjectFormData = z.infer<typeof projectFormSchema>;
export type EducationFormData = z.infer<typeof educationFormSchema>;
export type ExperienceFormData = z.infer<typeof experienceFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;

export interface PublicProfile {
	name: string;
	username: string; // Always has username for public profiles
	image: string | null;
	title: string | null;
	about: string | null;
	location: string | null;
	website: string | null;
	projects: Project[];
	education: Education[];
	workExperiences: WorkExperience[];
	profileOrder: string[];
	contacts: Contact[];
	customStatus: string | null;
	profilePreferences: ProfilePreferences;
	upvotes: number;
}

export interface ProfileModalData {
	name: string;
	onboarded: boolean;
	username: string | null; // May be null during onboarding
	email: string;
	image: string | null;
	title: string | null;
	about: string | null;
	location: string | null;
	website: string | null;
	projects: Project[];
	education: Education[];
	workExperiences: WorkExperience[];
	profileOrder: string[];
	contacts: Contact[];
	profilePreferences: ProfilePreferences;
}
