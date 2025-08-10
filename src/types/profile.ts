import type { z } from "zod";
import type {
	Contact,
	Education,
	Project,
	WorkExperience,
} from "@/app/generated/prisma";
import type {
	contactFormSchema,
	educationFormSchema,
	generalFormSchema,
	profileFormSchema,
	projectFormSchema,
} from "@/lib/validations/profile";

export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type GeneralFormData = z.infer<typeof generalFormSchema>;
export type ProjectFormData = z.infer<typeof projectFormSchema>;
export type EducationFormData = z.infer<typeof educationFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;

export interface PublicProfile {
	id: string;
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
	sectionOrder: string[];
	contacts: Contact[];
	customStatus: string | null;
}

export interface ProfileModalData {
	id: string;
	name: string;
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
	sectionOrder: string[];
	contacts: Contact[];
}
