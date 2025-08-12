"use client";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function HomeHeader() {
	const router = useRouter();
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
			<Button size="sm" className="ml-auto" asChild>
				<Link href="/sign-in">Get Started</Link>
			</Button>
		</header>
	);
}
