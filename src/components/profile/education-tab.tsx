"use client";

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
import { educationSchema } from "@/lib/validations/profile";
import type { EducationFormData } from "@/types/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { EyeOff, Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ScrollArea } from "../ui/scroll-area";

interface Education {
	id: string;
	from: string;
	to: string;
	degree: string;
	institution: string;
	location?: string;
	url?: string;
	description?: string;
	classmates?: string;
	fieldOfStudy?: string;
	gpa?: string;
	activities?: string;
	createdAt: Date;
}

interface EducationTabProps {
	educations: Education[];
	showEducationForm: boolean;
	onShowEducationForm: (show: boolean) => void;
	onSubmit: (data: EducationFormData) => Promise<void>;
	isSubmitting: boolean;
}

export function EducationTab({
	educations,
	showEducationForm,
	onShowEducationForm,
	onSubmit,
	isSubmitting,
}: EducationTabProps) {
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
				{educations.length > 0 && (
					<div className="space-y-3">
						{educations.map((education) => (
							<div key={education.id} className="grid grid-cols-4 gap-x-2">
								<span className="text-muted-foreground text-sm opacity-75 mt-0.5">
									{education.from} — {education.to}
								</span>
								<div className="col-span-3 flex justify-between">
									<Button
										asChild
										variant="link"
										className="p-0 text-base font-normal gap-1"
									>
										<Link
											href={education.url || ""}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-start"
										>
											{education.institution}
											<ExternalArrow className="size-3 mt-1" />
										</Link>
									</Button>
								</div>
								<div className="text-muted-foreground opacity-75 text-sm">
									{education.location}
								</div>
								<div className="col-span-3">
									<h4 className="text-muted-foreground text-sm">
										{education.fieldOfStudy}, {education.degree}
									</h4>
								</div>
								<div className="flex col-span-3 col-start-2 gap-6 mt-4 items-end">
									<button className="flex items-center gap-1.5 cursor-pointer text-[13px] opacity-50 hover:opacity-100 transition ease-out duration-100">
										<Pencil className="size-3" />
										Edit
									</button>
									<button className="flex items-center gap-1.5 cursor-pointer text-[13px] opacity-50 hover:opacity-100 transition ease-out duration-100">
										<EyeOff className="size-3" />
										Hide
									</button>
									<button className="flex items-center gap-1 cursor-pointer text-[13px] opacity-50 hover:opacity-100 hover:text-destructive transition ease-out duration-100">
										<Trash className="size-3" />
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{educations.length > 0 && showEducationForm && (
					<Separator className="my-10" />
				)}

				<AnimatePresence>
					{showEducationForm && (
						<motion.div
							key="education-form"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
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

const ExternalArrow = ({ className }: { className?: string }) => (
	<svg
		className={cn(className)}
		viewBox="0 0 12 12"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M3.5 3C3.22386 3 3 3.22386 3 3.5C3 3.77614 3.22386 4 3.5 4V3ZM8.5 3.5H9C9 3.22386 8.77614 3 8.5 3V3.5ZM8 8.5C8 8.77614 8.22386 9 8.5 9C8.77614 9 9 8.77614 9 8.5H8ZM2.64645 8.64645C2.45118 8.84171 2.45118 9.15829 2.64645 9.35355C2.84171 9.54882 3.15829 9.54882 3.35355 9.35355L2.64645 8.64645ZM3.5 4H8.5V3H3.5V4ZM8 3.5V8.5H9V3.5H8ZM8.14645 3.14645L2.64645 8.64645L3.35355 9.35355L8.85355 3.85355L8.14645 3.14645Z"
			fill="var(--grey1)"
		></path>
	</svg>
);
