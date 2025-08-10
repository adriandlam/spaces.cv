"use client";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import {
	Calculat,
	CreditCard,
	Smileor,
	Calendar,
	User,
	CornerDownLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export default function SearchModal() {
	const [open, setOpen] = useState(false);

	const router = useRouter();

	// const onSubmit = async (data: EmailFormData) => {
	// 	setIsSubmitting(true);
	// 	setSubmitError(null);

	// 	try {
	// 		const { error } = await authClient.signIn.magicLink({
	// 			email: data.email,
	// 			name: "",
	// 			callbackURL: "/",
	// 			newUserCallbackURL: "/profile",
	// 			errorCallbackURL: "/auth/error",
	// 		});

	// 		if (error) {
	// 			setSubmitError(
	// 				error.message || "An error occurred while sending the magic link",
	// 			);
	// 			setIsSubmitting(false);
	// 			return;
	// 		}

	// 		setStep(2);
	// 	} catch {
	// 		setSubmitError("An unexpected error occurred. Please try again.");
	// 	} finally {
	// 		setIsSubmitting(false);
	// 	}
	// };

	// const resetForm = () => {
	// 	reset();
	// 	setStep(0);
	// 	setSubmitError(null);
	// 	setIsSubmitting(false);
	// };

	const handleClose = () => {
		console.log("close");
		setOpen(false);
		router.back();
	};

	return (
		<CommandDialog
			showCloseButton={false}
			defaultOpen
			onOpenChange={(open) => {
				if (!open) {
					handleClose();
				}
			}}
			className="!max-w-screen-xs"
		>
			<CommandInput placeholder="Search for a person..." />
			<CommandList>
				<CommandEmpty>No results found</CommandEmpty>
				{/* <CommandGroup heading="Suggestions">
					<CommandItem>
						<Calendar />
						<span>Calendar</span>
					</CommandItem>
					<CommandItem>
						<span>Search Emoji</span>
					</CommandItem>
					<CommandItem>
						<span>Calculator</span>
					</CommandItem>
				</CommandGroup> */}
				<CommandSeparator />
				<CommandGroup heading="Recently joined">
					{/* <CommandItem>
						<User />
						<span>Profile</span>
						<CommandShortcut>⌘P</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<CreditCard />
						<span>Billing</span>
						<CommandShortcut>⌘B</CommandShortcut>
					</CommandItem> */}
				</CommandGroup>
			</CommandList>
			<Separator />
			<div className="flex justify-between px-2 py-1.5 items-center">
				<button
					type="button"
					onClick={handleClose}
					className="text-muted-foreground flex items-center gap-1.5 text-xs hover:bg-accent px-2 py-1 rounded"
				>
					<kbd className="text-xs leading-none">Esc</kbd>
					<span className="leading-none">Close</span>
				</button>
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						className="flex items-center gap-1.5 text-xs hover:bg-accent px-2 py-1 rounded"
					>
						<kbd className="text-xs leading-none">⌘</kbd>
						<span className="leading-none">Open</span>
					</button>
					<Separator orientation="vertical" className="!h-3" />
					<button
						type="button"
						className="flex items-center gap-1.5 text-xs text-muted-foreground hover:bg-accent px-2 py-1.5 rounded"
					>
						<kbd className="text-xs leading-none flex items-center gap-0.5">
							⌘ <CornerDownLeft className="size-3" />
						</kbd>
						<span className="leading-none">Open in new tab</span>
					</button>
				</div>
			</div>
		</CommandDialog>
	);
}
