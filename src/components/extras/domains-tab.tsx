"use client";

import { Check, Copy, Eye, EyeOff, Loader, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProfilePreferences } from "@/app/generated/prisma";
import { FontFamily } from "@/app/generated/prisma";
import { cn } from "@/lib/utils";
import { ExternalArrow } from "../icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

interface DomainsTabProps {
	profilePreferences: ProfilePreferences;
	onSubmit: (data: ProfilePreferences) => Promise<void>;
	isSubmitting: boolean;
	onProfilePreferencesUpdate: (profilePreferences: ProfilePreferences) => void;
	username: string;
}

export default function DomainsTab({
	profilePreferences,
	onProfilePreferencesUpdate,
	username,
}: DomainsTabProps) {
	const [urlCopied, setUrlCopied] = useState(false);

	useEffect(() => {
		if (urlCopied) {
			const timeout = setTimeout(() => {
				setUrlCopied(false);
			}, 2000);

			return () => clearTimeout(timeout);
		}
	}, [urlCopied]);

	const toggleProfileVisibility = async () => {
		if (!profilePreferences) return;

		try {
			const updatedProfilePreferences = {
				...profilePreferences,
				hidden: !profilePreferences.hidden,
			};

			onProfilePreferencesUpdate(updatedProfilePreferences);

			const response = await fetch("/api/me/profile/preferences", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					hidden: !profilePreferences.hidden,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update profile visibility");
			}
		} catch (_) {
			onProfilePreferencesUpdate(profilePreferences);
		}
	};

	const toggleAllowIndexing = async () => {
		if (!profilePreferences) return;

		try {
			const updatedProfilePreferences = {
				...profilePreferences,
				googleIndexing: !profilePreferences.googleIndexing,
			};

			onProfilePreferencesUpdate(updatedProfilePreferences);

			const response = await fetch("/api/me/profile/preferences", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					googleIndexing: !profilePreferences.googleIndexing,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update profile indexing");
			}
		} catch (_) {
			onProfilePreferencesUpdate(profilePreferences);
		}
	};

	const updateFontFamily = async (font: FontFamily) => {
		if (!profilePreferences || profilePreferences.fontFamily === font) return;

		try {
			const updatedProfilePreferences = {
				...profilePreferences,
				fontFamily: font,
			};

			onProfilePreferencesUpdate(updatedProfilePreferences);

			const response = await fetch("/api/me/profile/preferences", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					fontFamily: font,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update font family");
			}
		} catch (_) {
			onProfilePreferencesUpdate(profilePreferences);
		}
	};

	return (
		<div className="max-h-full overflow-y-auto space-y-8">
			<div className="flex justify-between items-center mb-1">
				<div>
					<h3 className="text-xl">Domains & Publishing</h3>
					<p className="text-sm text-muted-foreground">
						Manage your custom domains and publishing settings
					</p>
				</div>
			</div>

			<ScrollArea className="h-[65dvh] mt-10">
				<div className="space-y-2">
					<Label className="text-foreground">Published URL</Label>
					<p className="text-sm text-muted-foreground">
						Your published URL can be used to share your profile with others
					</p>
					<div
						className={cn(
							"pt-2 transition-all duration-200 ease-out",
							profilePreferences.hidden && "opacity-50",
						)}
					>
						{/* URL Input Section */}
						<div className="space-y-2">
							<div className="relative max-w-sm">
								<div className="flex items-center h-9">
									<Input
										id="profile-url"
										disabled={urlCopied || profilePreferences.hidden}
										defaultValue={username || ""}
										className={cn(
											"rounded-r-none focus-visible:ring-0",
											profilePreferences.hidden && "opacity-50",
										)}
									/>
									<div className="border h-full flex items-center px-3 bg-accent/50 rounded-r-lg pointer-events-none pr-10">
										<Label
											htmlFor="profile-url"
											className="font-mono text-sm tracking-tighter"
										>
											spaces.cv
										</Label>
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className={cn(
										"absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md",
										urlCopied && "!opacity-100",
									)}
									disabled={urlCopied || profilePreferences.hidden}
									onClick={() => {
										navigator.clipboard.writeText(
											`${process.env.NEXT_PUBLIC_APP_DOMAIN}/${username}`,
										);
										setUrlCopied(true);
									}}
								>
									{urlCopied ? (
										<Check className="text-emerald-400 size-3.5" />
									) : (
										<Copy className="size-3.5" />
									)}
								</Button>
							</div>

							<div className="text-xs text-muted-foreground ml-3 flex-nowrap flex whitespace-pre items-end">
								{profilePreferences.hidden ? (
									<p>Your public profile is hidden</p>
								) : (
									<>
										It&apos;s available at{" "}
										<Link
											prefetch={false}
											href={`https://${process.env.NEXT_PUBLIC_APP_DOMAIN}/${username}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-foreground flex items-start gap-0.5 font-mono hover:underline underline-offset-2 duration-200 ease-out"
										>
											{process.env.NEXT_PUBLIC_APP_DOMAIN}/{username}
											<ExternalArrow className="size-3" />
										</Link>
									</>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex items-center gap-4 mt-3">
								<button
									type="button"
									disabled
									className="disabled:opacity-25 hover:cursor-default flex items-center gap-1.5 cursor-pointer text-[13px] opacity-50 hover:opacity-100 transition ease-out duration-100"
								>
									<Plus className="size-3" />
									Add custom domain
								</button>
								<Separator orientation="vertical" className="min-h-4" />
								<button
									type="button"
									className="flex items-center gap-1.5 cursor-pointer text-[13px] opacity-50 hover:opacity-100 transition ease-out duration-100"
									onClick={toggleProfileVisibility}
								>
									{profilePreferences.hidden ? (
										<>
											<Eye className="size-3" />
											Show profile
										</>
									) : (
										<>
											<EyeOff className="size-3" />
											Hide profile
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className="mt-8 flex items-center justify-between">
					<div className="space-y-2">
						<Label className="text-foreground">Allow indexing</Label>
						<p className="text-sm text-muted-foreground">
							Allow search engines to index your public profile
						</p>
					</div>
					<Switch
						checked={profilePreferences.googleIndexing}
						onCheckedChange={toggleAllowIndexing}
					/>
				</div>
				<div className="mt-8 space-y-2">
					<Label className="text-foreground">Font Family</Label>
					<p className="text-sm text-muted-foreground">
						Change the font family shown on{" "}
						<span className="text-foreground">
							{username}.{process.env.NEXT_PUBLIC_APP_DOMAIN}
						</span>
					</p>
					<div className="flex items-center gap-5 pt-2 pb-2 px-1">
						{Object.values(FontFamily).map((font) => {
							const fontName = font.toUpperCase() as FontFamily;

							return (
								<div
									key={font}
									className="space-y-1.5 flex flex-col items-center"
								>
									<button
										type="button"
										onClick={() => updateFontFamily(font as FontFamily)}
										className={cn(
											"transition-all duration-200 ease-out bg-input/30 border aspect-square w-17 rounded-2xl flex items-center justify-center relative",
											font === profilePreferences.fontFamily
												? "ring-2 ring-primary/50 ring-offset-background shadow-sm"
												: "hover:bg-input/15 hover:shadow-inner text-foreground/75 hover:text-foreground",
										)}
									>
										<span
											className={cn(
												"text-xl",
												font === FontFamily.SANS && "font-sans",
												font === FontFamily.SERIF && "font-serif",
												font === FontFamily.MONO && "font-mono",
											)}
										>
											Aa
										</span>
									</button>
									<Label className="text-sm text-foreground">
										{fontName.toLowerCase().charAt(0).toUpperCase() +
											fontName.toLowerCase().slice(1)}
									</Label>
								</div>
							);
						})}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
