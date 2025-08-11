"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { fetcher } from "@/lib/utils";
import { PublicProfile } from "@/types/profile";
import { CornerDownLeft, Loader, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";

export default function SearchModal() {
	const [open, setOpen] = useState(true);
	const [showLoading, setShowLoading] = useState(false);

	const router = useRouter();

	const { data, isLoading: isLoadingRecentProfiles } = useSWR<{
		users: PublicProfile[];
	}>("/api/profiles", fetcher, {
		refreshInterval: 30000,
		revalidateOnFocus: false,
		dedupingInterval: 10000,
	});

	useEffect(() => {
		if (isLoadingRecentProfiles) {
			const timer = setTimeout(() => setShowLoading(true), 200);
			return () => clearTimeout(timer);
		} else {
			setShowLoading(false);
		}
	}, [isLoadingRecentProfiles]);

	const profilesData = data?.users || [];

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
			open={open}
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
				{showLoading ? (
					<div className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-6">
						<Loader className="size-3 animate-spin" />
						<span>Loading...</span>
					</div>
				) : profilesData.length > 0 ? (
					<CommandGroup heading="Recently joined">
						{profilesData.map((profile) => (
							<CommandItem key={profile.id} asChild>
								<Link
									href={`/profile/${profile.username}`}
									onClick={() => {
										setOpen(false);
									}}
								>
									<div className="flex items-center gap-2">
										<Avatar>
											{/* <AvatarImage src={profile.image} /> */}
											<AvatarFallback className="tracking-wider uppercase">
												{profile?.name.split(" ").map((name) => name.charAt(0))}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col">
											<span>{profile.name}</span>
											<p className="text-xs text-muted-foreground">
												@{profile.username}
											</p>
										</div>
									</div>
								</Link>
							</CommandItem>
						))}
					</CommandGroup>
				) : null}
			</CommandList>
			<Separator />
			<div className="flex justify-between p-1 items-center">
				<button
					type="button"
					onClick={handleClose}
					className="text-muted-foreground flex items-center gap-1.5 text-xs hover:bg-accent px-2 py-1.5 rounded-sm h-7 transition-colors duration-200 ease-out"
				>
					<CommandShortcut>Esc</CommandShortcut>
					<span className="leading-none">Close</span>
				</button>
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						className="flex items-center gap-2 text-xs hover:bg-accent px-2 py-1.5 rounded-sm h-7 transition-colors duration-200 ease-out"
					>
						<CommandShortcut className="text-foreground">
							<CornerDownLeft className="size-3" />
						</CommandShortcut>
						<span className="leading-none">Open</span>
					</button>
					<Separator orientation="vertical" className="!h-3" />
					<button
						type="button"
						className="flex items-center gap-1.5 text-xs text-muted-foreground hover:bg-accent px-2 py-1.5 rounded-sm h-7 transition-colors duration-200 ease-out"
					>
						<CommandShortcut className="flex items-center gap-0.5">
							⌘ <CornerDownLeft className="size-3" />
						</CommandShortcut>
						<span className="leading-none">Open in new tab</span>
					</button>
				</div>
			</div>
		</CommandDialog>
	);
}
