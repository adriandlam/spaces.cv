"use client";

import { Check, Copy, Gift } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@/app/generated/prisma";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

export default function HomeHeader() {
	const { data: session } = useSession();

	const pathname = usePathname();

	if (
		pathname.includes("/profile/") ||
		pathname.includes(`.${process.env.NEXT_PUBLIC_APP_DOMAIN}`)
	) {
		return null;
	}

	return (
		<header className="flex justify-center items-center">
			{/* <ul className="flex gap-8 text-sm ml-auto"> */}
			<NavigationMenu className="ml-auto">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Features</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
								<li className="row-span-3">
									<NavigationMenuLink asChild>
										<Link
											className="from-accent/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
											href="/"
										>
											<div className="mt-4 mb-2 text-lg font-medium">
												shadcn/ui
											</div>
											<p className="text-muted-foreground text-sm leading-tight">
												Beautifully designed components built with Tailwind CSS.
											</p>
										</Link>
									</NavigationMenuLink>
								</li>
								{/* <ListItem href="/docs" title="Introduction">
									Re-usable components built using Radix UI and Tailwind CSS.
								</ListItem>
								<ListItem href="/docs/installation" title="Installation">
									How to install dependencies and structure your app.
								</ListItem>
								<ListItem href="/docs/primitives/typography" title="Typography">
									Styles for headings, paragraphs, lists...etc
								</ListItem> */}
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							asChild
							className="hover:bg-transparent opacity-70 hover:opacity-100"
						>
							<Link href="/about">About</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
			{/* <li className="opacity-70 hover:opacity-100 transition-opacity">
					<Link href="/">About</Link>
				</li>
				<li className="opacity-70 hover:opacity-100 transition-opacity">
					<Link href="/">Features</Link>
				</li>
			</ul> */}
			<div className="ml-auto">
				{session ? (
					<InviteFriendDialog user={session.user as User} />
				) : (
					<Button size="sm" asChild>
						<Link href="/sign-in">Get Started</Link>
					</Button>
				)}
			</div>
		</header>
	);
}

function InviteFriendDialog({ user }: { user: User }) {
	const [urlCopied, setUrlCopied] = useState(false);

	useEffect(() => {
		if (urlCopied) {
			const timeout = setTimeout(() => {
				setUrlCopied(false);
			}, 2000);

			return () => clearTimeout(timeout);
		}
	}, [urlCopied]);

	const url = `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}/join/${user.username}`;

	const handleCopy = () => {
		navigator.clipboard.writeText(url);
		setUrlCopied(true);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="rounded-full hover:cursor-pointer">
					<Gift />
					Invite a friend
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md w-full py-10">
				<DialogHeader>
					<DialogTitle className="text-center text-2xl">
						Spaces are better with friends.
					</DialogTitle>
					<DialogDescription className="text-center space-y-2">
						<div className="max-w-md mx-auto">
							Invite 5 friends to join Spaces and unlock custom domains for your
							space, and early access pricing (beta pricing forever).
						</div>
					</DialogDescription>
					<div className="w-full max-w-xs mx-auto">
						<div>
							<button
								className="relative group mx-auto w-full mt-4"
								onClick={handleCopy}
								type="button"
							>
								<Input
									readOnly
									value={`${url}aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`}
									className={cn(
										"rounded-lg w-80 pr-20 truncate group-hover:!bg-accent/90 transition-colors duration-200 ease-out focus-visible:ring-0 hover:cursor-pointer text-foreground/75 pointer-events-none border border-input/25",
										urlCopied && "!bg-accent/90",
									)}
								/>
								<div
									className={cn(
										"gap-1.5 absolute right-4 top-1/2 -translate-y-1/2 h-7 pointer-events-none flex items-center justify-center",
										urlCopied && "!opacity-100",
									)}
								>
									{urlCopied ? (
										<>
											<Check className="text-emerald-400 size-3.5" />
											<span className="text-sm text-emerald-400">Copied</span>
										</>
									) : (
										<>
											<Copy className="size-3.5" />
											<span className="text-sm">Copy</span>
										</>
									)}
								</div>
							</button>
							<p className="text-xs text-muted-foreground mt-1.5 text-left text-nowrap">
								This is your unique referral link, share it with your friends
							</p>
						</div>
					</div>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
