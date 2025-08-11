"use client";

import type { Session } from "better-auth";
import { AnimatePresence, motion } from "framer-motion";
import {
	Bookmark,
	Mail,
	MoreHorizontal,
	Share,
	SmilePlus,
	UserPlus2,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { contactTypeLabels } from "./contacts-tab";

export default function ProfilePage({
	profile,
	session,
}: {
	profile: PublicProfile;
	session: Session | null;
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
			{session?.userId !== profile?.id && <ProfileActions />}
			<motion.div
				className="space-y-10"
				initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
				animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
				exit={{ opacity: 0, y: 15, filter: "blur(10px)" }}
				transition={{ duration: 0.2, ease: "easeOut" }}
			>
				<div className="flex items-center gap-4">
					<div className="relative">
						<Avatar className="size-20 border">
							<AvatarFallback className="text-xl tracking-wider uppercase">
								{profile?.name.split(" ").map((name) => name.charAt(0))}
							</AvatarFallback>
						</Avatar>
						<button
							type="button"
							className="absolute bottom-1 right-1 bg-muted rounded-full flex items-center justify-center shadow-sm"
						>
							<SmilePlus className="size-5 opacity-50" />
						</button>
					</div>
					<div className="">
						<div
							className="cursor-default relative h-7 inline-flex"
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
						</div>
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
					const sectionLength = Array.isArray(sectionData) ? sectionData.length : 0;

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

function ProfileActions() {
	return (
		<div className="border border-input/25 fixed flex items-center gap-1.5 bottom-3 left-1/2 -translate-x-1/2 bg-accent p-0.5 pr-2 rounded-full shadow-lg">
			<Button size="sm" className="mr-1">
				<UserPlus2 />
				Follow
			</Button>
			<Separator orientation="vertical" className="min-h-4 bg-input/75" />
			<Tooltip>
				<TooltipTrigger asChild>
					<Button size="sm" variant="ghost">
						<Bookmark />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Add to bookmarks</p>
				</TooltipContent>
			</Tooltip>
			<Separator orientation="vertical" className="min-h-4 bg-input/75" />
			<div className="flex items-center">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button size="sm" variant="ghost">
							<Mail />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Contact</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button size="sm" variant="ghost">
							<Share />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Share</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button size="sm" variant="ghost">
							<MoreHorizontal />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>More options</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
}
