"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { X } from "lucide-react";

export default function NotFound() {
	const router = useRouter();

	useHotkeys("esc", () => {
		handleClose();
	});

	const handleClose = () => {
		router.back();
	};

	return (
		<div className="bg-background/50 backdrop-blur-sm fixed inset-0 flex justify-center items-center">
			<div className="absolute top-4 left-4">
				<Button variant="outline" size="sm" onClick={handleClose}>
					<X />
					Close
				</Button>
			</div>
			<div className="max-w-md mx-auto px-6 text-center space-y-6">
				<div className="space-y-2">
					<h1 className="text-6xl tracking-tighter">404</h1>
					<p className="text-xl">This page doesn&apos;t exist</p>
					<p className="text-sm text-muted-foreground">
						Looks like you&apos;ve wandered into the void. The page you&apos;re
						looking for isn&apos;t here-might&apos;ve moved, or never existed at
						all.
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button asChild>
						<Link href="/">Go home</Link>
					</Button>
					<Button asChild variant="secondary">
						<Link href="/search">Search profiles</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
