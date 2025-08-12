"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { Project } from "@/app/generated/prisma";
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
import { projectSchema } from "@/lib/validations/profile";
import type { ProjectFormData } from "@/types/profile";
import { ExternalArrow } from "../icons";
import { ScrollArea } from "../ui/scroll-area";

interface ProjectsTabProps {
	projects: Project[];
	showProjectForm: boolean;
	onShowProjectForm: (show: boolean) => void;
	onSubmit: (data: ProjectFormData) => Promise<void>;
	isSubmitting: boolean;
	onProjectUpdate?: (id: string, updates: Partial<Project>) => void;
	onProjectDelete?: (id: string) => void;
}

export default function ProjectsTab({
	projects,
	showProjectForm,
	onShowProjectForm,
	onSubmit,
	isSubmitting,
	onProjectUpdate,
	onProjectDelete,
}: ProjectsTabProps) {
	const projectForm = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
		mode: "onChange",
		defaultValues: {
			title: "",
			from: "",
			to: "",
			description: "",
			company: "",
			link: "",
			collaborators: [],
		},
	});

	const handleCancel = () => {
		onShowProjectForm(false);
		projectForm.reset();
	};

	const hideProject = async (id: string) => {
		const project = projects.find((p) => p.id === id);
		if (!project) return;

		await onProjectUpdate?.(id, { hidden: !project.hidden });
	};

	const deleteProject = async (id: string) => {
		await onProjectDelete?.(id);
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-1">
				<div>
					<h3 className="text-xl">Projects</h3>
					<p className="text-sm text-muted-foreground">
						Add any info about your projects
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onShowProjectForm(true)}
					disabled={showProjectForm}
				>
					<Plus />
					Add Project
				</Button>
			</div>

			{/* Display existing projects */}
			<ScrollArea className="h-[65dvh] mt-8">
				{projects.length > 0 && (
					<div className="space-y-3">
						{projects.map((project) => (
							<>
								<div
									key={project.id}
									className={cn(
										"flex items-start gap-4 transition-all duration-200 ease-out",
										project.hidden && "opacity-50",
									)}
								>
									<div className="w-40">
										<span className="text-muted-foreground text-sm opacity-75 mt-1">
											{project.from} — {project.to || "Present"}
										</span>
										<div className="text-muted-foreground opacity-75 text-sm">
											{project.company}
										</div>
									</div>
									<div className="flex items-center justify-between w-full">
										<div className="flex flex-col">
											<button
												type="button"
												className={cn(
													"hover:underline underline-offset-3 transition-all duration-200 ease-out",
													project.hidden && "opacity-50",
												)}
											>
												<Link
													href={project.link || ""}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-start"
												>
													{project.title}
													<ExternalArrow className="size-3 ml-0.5 mt-1" />
												</Link>
											</button>
											<p className="text-muted-foreground opacity-75 text-sm mt-2">
												{project.description}
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
												onClick={() => hideProject(project.id)}
											>
												{project.hidden ? (
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
												onClick={() => deleteProject(project.id)}
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
					{showProjectForm && (
						<motion.div
							key="project-form"
							initial={{ opacity: 0, y: 5, filter: "blur(8px)" }}
							animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							exit={{ opacity: 0, y: 5, filter: "blur(8px)" }}
							transition={{
								duration: 0.2,
								ease: "easeOut",
							}}
							className="space-y-4"
						>
							<Form {...projectForm}>
								<form
									id="project-form"
									onSubmit={projectForm.handleSubmit(onSubmit)}
									className="space-y-3"
								>
									<FormField
										control={projectForm.control}
										name="title"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Title*</Label>
												<FormControl>
													<Input
														{...field}
														placeholder="My Awesome Project"
														className={fieldState.error ? "border-red-500" : ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-2 gap-3">
										<FormField
											control={projectForm.control}
											name="from"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">From*</Label>
													<FormControl>
														<Input
															{...field}
															placeholder={new Date().getFullYear().toString()}
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
											control={projectForm.control}
											name="to"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">To</Label>
													<FormControl>
														<Input
															{...field}
															placeholder={new Date().getFullYear().toString()}
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
										control={projectForm.control}
										name="description"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Description*</Label>
												<FormControl>
													<Textarea
														{...field}
														placeholder="A brief description of your project..."
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

									<div className="grid grid-cols-2 gap-3">
										<FormField
											control={projectForm.control}
											name="company"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">Company</Label>
													<FormControl>
														<Input
															{...field}
															placeholder="Company name"
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
											control={projectForm.control}
											name="link"
											render={({ field, fieldState }) => (
												<FormItem>
													<Label className="text-sm">Link</Label>
													<FormControl>
														<Input
															{...field}
															placeholder="https://example.com"
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
										control={projectForm.control}
										name="collaborators"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Collaborators</Label>
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
								</form>
							</Form>
						</motion.div>
					)}
				</AnimatePresence>
			</ScrollArea>
		</div>
	);
}
