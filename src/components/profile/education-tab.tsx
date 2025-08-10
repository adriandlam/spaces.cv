"use client";

import { ExternalArrow } from "../icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
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
import { educationSchema } from "@/lib/validations/profile";
import type { EducationFormData } from "@/types/profile";
import { ScrollArea } from "../ui/scroll-area";
import type { Education } from "@/app/generated/prisma";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

interface EducationTabProps {
	education: Education[];
	showEducationForm: boolean;
	onShowEducationForm: (show: boolean) => void;
	onSubmit: (data: EducationFormData) => Promise<void>;
	isSubmitting: boolean;
}

export default function EducationTab({
	education,
	showEducationForm,
	onShowEducationForm,
	onSubmit,
	isSubmitting,
}: EducationTabProps) {
	const { mutateEducation } = useProfile();
	const educationForm = useForm<EducationFormData>({
		resolver: zodResolver(educationSchema),
		mode: "onChange",
		defaultValues: {
			from: "",
			to: "",
			degree: "",
			institution: "",
			location: "",
			url: "",
			description: "",
			classmates: "",
			fieldOfStudy: "",
			gpa: "",
			activities: "",
		},
	});

	const handleCancel = () => {
		onShowEducationForm(false);
		educationForm.reset();
	};

	const hideEducation = async (id: string) => {
		const edu = education.find((e) => e.id === id);
		if (!edu) return;

		try {
			// Optimistic update without revalidation
			mutateEducation(
				{
					education: education.map((e) =>
						e.id === id ? { ...e, hidden: !e.hidden } : e,
					),
				},
				false,
			);

			const response = await fetch("/api/profile/education", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id,
					hidden: !education.hidden,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update education visibility");
			}
		} catch (_) {
			// Revert on error and revalidate
			mutateEducation();
		}
	};

	const deleteEducation = async (id: string) => {
		try {
			// Optimistic update - remove education immediately
			mutateEducation(
				{
					education: education.filter((e) => e.id !== id),
				},
				false,
			);

			const response = await fetch("/api/profile/education", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id }),
			});

			if (!response.ok) {
				throw new Error("Failed to delete education");
			}
		} catch (_) {
			// Revert on error and revalidate
			mutateEducation();
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center mb-1">
				<h3 className="text-xl">Education</h3>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onShowEducationForm(true)}
					disabled={showEducationForm}
				>
					<Plus />
					Add Education
				</Button>
			</div>
			<Separator />

			{/* Display existing education */}
			<ScrollArea className="h-[65dvh]">
				{education.length > 0 && (
					<div className="space-y-3">
						{education.map((edu) => (
							<>
								<div
									key={edu.id}
									className={cn(
										"flex items-start gap-4",
										edu.hidden && "opacity-50",
									)}
								>
									<div className="w-40">
										<span className="text-muted-foreground text-sm opacity-75 mt-1">
											{edu.from} — {edu.to}
										</span>
										<div className="text-muted-foreground opacity-75 text-sm">
											{edu.location}
										</div>
									</div>
									<div className="flex items-center justify-between w-full">
										<div className="flex flex-col">
											<button
												type="button"
												className={cn(
													"hover:underline underline-offset-3 transition-all duration-200 ease-out",
													edu.hidden && "opacity-50",
												)}
											>
												<Link
													href={edu.url || ""}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-start"
												>
													{edu.institution}
													<ExternalArrow className="size-3 ml-0.5 mt-1" />
												</Link>
											</button>
											<p className="text-muted-foreground opacity-75 text-sm">
												{edu.fieldOfStudy}, {edu.degree}
											</p>
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
												onClick={() => hideEducation(edu.id)}
											>
												{edu.hidden ? (
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
												onClick={() => deleteEducation(edu.id)}
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
					{showEducationForm && (
						<motion.div
							key="education-form"
							initial={{ opacity: 0, y: 5, filter: "blur(8px)" }}
							animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							exit={{ opacity: 0, y: 5, filter: "blur(8px)" }}
							transition={{
								duration: 0.2,
								ease: "easeOut",
							}}
							className="space-y-4"
						>
							<Form {...educationForm}>
								<form
									id="education-form"
									onSubmit={educationForm.handleSubmit(onSubmit)}
									className="space-y-3"
								>
									<div className="grid grid-cols-2 gap-3">
										<FormField
											control={educationForm.control}
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
											control={educationForm.control}
											name="to"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">To</Label>
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
									</div>

									<FormField
										control={educationForm.control}
										name="institution"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Institution*</Label>
												<FormControl>
													<Input
														{...field}
														placeholder="Stanford University"
														className={fieldState.error ? "border-red-500" : ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-2 gap-3">
										<FormField
											control={educationForm.control}
											name="degree"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">
														Degree/Certification*
													</Label>
													<FormControl>
														<Input
															{...field}
															placeholder="Bachelor of Science"
															className={
																fieldState.error ? "border-red-500" : ""
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={educationForm.control}
											name="fieldOfStudy"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">Field of Study</Label>
													<FormControl>
														<Input
															{...field}
															placeholder="Computer Science"
															className={
																fieldState.error ? "border-red-500" : ""
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<FormField
											control={educationForm.control}
											name="location"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">Location</Label>
													<FormControl>
														<Input
															{...field}
															placeholder="Stanford, CA"
															className={
																fieldState.error ? "border-red-500" : ""
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={educationForm.control}
											name="gpa"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">GPA</Label>
													<FormControl>
														<Input
															{...field}
															placeholder="3.8"
															className={
																fieldState.error ? "border-red-500" : ""
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={educationForm.control}
										name="url"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">URL</Label>
												<FormControl>
													<Input
														{...field}
														placeholder="https://stanford.edu"
														className={fieldState.error ? "border-red-500" : ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={educationForm.control}
										name="description"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Description</Label>
												<FormControl>
													<Textarea
														{...field}
														placeholder="Relevant coursework, achievements, etc..."
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
										control={educationForm.control}
										name="classmates"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Classmates</Label>
												<FormControl>
													<Input
														{...field}
														placeholder="John Doe, Jane Smith"
														className={fieldState.error ? "border-red-500" : ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="flex justify-end">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={handleCancel}
											disabled={isSubmitting}
										>
											Cancel
										</Button>
									</div>
								</form>
							</Form>
						</motion.div>
					)}
				</AnimatePresence>
			</ScrollArea>
		</div>
	);
}
