"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CircleCheck, CircleX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generalSchema } from "@/lib/validations/profile";
import type { GeneralFormData } from "@/types/profile";
import { UsernameField } from "./username-field";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

interface GeneralTabProps {
	onSubmit: (data: GeneralFormData) => Promise<void>;
	isSubmitting: boolean;
	defaultValues?: Partial<GeneralFormData>;
	userImage?: string;
	userName?: string;
}

export default function GeneralTab({
	onSubmit,
	isSubmitting,
	defaultValues,
	userImage,
	userName,
}: GeneralTabProps) {
	const generalForm = useForm<GeneralFormData>({
		resolver: zodResolver(generalSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			username: "",
			title: "",
			about: "",
			location: "",
			website: "",
			...defaultValues,
		},
	});
	const [image, setImage] = useState<string | null>(null);

	// Reset form when defaultValues change
	useEffect(() => {
		if (defaultValues) {
			generalForm.reset({
				name: "",
				username: "",
				title: "",
				about: "",
				location: "",
				website: "",
				...defaultValues,
			});
		}
	}, [defaultValues, generalForm]);

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		const formData = new FormData();
		formData.append("image", acceptedFiles[0]);

		try {
			fetch("/api/me/profile/image", {
				method: "PUT",
				body: formData,
			});
		} catch (error) {
			console.error(error);
		}
	}, []);
	const { getRootProps, getInputProps } = useDropzone({ onDrop });

	return (
		<Form {...generalForm}>
			<form
				id="general-form"
				onSubmit={generalForm.handleSubmit(onSubmit)}
				className="space-y-4"
			>
				<div className="flex items-center gap-8">
					<div {...getRootProps()} className="hover:cursor-pointer">
						<Avatar className="ring ring-border size-20 mt-2.5">
							{userImage && (
								<AvatarImage src={userImage} alt={userName ?? ""} />
							)}
							<AvatarFallback>
								<Camera
									strokeWidth={1.5}
									className="size-6 text-muted-foreground"
								/>
							</AvatarFallback>
						</Avatar>
						<input {...getInputProps()} />
					</div>
					<div className="space-y-3 w-full">
						<FormField
							control={generalForm.control}
							name="name"
							render={({ field, fieldState }) => (
								<FormItem>
									<Label htmlFor="name" className="text-sm">
										Display Name*
									</Label>
									<FormControl>
										<div className="relative">
											<Input
												id="name"
												{...field}
												className="w-full"
												required
												disabled={isSubmitting}
											/>
											<AnimatePresence>
												{fieldState.error && field.value.trim().length > 0 && (
													<motion.span
														key="name-error"
														initial={{
															opacity: 0,
															y: 10,
														}}
														animate={{
															opacity: 1,
															y: 0,
														}}
														exit={{ opacity: 0, y: 10 }}
														transition={{
															duration: 0.1,
															ease: "easeOut",
														}}
													>
														<CircleX className="text-destructive absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
													</motion.span>
												)}
												{field.value.trim().length > 0 && !fieldState.error && (
													<motion.span
														key="name-success"
														initial={{
															opacity: 0,
															y: 10,
														}}
														animate={{
															opacity: 1,
															y: 0,
														}}
														exit={{ opacity: 0, y: 10 }}
														transition={{
															duration: 0.1,
															ease: "easeOut",
														}}
													>
														<CircleCheck className="text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
													</motion.span>
												)}
											</AnimatePresence>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<UsernameField
							control={generalForm.control}
							name="username"
							disabled={isSubmitting}
							required
							className="w-full"
						/>
					</div>
				</div>

				<FormField
					control={generalForm.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<Label htmlFor="title" className="text-sm">
								What do you do?
							</Label>
							<FormControl>
								<Input
									id="title"
									{...field}
									placeholder="Software Engineer, Designer, etc."
									className="w-full"
									disabled={isSubmitting}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={generalForm.control}
					name="about"
					render={({ field }) => (
						<FormItem>
							<Label htmlFor="about" className="text-sm">
								About
							</Label>
							<FormControl>
								<Textarea
									id="about"
									{...field}
									placeholder="Tell us about yourself..."
									className="w-full resize-none"
									rows={8}
									disabled={isSubmitting}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={generalForm.control}
					name="location"
					render={({ field }) => (
						<FormItem>
							<Label htmlFor="location" className="text-sm">
								Location
							</Label>
							<FormControl>
								<Input
									id="location"
									{...field}
									placeholder="San Francisco, CA"
									className="w-full"
									disabled={isSubmitting}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={generalForm.control}
					name="website"
					render={({ field }) => (
						<FormItem>
							<Label htmlFor="website" className="text-sm">
								Website
							</Label>
							<FormControl>
								<Input
									id="website"
									{...field}
									placeholder="https://example.com"
									className="w-full"
									disabled={isSubmitting}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
