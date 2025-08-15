"use client";

import { Home, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { cn, fetcher } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { ExternalArrow, GitHubIcon } from "./icons";
import { useEffect } from "react";
import { preload } from "swr";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

const navItems = [
	{
		label: "Home",
		href: "/",
		icon: Home,
	},
	{
		label: "Search",
		href: "/search",
		icon: Search,
	},
	{
		label: "Profile",
		href: "/profile",
		icon: UserRound,
	},
];

export default function Nav() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const router = useRouter();

	useEffect(() => {
		// Preload API data using SWR
		if (session?.user) {
			preload("/api/me/profile", fetcher);
			preload("/api/profiles?limit=10", fetcher);
		}
	}, [session?.user]);

	useHotkeys("slash", () => {
		router.push("/search");
	});

	return (
		<nav className="sticky top-0 h-screen border-r border-y px-3 flex justify-center items-center flex-col gap-4 py-4 rounded-r-2xl">
			<div>
				<Button variant="secondary" size="icon" asChild>
					<Link
						target="_blank"
						rel="noopener noreferrer"
						href="https://github.com/adriandlam/spaces.cv"
					>
						<GitHubIcon />
					</Link>
				</Button>
			</div>
			<div className="flex flex-col gap-7 flex-1 justify-center">
				{navItems.map((item) => (
					<Tooltip key={item.href}>
						<TooltipTrigger>
							<Link
								href={item.href}
								prefetch={true}
								className={cn(
									"opacity-50 hover:opacity-100 transition-opacity",
									pathname === item.href && "opacity-100",
								)}
							>
								<item.icon className="size-5 mx-2" strokeWidth={1.5} />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>{item.label}</p>
						</TooltipContent>
					</Tooltip>
				))}
			</div>
			{session && (
				<div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button type="button" className="cursor-pointer">
								<Avatar className="size-9 border">
									{session?.user.image && (
										<AvatarImage src={session.user.image} />
									)}
									<AvatarFallback className="text-sm">
										{session?.user.name
											.split(" ")
											.map((name) => name.charAt(0))}
									</AvatarFallback>
								</Avatar>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							side="right"
							sideOffset={5}
							align="end"
							alignOffset={20}
						>
							<DropdownMenuItem asChild>
								<Link href="/settings">Settings</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="https://github.com/adriandlam/spaces.cv/issues">
									Send feedback
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/terms" className="flex items-start !gap-1">
									Terms of Service <ExternalArrow className="size-3.5" />
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/privacy" className="flex items-start !gap-1">
									Privacy Policy <ExternalArrow className="size-3.5" />
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-destructive hover:!text-destructive"
								onClick={() =>
									signOut({
										fetchOptions: {
											onSuccess: () => {
												router.push("/");
											},
										},
									})
								}
							>
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
		</nav>
	);
}
