"use client";

import { Check, Copy, EyeOff, Loader, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ExternalArrow } from "../icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function DomainsTab() {
	const { data: session, isPending } = useSession();

	const [urlCopied, setUrlCopied] = useState(false);

	useEffect(() => {
		if (urlCopied) {
			const timeout = setTimeout(() => {
				setUrlCopied(false);
			}, 3000);

			return () => clearTimeout(timeout);
		}
	}, [urlCopied]);

	if (isPending)
		return (
			<div
				key="loading"
				className="fixed inset-0 flex justify-center items-center h-full gap-2"
			>
				<Loader className="size-4 animate-spin text-muted-foreground" />
				<p className="text-sm text-muted-foreground">Loading profile...</p>
			</div>
		);

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
					<div className="pt-2">
						{/* URL Input Section */}
						<div className="space-y-2">
							<div className="relative max-w-sm">
								<div className="flex items-center h-9">
									<Input
										id="profile-url"
										disabled={urlCopied}
										defaultValue={session?.user?.username || ""}
										className="rounded-r-none focus-visible:ring-0"
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
									disabled={urlCopied}
									onClick={() => {
										navigator.clipboard.writeText(
											`${session?.user?.username}.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
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
								It&apos;s available at{" "}
								<Link
									prefetch={false}
									href={`https://${session?.user?.username}.${process.env.NEXT_PUBLIC_APP_DOMAIN}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-foreground flex items-start gap-0.5 font-mono hover:underline underline-offset-2 duration-200 ease-out"
								>
									{session?.user?.username}.{process.env.NEXT_PUBLIC_APP_DOMAIN}
									<ExternalArrow className="size-3" />
								</Link>
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
								>
									<EyeOff className="size-3" />
									Hide profile
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
					<Switch />
				</div>
				<div className="mt-8 space-y-2">
					<Label className="text-foreground">Font Family</Label>
					<p className="text-sm text-muted-foreground">
						Change the font family shown on{" "}
						<span className="text-foreground">
							{session?.user?.username}.{process.env.NEXT_PUBLIC_APP_DOMAIN}
						</span>
					</p>
					<div className="flex items-center gap-5 pt-2">
						{["sans", "serif", "mono"].map((font) => (
							<div
								key={font}
								className="space-y-1.5 flex flex-col items-center"
							>
								<button
									type="button"
									className={cn(
										"bg-input/30 border aspect-square w-18 rounded-2xl flex items-center justify-center",
										font === "sans" && "border-primary/50 border-2",
									)}
								>
									<span
										className={cn(
											"text-xl",
											font === "sans" && "font-sans",
											font === "serif" && "font-serif",
											font === "mono" && "font-mono",
										)}
									>
										Aa
									</span>
								</button>
								<Label className="text-sm text-foreground">
									{font.charAt(0).toUpperCase() + font.slice(1)}
								</Label>
							</div>
						))}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}
