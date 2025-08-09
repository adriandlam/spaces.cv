"use client";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DiscordIcon,
	ExternalArrow,
	GitHubIcon,
	LinkedinIcon,
	TwitterIcon,
} from "../icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
	Eye,
	EyeOff,
	Globe,
	Link2,
	Mail,
	Pencil,
	Phone,
	Plus,
	Trash,
} from "lucide-react";
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
import { contactSchema } from "@/lib/validations/profile";
import type { ContactFormData } from "@/types/profile";
import { ScrollArea } from "../ui/scroll-area";
import type { Contact } from "@/app/generated/prisma";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import normalizeUrl from "normalize-url";
import { getContactIcon } from "../icons";

interface ContactsTabProps {
	contacts: Contact[];
	showContactForm: boolean;
	onShowContactForm: (show: boolean) => void;
	onSubmit: (data: ContactFormData) => Promise<void>;
	isSubmitting: boolean;
}

export const contactTypeLabels: Record<Contact["type"], string> = {
	EMAIL: "Email",
	PHONE: "Phone",
	WEBSITE: "Website",
	TWITTER: "X",
	LINKEDIN: "LinkedIn",
	GITHUB: "GitHub",
	DISCORD: "Discord",
	LINK: "Link",
};

const getPlaceholder = (type: Contact["type"]) => {
	switch (type) {
		case "EMAIL":
			return "john@example.com";
		case "PHONE":
			return "+1 (555) 123-4567";
		case "WEBSITE":
			return "https://johndoe.com";
		case "TWITTER":
			return "https://twitter.com/johndoe";
		case "LINKEDIN":
			return "https://linkedin.com/in/johndoe";
		case "GITHUB":
			return "https://github.com/johndoe";
		case "DISCORD":
			return "https://discord.gg/invite";
		case "LINK":
			return "https://example.com";
		default:
			return "Enter value";
	}
};

export default function ContactsTab({
	contacts,
	showContactForm,
	onShowContactForm,
	onSubmit,
	isSubmitting,
}: ContactsTabProps) {
	const { mutateContacts } = useProfile();
	const contactForm = useForm<ContactFormData>({
		resolver: zodResolver(contactSchema),
		mode: "onChange",
		defaultValues: {
			type: "EMAIL",
			value: "",
		},
	});

	const selectedType = contactForm.watch("type");
	const currentValue = contactForm.watch("value");

	// Normalize URL on blur for website/link types
	const handleUrlBlur = () => {
		if (
			(selectedType === "WEBSITE" ||
				selectedType === "LINK" ||
				selectedType === "TWITTER" ||
				selectedType === "LINKEDIN" ||
				selectedType === "GITHUB") &&
			currentValue
		) {
			try {
				const normalized = normalizeUrl(currentValue, {
					stripProtocol: true,
					removeQueryParameters: true,
					stripWWW: false, // Keep www for recognition
					removeTrailingSlash: true,
				});
				contactForm.setValue("value", normalized);
			} catch {
				// Invalid URL, leave as-is
			}
		}
	};

	const handleCancel = () => {
		onShowContactForm(false);
		contactForm.reset();
	};

	const hideContact = async (id: string) => {
		const contact = contacts.find((c) => c.id === id);
		if (!contact) return;

		try {
			mutateContacts(
				{
					contacts: contacts.map((c) =>
						c.id === id ? { ...c, hidden: !c.hidden } : c,
					),
				},
				false,
			);

			const response = await fetch("/api/profile/contacts", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id,
					hidden: !contact.hidden,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update contact visibility");
			}
		} catch (_) {
			// Revert on error and revalidate
			mutateContacts();
		}
	};

	const deleteContact = async (id: string) => {
		try {
			// Optimistic update - remove contact immediately
			mutateContacts(
				{
					contacts: contacts.filter((c) => c.id !== id),
				},
				false,
			);

			const response = await fetch("/api/profile/contacts", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id }),
			});

			if (!response.ok) {
				throw new Error("Failed to delete contact");
			}
		} catch (_) {
			// Revert on error and revalidate
			mutateContacts();
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center mb-1">
				<h3 className="text-xl">Contact</h3>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onShowContactForm(true)}
					disabled={showContactForm}
				>
					<Plus />
					Add Contact
				</Button>
			</div>
			<Separator />

			{/* Display existing contacts */}
			<ScrollArea className="h-[65dvh]">
				{contacts.length > 0 && (
					<div>
						{contacts.map((contact) => (
							<>
								<div
									key={contact.id}
									className={cn(
										"flex items-center gap-2",
										contact.hidden && "opacity-50",
									)}
								>
									<span className="text-muted-foreground text-sm opacity-75 mt-1 flex items-center gap-2 w-40">
										{getContactIcon(contact.type)}
										{contactTypeLabels[contact.type]}
									</span>
									<div className="flex items-center justify-between w-full">
										<button
											type="button"
											className={cn(
												"hover:underline underline-offset-4 transition-all duration-200 ease-out",
												contact.hidden && "opacity-50",
											)}
										>
											<Link
												href={contact.href || ""}
												className="flex items-start"
											>
												{contact.value}
												<ExternalArrow className="size-3 ml-0.5 mt-1" />
											</Link>
										</button>
										<div className="flex items-center gap-6">
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
												onClick={() => hideContact(contact.id)}
											>
												{contact.hidden ? (
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
												onClick={() => deleteContact(contact.id)}
											>
												<Trash className="size-3" />
												Delete
											</button>
										</div>
									</div>
								</div>
								<Separator className="my-4" />
							</>
						))}
					</div>
				)}

				<AnimatePresence>
					{showContactForm && (
						<motion.div
							key="contact-form"
							initial={{ opacity: 0, y: 5, filter: "blur(8px)" }}
							animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							exit={{ opacity: 0, y: 5, filter: "blur(8px)" }}
							transition={{
								duration: 0.2,
								ease: "easeOut",
							}}
							className="space-y-4"
						>
							<Form {...contactForm}>
								<form
									id="contact-form"
									onSubmit={contactForm.handleSubmit(onSubmit)}
									className="grid grid-cols-2 gap-6"
								>
									<FormField
										control={contactForm.control}
										name="type"
										render={({ field }) => (
											<FormItem>
												<Label className="text-sm">Type*</Label>
												<FormControl>
													<Select
														value={field.value}
														onValueChange={field.onChange}
													>
														<SelectTrigger className="w-full border-0 shadow-none">
															<SelectValue placeholder="Select a type" />
														</SelectTrigger>
														<SelectContent>
															{Object.entries(contactTypeLabels).map(
																([value, label]) => (
																	<SelectItem key={value} value={value}>
																		{getContactIcon(value as Contact["type"])}{" "}
																		{label}
																	</SelectItem>
																),
															)}
														</SelectContent>
													</Select>
													{/* <select
														value={field.value}
														onChange={field.onChange}
														className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													>
														{Object.entries(contactTypeLabels).map(
															([value, label]) => (
																<option key={value} value={value}>
																	{getContactIcon(value as Contact["type"])}{" "}
																	{label}
																</option>
															),
														)}
													</select> */}
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={contactForm.control}
										name="value"
										render={({ field, fieldState }) => (
											<FormItem>
												<Label className="text-sm">Value*</Label>
												<FormControl>
													<Input
														{...field}
														placeholder={getPlaceholder(selectedType)}
														className={fieldState.error ? "border-red-500" : ""}
														onBlur={() => {
															handleUrlBlur();
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="flex justify-end col-span-2">
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
