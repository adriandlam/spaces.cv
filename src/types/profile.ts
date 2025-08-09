import type { z } from "zod";
import type {
	educationFormSchema,
	generalFormSchema,
	profileFormSchema,
	projectFormSchema,
} from "@/lib/validations/profile";

export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type GeneralFormData = z.infer<typeof generalFormSchema>;
export type ProjectFormData = z.infer<typeof projectFormSchema>;
export type EducationFormData = z.infer<typeof educationFormSchema>;
