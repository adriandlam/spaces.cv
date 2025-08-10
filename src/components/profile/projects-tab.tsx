"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
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
import { projectSchema } from "@/lib/validations/profile";
import type { ProjectFormData } from "@/types/profile";

interface ProjectsTabProps {
	projects: Project[];
	showProjectForm: boolean;
	onShowProjectForm: (show: boolean) => void;
	onSubmit: (data: ProjectFormData) => Promise<void>;
	isSubmitting: boolean;
}

export default function ProjectsTab({
	projects,
	showProjectForm,
	onShowProjectForm,
	onSubmit,
	isSubmitting,
}: ProjectsTabProps) {
	const projectForm = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
		mode: "onChange",
		defaultValues: {
			title: "",
			year: "",
			description: "",
			company: "",
			link: "",
			collaborators: "",
		},
	});

	const handleCancel = () => {
		onShowProjectForm(false);
		projectForm.reset();
	};

	return (
		<div className="space-y-7">
			<div className="flex justify-between items-center mb-1">
				<h3 className="text-xl">Projects</h3>
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
			<Separator />

			{/* Display existing projects */}
			{projects.length > 0 && (
				<div className="space-y-3">
					{projects.map((project) => (
						<div key={project.id} className="border rounded-lg p-4 space-y-2">
							<div className="flex justify-between items-start">
								<h4 className="font-medium">{project.title}</h4>
								<span className="text-sm text-muted-foreground">
									{project.year}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								{project.description}
							</p>
							{project.company && (
								<p className="text-xs text-muted-foreground">
									Company: {project.company}
								</p>
							)}
							{project.link && (
								<a
									href={project.link}
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-blue-600 hover:underline"
								>
									View Project
								</a>
							)}
							{project.collaborators && (
								<p className="text-xs text-muted-foreground">
									Collaborators: {project.collaborators}
								</p>
							)}
						</div>
					))}
				</div>
			)}

			<AnimatePresence>
				{showProjectForm && (
					<motion.div
						key="project-form"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
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
								<div className="grid grid-cols-2 gap-3">
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
									<FormField
										control={projectForm.control}
										name="year"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Year*</Label>
												<FormControl>
													<Input
														{...field}
														placeholder="2024"
														className={fieldState.error ? "border-red-500" : ""}
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
														className={fieldState.error ? "border-red-500" : ""}
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
														className={fieldState.error ? "border-red-500" : ""}
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
		</div>
	);
}
