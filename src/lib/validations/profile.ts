import z from "zod";
import { ContactType } from "@/app/generated/prisma";

export const profileSchema = z.object({
	name: z
		.string()
		.min(1, "Display name is required")
		.min(2, "Display name must be at least 2 characters")
		.max(50, "Display name must be less than 50 characters"),
	username: z
		.string()
		.min(1, "Username is required")
		.min(3, "Username must be at least 3 characters")
		.max(32, "Username must be less than 32 characters")
		.regex(
			/^[a-zA-Z0-9_]+$/,
			"Username can only contain letters, numbers, and underscores",
		)
		.regex(/^[a-zA-Z]/, "Username must start with a letter"),
});

export const projectSchema = z.object({
	title: z
		.string()
		.min(1, "Project title is required")
		.max(100, "Title must be less than 100 characters"),
	from: z
		.string()
		.min(1, "Start date is required")
		.regex(/^\d{4}$/, "Please enter a valid 4-digit year"),
	to: z
		.string()
		.regex(
			/^(\d{4}|Present)$/,
			"Please enter a valid 4-digit year or 'Present'",
		)
		.optional()
		.or(z.literal("")),
	description: z
		.string()
		.min(1, "Description is required")
		.max(500, "Description must be less than 500 characters"),
	company: z
		.string()
		.max(100, "Company name must be less than 100 characters")
		.optional()
		.or(z.literal("")),
	link: z
		.string()
		.refine((val) => val === "" || /^https:\/\//.test(val), {
			message: "Please enter a valid URL starting with https://",
		})
		.optional()
		.or(z.literal("")),
	collaborators: z
		.string()
		.max(200, "Collaborators must be less than 200 characters")
		.optional()
		.or(z.literal("")),
});

export const generalSchema = z.object({
	name: z
		.string()
		.min(1, "Display name is required")
		.min(2, "Display name must be at least 2 characters")
		.max(50, "Display name must be less than 50 characters"),
	username: z
		.string()
		.min(1, "Username is required")
		.min(3, "Username must be at least 3 characters")
		.max(32, "Username must be less than 32 characters")
		.regex(
			/^[a-zA-Z0-9_]+$/,
			"Username can only contain letters, numbers, and underscores",
		)
		.regex(/^[a-zA-Z]/, "Username must start with a letter"),
	title: z
		.string()
		.max(100, "Title must be less than 100 characters")
		.optional()
		.or(z.literal("")),
	about: z
		.string()
		.refine(
			(val) => {
				if (!val || val.trim() === "") return true;
				const words = val
					.trim()
					.split(/\s+/)
					.filter((word) => word.length > 0);
				return words.length <= 200;
			},
			{
				message: "About section must be less than 200 words",
			},
		)
		.optional()
		.or(z.literal("")),
	location: z
		.string()
		.max(100, "Location must be less than 100 characters")
		.optional()
		.or(z.literal("")),
	website: z
		.string()
		.refine((val) => val === "" || /^https:\/\//.test(val), {
			message: "Please enter a valid URL starting with https://",
		})
		.optional()
		.or(z.literal("")),
});

export const educationSchema = z.object({
	from: z
		.string()
		.min(1, "Start date is required")
		.regex(/^\d{4}$/, "Please enter a valid 4-digit year"),
	to: z
		.string()
		.regex(
			/^(\d{4}|Present)$/,
			"Please enter a valid 4-digit year or 'Present'",
		),
	degree: z
		.string()
		.min(1, "Degree/Certification is required")
		.max(100, "Degree must be less than 100 characters"),
	institution: z
		.string()
		.min(1, "Institution is required")
		.max(100, "Institution name must be less than 100 characters"),
	location: z
		.string()
		.max(100, "Location must be less than 100 characters")
		.optional()
		.or(z.literal("")),
	url: z
		.string()
		.refine((val) => val === "" || /^https?:\/\//.test(val), {
			message: "Please enter a valid URL starting with http:// or https://",
		})
		.optional()
		.or(z.literal("")),
	description: z
		.string()
		.max(500, "Description must be less than 500 characters")
		.optional()
		.or(z.literal("")),
	fieldOfStudy: z
		.string()
		.max(100, "Field of study must be less than 100 characters")
		.optional()
		.or(z.literal("")),
	gpa: z
		.string()
		.refine((val) => val === "" || /^\d{1}(\.\d{1,2})?$/.test(val), {
			message: "Please enter a valid GPA (e.g., 3.8)",
		})
		.optional()
		.or(z.literal("")),
	activities: z
		.string()
		.max(200, "Activities must be less than 200 characters")
		.optional()
		.or(z.literal("")),
});

export const experienceSchema = z.object({
	title: z
		.string()
		.min(1, "Job title is required")
		.max(100, "Title must be less than 100 characters"),
	company: z
		.string()
		.min(1, "Company is required")
		.max(100, "Company name must be less than 100 characters"),
	from: z
		.string()
		.min(1, "Start date is required")
		.regex(/^\d{4}$/, "Please enter a valid 4-digit year"),
	to: z
		.string()
		.regex(
			/^(\d{4}|Present)$/,
			"Please enter a valid 4-digit year or 'Present'",
		)
		.optional()
		.or(z.literal("")),
	location: z
		.string()
		.max(100, "Location must be less than 100 characters")
		.optional()
		.or(z.literal("")),
	description: z
		.string()
		.max(500, "Description must be less than 500 characters")
		.optional()
		.or(z.literal("")),
	skills: z
		.string()
		.max(200, "Skills must be less than 200 characters")
		.optional()
		.or(z.literal("")),
});

export const contactSchema = z.object({
	type: ContactType,
	value: z
		.string()
		.min(1, "Value is required")
		.max(200, "Value must be less than 200 characters"),
});

// Export Form schemas as aliases for compatibility
export const profileFormSchema = profileSchema;
export const projectFormSchema = projectSchema;
export const generalFormSchema = generalSchema;
export const educationFormSchema = educationSchema;
export const experienceFormSchema = experienceSchema;
export const contactFormSchema = contactSchema;
