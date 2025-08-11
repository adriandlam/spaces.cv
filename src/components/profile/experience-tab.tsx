"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Pencil, Plus, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import type { WorkExperience } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { experienceSchema } from "@/lib/validations/profile";
import type { ExperienceFormData } from "@/types/profile";
import { ScrollArea } from "../ui/scroll-area";

interface ExperienceTabProps {
	experiences: WorkExperience[];
	showExperienceForm: boolean;
	onShowExperienceForm: (show: boolean) => void;
	onSubmit: (data: ExperienceFormData) => Promise<void>;
	isSubmitting: boolean;
	onExperienceUpdate?: (experiences: WorkExperience[]) => void;
}

export default function ExperienceTab({
	experiences,
	showExperienceForm,
	onShowExperienceForm,
	onSubmit,
	isSubmitting,
	onExperienceUpdate,
}: ExperienceTabProps) {
	const experienceForm = useForm<ExperienceFormData>({
		resolver: zodResolver(experienceSchema),
		mode: "onChange",
		defaultValues: {
			title: "",
			company: "",
			from: "",
			to: "",
			location: "",
			description: "",
			skills: "",
		},
	});

	const handleCancel = () => {
		onShowExperienceForm(false);
		experienceForm.reset();
	};

	const hideExperience = async (id: string) => {
		const exp = experiences.find((e) => e.id === id);
		if (!exp) return;

		try {
			const updatedExperiences = experiences.map((e) =>
				e.id === id ? { ...e, hidden: !e.hidden } : e,
			);

			// Update parent state
			if (onExperienceUpdate) {
				onExperienceUpdate(updatedExperiences);
			}

			const response = await fetch("/api/me/profile/experience", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id,
					hidden: !exp.hidden,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update experience visibility");
			}
		} catch (_) {
			// Revert on error and revalidate
			if (onExperienceUpdate) {
				onExperienceUpdate(experiences);
			}
		}
	};

	const deleteExperience = async (id: string) => {
		try {
			const updatedExperiences = experiences.filter((e) => e.id !== id);

			// Update parent state
			if (onExperienceUpdate) {
				onExperienceUpdate(updatedExperiences);
			}

			const response = await fetch("/api/me/profile/experience", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id }),
			});

			if (!response.ok) {
				throw new Error("Failed to delete experience");
			}
		} catch (_) {
			// Revert on error and revalidate
			if (onExperienceUpdate) {
				onExperienceUpdate(experiences);
			}
		}
	};

	const formatDateRange = (from: string, to: string | null) => {
		if (!to || to === "Present") {
			return `${from} — Present`;
		}
		return `${from} — ${to}`;
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-1">
				<div>
					<h3 className="text-xl">Work Experience</h3>
					<p className="text-sm text-muted-foreground">
						Add your professional experience and career history
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onShowExperienceForm(true)}
					disabled={showExperienceForm}
				>
					<Plus />
					Add Experience
				</Button>
			</div>

			{/* Display existing experiences */}
			<ScrollArea className="h-[65dvh] mt-8">
				{experiences.length > 0 && (
					<div className="space-y-3">
						{experiences.map((exp) => (
							<>
								<div
									key={exp.id}
									className={cn(
										"flex items-start gap-10 transition-all duration-200 ease-out",
										exp.hidden && "opacity-50",
									)}
								>
									<div className="w-40">
										<span className="text-muted-foreground text-sm opacity-75 mt-1 text-nowrap">
											{formatDateRange(exp.from, exp.to)}
										</span>
										{exp.location && (
											<div className="text-muted-foreground opacity-75 text-sm">
												{exp.location}
											</div>
										)}
									</div>
									<div className="flex items-center justify-between w-full">
										<div className="flex flex-col">
											<div>{exp.company}</div>
											<p className="text-muted-foreground opacity-75 text-sm">
												{exp.title}
											</p>
											{exp.description && (
												<p className="text-sm mt-2 text-muted-foreground">
													{exp.description}
												</p>
											)}
											{exp.skills && exp.skills.length > 0 && (
												<div className="flex flex-wrap gap-1.5 mt-2">
													{exp.skills.map((skill, index) => (
														<span
															key={index}
															className="text-xs bg-secondary/50 px-2 py-1 rounded-md"
														>
															{skill}
														</span>
													))}
												</div>
											)}
										</div>
										<div className="flex items-center gap-5">
											<button
												type="button"
												className="flex items-center gap-1.5 cursor-pointer text-[13px] opacity-50 hover:opacity-100 transition ease-out duration-100"
											>
												<Pencil className="size-3" />
												Edit
											</button>
											<button
												type="button"
												className="flex items-center gap-1.5 cursor-pointer text-[13px] opacity-50 hover:opacity-100 transition ease-out duration-100"
												onClick={() => hideExperience(exp.id)}
											>
												{exp.hidden ? (
													<>
														<Eye className="size-3" />
														Show
													</>
												) : (
													<>
														<EyeOff className="size-3" />
														Hide
													</>
												)}
											</button>
											<button
												type="button"
												className="flex items-center gap-1 cursor-pointer text-[13px] opacity-50 hover:opacity-100 hover:text-destructive transition ease-out duration-100"
												onClick={() => deleteExperience(exp.id)}
											>
												<Trash className="size-3" />
												Delete
											</button>
										</div>
									</div>
								</div>
								<Separator className="my-5" />
							</>
						))}
					</div>
				)}

				<AnimatePresence>
					{showExperienceForm && (
						<motion.div
							key="experience-form"
							initial={{ opacity: 0, y: 5, filter: "blur(8px)" }}
							animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							exit={{ opacity: 0, y: 5, filter: "blur(8px)" }}
							transition={{
								duration: 0.2,
								ease: "easeOut",
							}}
							className="space-y-4"
						>
							<Form {...experienceForm}>
								<form
									id="experience-form"
									onSubmit={experienceForm.handleSubmit(onSubmit)}
									className="space-y-3"
								>
									<FormField
										control={experienceForm.control}
										name="title"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Job Title*</Label>
												<FormControl>
													<Input
														{...field}
														placeholder="Software Engineer"
														className={fieldState.error ? "border-red-500" : ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={experienceForm.control}
										name="company"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Company*</Label>
												<FormControl>
													<Input
														{...field}
														placeholder="Acme Inc."
														className={fieldState.error ? "border-red-500" : ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-2 gap-3">
										<FormField
											control={experienceForm.control}
											name="from"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">From*</Label>
													<FormControl>
														<Input
															{...field}
															placeholder={new Date().getFullYear().toString()}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={experienceForm.control}
											name="to"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">To</Label>
													<FormControl>
														<Input {...field} placeholder="Present" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={experienceForm.control}
										name="location"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Location</Label>
												<FormControl>
													<Input
														{...field}
														placeholder="San Francisco, CA"
														className={fieldState.error ? "border-red-500" : ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={experienceForm.control}
										name="description"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Description</Label>
												<FormControl>
													<Textarea
														{...field}
														placeholder="Describe your role, responsibilities, and achievements..."
														className={`resize-none ${
															fieldState.error ? "border-red-500" : ""
														}`}
														rows={3}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={experienceForm.control}
										name="skills"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Skills</Label>
												<FormControl>
													<Input
														{...field}
														placeholder="React, TypeScript, Node.js (comma-separated)"
														className={fieldState.error ? "border-red-500" : ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</form>
							</Form>
						</motion.div>
					)}
				</AnimatePresence>
			</ScrollArea>
		</div>
	);
}
