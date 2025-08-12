"use client";

import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ExportTab() {
	return (
		<div className="max-h-full overflow-y-auto space-y-8">
			<div className="flex justify-between items-center mb-1">
				<div>
					<h3 className="text-xl">Export</h3>
					<p className="text-sm text-muted-foreground">
						Export your profile data in various formats
					</p>
				</div>
			</div>

			<ScrollArea className="h-[65dvh] mt-10">
				<div className="space-y-2">
					<Label className="text-foreground">Published URL</Label>
					<p className="text-sm text-muted-foreground">
						Your published URL can be used to share your profile with others
					</p>
				</div>
				{/* <div className="mt-8 flex items-center justify-between">
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
				</div> */}
			</ScrollArea>
		</div>
	);
}
