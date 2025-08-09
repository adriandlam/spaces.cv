"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";

export default function HomeHeader() {
	const router = useRouter();
	const { data: session } = useSession();

	const pathname = usePathname();

	if (pathname.includes("/profile/")) {
		return null;
	}

	return (
		<header className="flex justify-center items-center">
			<ul className="flex gap-8 text-sm ml-auto">
				<li className="opacity-70 hover:opacity-100 transition-opacity">
					<Link href="/">About</Link>
				</li>
				<li className="opacity-70 hover:opacity-100 transition-opacity">
					<Link href="/">Features</Link>
				</li>
			</ul>
			{session ? (
				<Button
					className="ml-auto font-normal"
					variant="ghost"
					size="sm"
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
					Sign Out
				</Button>
			) : (
				<Button className="ml-auto" asChild>
					<Link href="/sign-in">Get Started</Link>
				</Button>
			)}
		</header>
	);
}
