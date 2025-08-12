"use client";

import type { Session } from "better-auth";
import { AnimatePresence, motion } from "framer-motion";
import {
	Ban,
	Bookmark,
	ChevronDown,
	ChevronUp,
	Coffee,
	Flag,
	Forward,
	Mail,
	MoreHorizontal,
	Plus,
	Share,
	SmilePlus,
	Trash,
	User,
} from "lucide-react";
import Link from "next/link";
import normalizeUrl from "normalize-url";
import { useState } from "react";
import { FontFamily } from "@/app/generated/prisma";
import { cn } from "@/lib/utils";
import type { PublicProfile } from "@/types/profile";
import { ExternalArrow, getContactIcon } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

import { contactTypeLabels } from "./contacts-tab";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "../ui/dropdown-menu";

export default function ProfilePage({
	profile,
	session,
}: {
	profile: PublicProfile;
	session?: Session | null;
}) {
	const [showUsername, setShowUsername] = useState<boolean | null>(null);

	return (
		<div
			className={cn(
				profile.profilePreferences.fontFamily === FontFamily.SERIF &&
					"font-serif",
				profile.profilePreferences.fontFamily === FontFamily.SANS &&
					"font-sans",
				profile.profilePreferences.fontFamily === FontFamily.MONO &&
					"font-mono",
			)}
		>
			<ProfileActions contactHref={profile?.contacts[0]?.href || ""} />
			{/* {session && session?.userId !== profile?.id && <ProfileActions />} */}
			<motion.div
				className="space-y-10"
				initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
				animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
				exit={{ opacity: 0, y: 15, filter: "blur(10px)" }}
				transition={{ duration: 0.2, ease: "easeOut" }}
			>
				<div className="flex items-center gap-4">
					{session && (
						<div className="relative">
							<Avatar className={cn("size-20", !profile?.image && "border")}>
								{profile?.image && (
									<AvatarImage src={profile?.image} alt={profile?.name} />
								)}
								<AvatarFallback className="text-xl tracking-wider uppercase">
									{profile?.name.split(" ").map((name) => name.charAt(0))}
								</AvatarFallback>
							</Avatar>
							<button
								type="button"
								className="absolute bottom-1 right-1 bg-muted rounded-full flex items-center justify-center p-0.5 hover:bg-accent hover:cursor-pointer duration-200 ease-out"
							>
								<SmilePlus className="size-5 opacity-50" />
							</button>
						</div>
					)}
					<div className="">
						<button
							type="button"
							className="cursor-default relative h-7 inline-flex border-none bg-transparent p-0 text-left"
							onMouseEnter={() => setShowUsername(true)}
							onMouseLeave={() => setShowUsername(false)}
						>
							<AnimatePresence mode="wait">
								{!showUsername ? (
									<motion.h1
										key="name"
										initial={
											showUsername === null
												? false
												: { opacity: 0, y: -10, filter: "blur(8px)" }
										}
										animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
										exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
										transition={{ duration: 0.15, ease: "easeOut" }}
										className="text-xl flex items-center"
									>
										{profile?.name}
									</motion.h1>
								) : (
									<motion.p
										key="username"
										initial={
											showUsername === null
												? false
												: { opacity: 0, y: 10, filter: "blur(8px)" }
										}
										animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
										exit={{ opacity: 0, y: 10, filter: "blur(8px)" }}
										transition={{ duration: 0.15, ease: "easeOut" }}
										className="text-xl flex items-center"
									>
										@{profile?.username}
									</motion.p>
								)}
							</AnimatePresence>
						</button>
						<p className="text-muted-foreground lowercase">
							{profile?.title} in {profile?.location}
						</p>
						{profile?.website && (
							<Link
								target="_blank"
								rel="noopener noreferrer"
								href={normalizeUrl(profile?.website, { forceHttps: true })}
								className="inline-flex gap-0.5 text-sm opacity-50 hover:underline underline-offset-2 hover:opacity-100 duration-200 ease-out"
							>
								{normalizeUrl(profile?.website, {
									stripWWW: true,
									stripProtocol: true,
								})}
								<ExternalArrow className="size-3 mt-0.5" />
							</Link>
						)}
					</div>
				</div>
				{profile?.about && (
					<motion.div
						className="space-y-4"
						initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						exit={{ opacity: 0, y: 10, filter: "blur(8px)" }}
						transition={{ delay: 0.05, duration: 0.15, ease: "easeOut" }}
					>
						<Label className="text-foreground">About</Label>
						<p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
							{profile?.about}
						</p>
					</motion.div>
				)}
				{profile?.profileOrder.map((section) => {
					if (section === "general") return null;

					const sectionData = profile?.[section as keyof PublicProfile];
					const sectionLength = Array.isArray(sectionData)
						? sectionData.length
						: 0;

					if (!sectionLength) return null;

					return (
						<motion.div
							key={section}
							className="space-y-4"
							initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
							animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							exit={{ opacity: 0, y: 10, filter: "blur(8px)" }}
							transition={{ delay: 0.1, duration: 0.15, ease: "easeOut" }}
						>
							<Label className="text-foreground">
								{section.charAt(0).toUpperCase() + section.slice(1)}
							</Label>
							<div className="space-y-4">
								{section === "education" &&
									profile?.education.map((edu) => (
										<div key={edu.id} className="flex gap-2">
											<div className="flex flex-col opacity-50 w-40 mt-1">
												<p className="text-sm">
													{edu.from} — {edu.to}
												</p>
											</div>
											<div className="space-y-2">
												<Link
													href={edu.url || ""}
													className="inline-flex gap-0.5 text-sm opacity-80 hover:underline underline-offset-3 hover:opacity-100 duration-200 ease-out"
												>
													{edu.institution}
													<ExternalArrow className="size-3 mt-0.5" />
												</Link>
												<p className="text-muted-foreground opacity-75 text-sm">
													{edu.fieldOfStudy}, {edu.degree}
												</p>
											</div>
											<p className="text-sm ml-auto mt-1 opacity-50">
												{edu.location}
											</p>
										</div>
									))}
								{section === "contacts" &&
									profile?.contacts.map((contact) => (
										<div key={contact.id} className="flex items-center gap-2">
											<div className="flex items-center gap-2 opacity-50 w-40">
												{getContactIcon(contact.type)}
												<p className="text-sm">
													{contactTypeLabels[contact.type]}
												</p>
											</div>
											<Link
												href={contact.href}
												className="inline-flex gap-0.5 text-sm opacity-80 hover:underline underline-offset-3 hover:opacity-100 duration-200 ease-out"
											>
												{contact.value}
												<ExternalArrow className="size-3 mt-0.5" />
											</Link>
										</div>
									))}
							</div>
						</motion.div>
					);
				})}

				{/* // 	case "contacts":
					// 		return (
					// 			<div key={section} className="space-y-6">
					// 				<Label className="text-foreground">Contact</Label>
					// 				<div className="space-y-4">
					// 					{profile?.contacts.map((contact) => (
					// 						<div key={contact.id} className="flex items-center gap-2">
					// 							<div className="flex items-center gap-2 opacity-50 w-40">
					// 								{getContactIcon(contact.type)}
					// 								<p className="text-sm">
					// 									{contactTypeLabels[contact.type]}
					// 								</p>
					// 							</div>
					// 							<Link
					// 								href={contact.href}
					// 								className="inline-flex gap-0.5 text-sm opacity-80 hover:underline underline-offset-3 hover:opacity-100 duration-200 ease-out"
					// 							>
					// 								{contact.value}
					// 								<ExternalArrow className="size-3 mt-0.5" />
					// 							</Link>
					// 						</div>
					// 					))}
					// 				</div>
					// 			</div>
					// 		);
					// } */}
			</motion.div>
		</div>
	);
}

