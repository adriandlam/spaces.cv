"use client";

import { ExternalArrow } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { cn, debounce } from "@/lib/utils";
import type { PublicProfile } from "@/types/profile";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, CornerDownLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";

const SUGGESTIONS = [
	"Software engineers with React experience",
	"Designers who work on mobile apps",
	"People who studied at MIT",
];

export default function SearchModal() {
	const [open, setOpen] = useState(true);
	const [aiMode, setAiMode] = useState(false);
	const [pages, setPages] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [currentSuggestion, setCurrentSuggestion] = useState(SUGGESTIONS[0]);
	const page = pages[pages.length - 1];

	const router = useRouter();

	const { data } = useSWR<{
		users: PublicProfile[];
	}>("/api/profiles?limit=10", {
		refreshInterval: 5 * 60 * 1000,
		revalidateIfStale: false,
	});

	const inputRef = useRef<HTMLInputElement>(null);

	useHotkeys(
		"*",
		(e) => {
			if (/^[a-zA-Z0-9]+$/.test(e.key)) {
				inputRef.current?.focus();
			}
		},
		{
			enableOnFormTags: true,
		},
	);

	useHotkeys(
		"backspace",
		() => {
			if (searchQuery.length === 0) {
				if (pages.length > 0) {
					setPages((pages) => pages.slice(0, -1));
				} else {
					setAiMode(false);
				}
			}
			inputRef.current?.focus();
		},
		{
			enableOnFormTags: true,
		},
	);

	useHotkeys(
		"esc",
		() => {
			if (pages.length > 0) {
				setPages((pages) => pages.slice(0, -1));
			} else {
				setAiMode(false);
			}
		},
		{
			enabled: aiMode,
			preventDefault: true,
			enableOnFormTags: true,
		},
	);

	useHotkeys(
		"tab",
		() => {
			setAiMode(true);
		},
		{
			preventDefault: true,
			enableOnFormTags: true,
		},
	);

	const profilesData = data?.users || [];

	// Debounced search function
	const debouncedSearch = useCallback(
		debounce(async (query: string) => {
			if (!query.trim()) {
				setIsSearching(false);
				return;
			}

			try {
				const response = await fetch(
					`/api/search?q=${encodeURIComponent(query)}` +
						(aiMode ? "&mode=ai" : ""),
				);
				const data = await response.json();
				setSearchResults(data.users || []);
			} catch {
				setSearchResults([]);
			} finally {
				setIsSearching(false);
			}
		}, 300),
		[],
	);

	// Trigger search when query changes
	useEffect(() => {
		if (searchQuery.trim()) {
			setIsSearching(true);
			debouncedSearch(searchQuery);
		} else {
			setIsSearching(false);
			setSearchResults([]);
		}
	}, [searchQuery, debouncedSearch]);

	// Clear search when switching modes
	useEffect(() => {
		if (aiMode) {
			setSearchQuery("");
			setSearchResults([]);
		}
	}, [aiMode]);

	useEffect(() => {
		if (aiMode && !searchQuery.trim()) {
			const interval = setInterval(() => {
				setCurrentSuggestion((prev) => {
					const nextIndex = SUGGESTIONS.indexOf(prev) + 1;
					return SUGGESTIONS[nextIndex % SUGGESTIONS.length];
				});
			}, 1750);

			return () => clearInterval(interval);
		}
	}, [aiMode, searchQuery]);

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

	const handleClose = () => {
		setOpen(false);
		router.back();
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// Close modal only when not in AI mode
			if (aiMode) {
				setAiMode(false);
				return;
			}
			handleClose();
		}
	};

	return (
		<CommandDialog
			shouldFilter={false}
			showCloseButton={false}
			open={open}
			onOpenChange={handleOpenChange}
			className={cn("!max-w-screen-xs", aiMode && "!max-w-screen-sm")}
		>
			<div className="relative">
				<AnimatePresence>
					{aiMode && (
						<motion.button
							initial={{ opacity: 0, x: -20, filter: "blur(5px)" }}
							animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
							exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							type="button"
							className="absolute top-3.5 left-2.5 flex items-center justify-center rounded h-5 w-5 transition-colors duration-200 ease-out bg-accent/50 hover:bg-accent"
							onClick={() => {
								setAiMode(false);
							}}
						>
							<ChevronLeft className="size-3 text-muted-foreground" />
						</motion.button>
					)}
				</AnimatePresence>
				{aiMode && !searchQuery.trim() && (
					<div className="absolute text-sm top-1/2 -translate-y-1/2  pointer-events-none left-9">
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={currentSuggestion}
								initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
								animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
								exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
								transition={{ duration: 0.3, ease: "easeOut" }}
								className="text-muted-foreground text-nowrap"
							>
								{currentSuggestion}
							</motion.span>
						</AnimatePresence>
					</div>
				)}
				<CommandInput
					placeholder={!aiMode ? "Search for a person..." : undefined}
					ref={inputRef}
					value={searchQuery}
					onValueChange={setSearchQuery}
					onFocus={() => {
						inputRef.current?.focus();
					}}
					className={cn(aiMode && "!pl-6")}
					hideIcon={aiMode}
				/>
				<AnimatePresence>
					{!aiMode && (
						<motion.button
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							onClick={() => {
								setAiMode(true);
							}}
							type="button"
							className="absolute top-2.5 right-2 flex items-center gap-2 px-1 pr-2 py-1.5 rounded-sm h-7 transition-colors duration-200 ease-out hover:bg-accent"
						>
							<CommandShortcut className="border px-1.5 py-0.5 rounded-sm bg-blue-700/50 !border-blue-700 text-foreground">
								Tab
							</CommandShortcut>
							<span className="text-xs">Ask AI</span>
						</motion.button>
					)}
				</AnimatePresence>
			</div>
			<CommandList>
				{!aiMode &&
					searchQuery.trim() &&
					!isSearching &&
					searchResults.length === 0 && (
						<CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
					)}
				{/* {aiMode && !isSearching && !searchQuery.trim() && (
					<CommandGroup heading="Try asking for...">
						<div className="flex items-center gap-2">
							<CommandItem
								onSelect={() =>
									setSearchQuery("Software engineers with React experience")
								}
								asChild
							>
								<Button variant="outline" size="sm">
									<span>React software engineers</span>
								</Button>
							</CommandItem>
							<CommandItem
								onSelect={() =>
									setSearchQuery("Designers who work on mobile apps")
								}
								asChild
							>
								<Button variant="outline" size="sm">
									<span>Designers who work on mobile apps</span>
								</Button>
							</CommandItem>
							<CommandItem
								onSelect={() => setSearchQuery("people who studied at MIT")}
								asChild
							>
								<Button variant="outline" size="sm">
									<span>People who studied at MIT</span>
								</Button>
							</CommandItem>
						</div>
					</CommandGroup>
				)} */}
				{!page &&
					aiMode &&
					searchQuery.trim() &&
					!isSearching &&
					searchResults.length > 0 && (
						<CommandGroup heading={`Search results (${searchResults.length})`}>
							{searchResults.map((profile) => (
								<CommandItem
									key={profile.id}
									asChild
									className="group !pr-3 hover:cursor-pointer"
								>
									<Link
										href={`/${profile.username}`}
										onClick={() => {
											setOpen(false);
										}}
										className="flex justify-between"
									>
										<div className="flex items-center gap-2">
											<Avatar className="size-9">
												{profile.image && (
													<AvatarImage src={profile.image} alt={profile.name} />
												)}
												<AvatarFallback className="tracking-wider uppercase">
													{profile?.name
														.split(" ")
														.map((name) => name.charAt(0))}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col leading-4">
												<span>{profile.name}</span>
												<p className="text-xs text-muted-foreground">
													@{profile.username}
												</p>
											</div>
										</div>
										<div className="flex group-hover:opacity-100 group-data-[selected=true]:opacity-100 opacity-0 gap-0.5 text-xs transition duration-100 ease-out">
											<span>Visit</span>
											<ExternalArrow className="!size-3 !text-foreground" />
										</div>
									</Link>
								</CommandItem>
							))}
						</CommandGroup>
					)}
				{!page && !aiMode && !searchQuery.trim() && (
					<>
						{/* <CommandGroup heading="Actions">
							<CommandItem onSelect={() => setPages([...pages, "projects"])}>
								<span>Browse projects...</span>
							</CommandItem>
							<CommandItem onSelect={() => setPages([...pages, "teams"])}>
								<span>Browse teams...</span>
							</CommandItem>
							<CommandItem onSelect={() => setPages([...pages, "settings"])}>
								<span>Settings...</span>
							</CommandItem>
						</CommandGroup> */}

						{profilesData.length > 0 && (
							<CommandGroup heading="Recently joined">
								{profilesData.map((profile) => (
									<CommandItem
										key={profile.id}
										asChild
										className="group !pr-3 hover:cursor-pointer"
									>
										<Link
											href={`/${profile.username}`}
											onClick={() => {
												setOpen(false);
											}}
											className="flex justify-between"
										>
											<div className="flex items-center gap-2">
												<Avatar className="size-9">
													{profile.image && (
														<AvatarImage
															src={profile.image}
															alt={profile.name}
														/>
													)}
													<AvatarFallback className="tracking-wider uppercase">
														{profile?.name
															.split(" ")
															.map((name) => name.charAt(0))}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-col leading-4">
													<span>{profile.name}</span>
													<p className="text-xs text-muted-foreground">
														@{profile.username}
													</p>
												</div>
											</div>
											<div className="flex group-hover:opacity-100 group-data-[selected=true]:opacity-100 opacity-0 gap-0.5 text-xs transition duration-100 ease-out">
												<span>Visit</span>
												<ExternalArrow className="!size-3 !text-foreground" />
											</div>
										</Link>
									</CommandItem>
								))}
							</CommandGroup>
						)}
					</>
				)}
				{page === "projects" && (
					<CommandGroup heading="Projects">
						<CommandItem onSelect={() => console.log("Project A selected")}>
							<span>Project A</span>
							<CommandShortcut>Demo</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => console.log("Project B selected")}>
							<span>Project B</span>
							<CommandShortcut>Demo</CommandShortcut>
						</CommandItem>
						<CommandItem
							onSelect={() => setPages([...pages, "create-project"])}
						>
							<span>Create new project...</span>
						</CommandItem>
					</CommandGroup>
				)}
				{page === "teams" && (
					<CommandGroup heading="Teams">
						<CommandItem onSelect={() => console.log("Team 1 selected")}>
							<span>Team Alpha</span>
							<CommandShortcut>Demo</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => console.log("Team 2 selected")}>
							<span>Team Beta</span>
							<CommandShortcut>Demo</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => setPages([...pages, "join-team"])}>
							<span>Join a team...</span>
						</CommandItem>
					</CommandGroup>
				)}
				{page === "settings" && (
					<CommandGroup heading="Settings">
						<CommandItem onSelect={() => console.log("Profile settings")}>
							<span>Profile settings</span>
						</CommandItem>
						<CommandItem onSelect={() => console.log("Account settings")}>
							<span>Account settings</span>
						</CommandItem>
						<CommandItem onSelect={() => setPages([...pages, "theme"])}>
							<span>Theme...</span>
						</CommandItem>
					</CommandGroup>
				)}
				{page === "create-project" && (
					<CommandGroup heading="Create Project">
						<CommandItem onSelect={() => console.log("Empty project")}>
							<span>Empty project</span>
						</CommandItem>
						<CommandItem onSelect={() => console.log("From template")}>
							<span>From template</span>
						</CommandItem>
						<CommandItem onSelect={() => console.log("Import repository")}>
							<span>Import repository</span>
						</CommandItem>
					</CommandGroup>
				)}
				{page === "join-team" && (
					<CommandGroup heading="Join Team">
						<CommandItem onSelect={() => console.log("By invitation")}>
							<span>By invitation code</span>
						</CommandItem>
						<CommandItem onSelect={() => console.log("Public teams")}>
							<span>Browse public teams</span>
						</CommandItem>
					</CommandGroup>
				)}
				{page === "theme" && (
					<CommandGroup heading="Theme">
						<CommandItem onSelect={() => console.log("Light theme")}>
							<span>Light</span>
						</CommandItem>
						<CommandItem onSelect={() => console.log("Dark theme")}>
							<span>Dark</span>
						</CommandItem>
						<CommandItem onSelect={() => console.log("System theme")}>
							<span>System</span>
						</CommandItem>
					</CommandGroup>
				)}
			</CommandList>
			<Separator />
			<div className="flex justify-between p-1 items-center">
				<button
					type="button"
					onClick={handleClose}
					className="text-muted-foreground flex items-center gap-1.5 text-xs hover:bg-accent px-2 py-1.5 rounded-sm h-7 transition-colors duration-200 ease-out"
				>
					<CommandShortcut>Esc</CommandShortcut>
					<span className="leading-none">{aiMode ? "Exit" : "Close"}</span>
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
