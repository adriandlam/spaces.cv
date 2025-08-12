"use client";

import { Home, Search, User, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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

	router.prefetch("/search");
	router.prefetch("/profile");

	useHotkeys("slash", () => {
		router.push("/search");
	});

	if (pathname.includes(`.${process.env.NEXT_PUBLIC_APP_DOMAIN}`)) {
		return null;
	}

	return (
		<nav className="sticky top-0 h-screen border-r px-3 flex justify-center items-center flex-col gap-4 py-4">
			<div className="flex flex-col gap-7 flex-1 justify-center">
				{navItems.map((item) => (
					<Tooltip key={item.href}>
						<TooltipTrigger>
							<Link
								href={item.href}
								className={cn(
									"opacity-70 hover:opacity-100 transition-opacity",
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
			<div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button type="button" className="cursor-pointer">
							<Avatar className="size-9 border">
								<AvatarFallback className="text-sm">
									{session?.user.name.split(" ").map((name) => name.charAt(0))}
								</AvatarFallback>
							</Avatar>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem>Invite a friend</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/settings">Settings</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Logout</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</nav>
	);
}
