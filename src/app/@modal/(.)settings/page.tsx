"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { CircleX, CircleCheck, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient, signIn } from "@/lib/auth-client";
import { GitHubIcon, GoogleIcon } from "@/components/icons";
import { useRouter } from "next/navigation";

const emailFormSchema = z.object({
	email: z
		.email("Please enter a valid email address")
		.min(1, "Email is required"),
});

type EmailFormData = z.infer<typeof emailFormSchema>;

export default function SettingsModal() {
	const [step, setStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const router = useRouter();

	const form = useForm<EmailFormData>({
		resolver: zodResolver(emailFormSchema),
		mode: "onChange",
		defaultValues: {
			email: "",
		},
	});

	const {
		handleSubmit,
		formState: { isValid },
		watch,
		reset,
	} = form;
	const emailValue = watch("email", "");

	const onSubmit = async (data: EmailFormData) => {
		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const { error } = await authClient.signIn.magicLink({
				email: data.email,
				name: "",
				callbackURL: "/",
				newUserCallbackURL: "/profile",
				errorCallbackURL: "/auth/error",
			});

			if (error) {
				setSubmitError(
					error.message || "An error occurred while sending the magic link",
				);
				setIsSubmitting(false);
				return;
			}

			setStep(2);
		} catch {
			setSubmitError("An unexpected error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const resetForm = () => {
		reset();
		setStep(0);
		setSubmitError(null);
		setIsSubmitting(false);
	};

	return (
		<Dialog
			defaultOpen
			onOpenChange={(open) => {
				if (!open) {
					resetForm();
					router.back();
				}
			}}
		>
			<DialogContent
				className="!max-w-sm h-[16rem] overflow-hidden"
				showCloseButton={false}
			>
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					stuff here
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
