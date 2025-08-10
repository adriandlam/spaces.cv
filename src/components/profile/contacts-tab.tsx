"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";
import normalizeUrl from "normalize-url";
import { useForm } from "react-hook-form";
import type { Contact, ContactType } from "@/app/generated/prisma";
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { contactSchema } from "@/lib/validations/profile";
import type { ContactFormData } from "@/types/profile";
import { ExternalArrow, getContactIcon } from "../icons";
import { ScrollArea } from "../ui/scroll-area";

interface ContactsTabProps {
	contacts: Contact[];
	showContactForm: boolean;
	onShowContactForm: (show: boolean) => void;
	onSubmit: (data: ContactFormData) => Promise<void>;
	isSubmitting: boolean;
	onContactsUpdate?: (contacts: Contact[]) => void;
}

export const contactTypeLabels: Record<Contact["type"], string> = {
	EMAIL: "Email",
	PHONE: "Phone",
	WEBSITE: "Website",
	X: "X",
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
		case "X":
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
	onContactsUpdate,
}: ContactsTabProps) {
	// const { mutateContacts } = useProfile();
	const contactForm = useForm<ContactFormData>({
		resolver: zodResolver(contactSchema),
		mode: "onChange",
		defaultValues: {
			type: "EMAIL",
			value: "",
		},
	});

	const selectedType = contactForm.watch("type") as ContactType;
	const currentValue = contactForm.watch("value");

	// Normalize URL on blur for website/link types
	const handleUrlBlur = () => {
		if (
			(selectedType === "WEBSITE" ||
				selectedType === "LINK" ||
				selectedType === "X" ||
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
			const updatedContacts = contacts.map((c) =>
				c.id === id ? { ...c, hidden: !c.hidden } : c,
			);

			// mutateContacts(
			// 	{
			// 		contacts: updatedContacts,
			// 	},
			// 	false,
			// );

			// Update parent state
			if (onContactsUpdate) {
				onContactsUpdate(updatedContacts);
			}

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
			if (onContactsUpdate) {
				onContactsUpdate(contacts);
			}
		}
	};

	const deleteContact = async (id: string) => {
		try {
			const updatedContacts = contacts.filter((c) => c.id !== id);

			// Update parent state
			if (onContactsUpdate) {
				onContactsUpdate(updatedContacts);
			}

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
			if (onContactsUpdate) {
				onContactsUpdate(contacts);
			}
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center mb-1">
				<div>
					<h3 className="text-xl">Contact</h3>
					<p className="text-sm text-muted-foreground">
						Add how people can contact you
					</p>
				</div>
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

			{/* Display existing contacts */}
			<ScrollArea className="h-[65dvh] mt-8">
				{contacts.length > 0 && (
					<div>
						{contacts.map((contact) => (
							<>
								<div
									key={contact.id}
									className={cn(
										"flex items-center gap-2 transition-all duration-200 ease-out",
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
														value={field.value as string}
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
