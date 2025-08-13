"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
	DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function SettingsModal() {
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	return (
		<Dialog
			defaultOpen
			onOpenChange={(open) => {
				if (!open) {
					router.back();
				}
			}}
		>
			<DialogContent
				className="!max-w-md overflow-hidden"
				showCloseButton={false}
			>
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Manage your account settings and preferences
					</DialogDescription>
					{/* <div className="mt-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label className="text-foreground">Delete Account</Label>
								<p className="text-sm text-muted-foreground">
									Permanently delete your account and all associated data
								</p>
							</div>
							<Button variant="destructive">Delete Account</Button>
						</div>
					</div> */}
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
