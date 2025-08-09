"use client";

import { Home, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import AuthDialog from "./auth-dialog";
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
		icon: User,
	},
];

export default function Nav() {
	const pathname = usePathname();
	const { data: session, isPending } = useSession();

	return (
		<nav className="h-screen border-r px-3 flex justify-center items-center flex-col gap-6">
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
		</nav>
	);
}