function ProfileActions({ contactHref }: { contactHref: string }) {
	return (
		<div className="h-10 border border-input/25 fixed flex items-center gap-1 bottom-3 left-1/2 -translate-x-1/2 bg-accent/75 backdrop-blur-sm p-0.5 rounded-full shadow-lg">
			<Button size="sm" className="hover:cursor-pointer">
				<User />
				Follow
			</Button>
			<Button
				size="sm"
				variant="ghost"
				className="rounded-full !text-foreground opacity-100 hover:!bg-background hover:cursor-pointer"
				asChild
			>
				<Link href={contactHref} prefetch={false}>
					<Coffee />
					Coffee Chat
				</Link>
			</Button>
			<Separator orientation="vertical" className="max-h-4 bg-input/75 mx-1" />
			<div className="flex items-center gap-1.5">
				<Button
					variant="ghost"
					className="rounded-full w-8 h-8 hover:!bg-background hover:text-blue-600 hover:cursor-pointer"
				>
					<Plus />
				</Button>
				<span className="text-xs">10</span>
				<Button
					variant="ghost"
					className="rounded-full w-8 h-8 hover:!bg-background hover:text-orange-600 hover:cursor-pointer"
				>
					<Trash />
				</Button>
			</div>
			<Separator orientation="vertical" className="max-h-4 bg-input/75" />
			<div className="flex items-center">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size="icon"
							variant="ghost"
							className="hover:!bg-background hover:cursor-pointer h-8 w-8 rounded-full"
						>
							<MoreHorizontal />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem>
							<Forward className="size-3.5" />
							Share Profile
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="[&_svg]:!text-orange-400 hover:[&_svg]:!text-orange-400">
							<Flag className="size-3.5" />
							Report Profile
						</DropdownMenuItem>
						<DropdownMenuItem className="[&_svg]:!text-destructive hover:[&_svg]:!text-destructive">
							<Ban className="size-3.5" />
							Block User
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
