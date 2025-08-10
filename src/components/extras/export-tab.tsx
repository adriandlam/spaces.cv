"use client";

import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function ExportTab() {
	return (
		<div className="max-h-full overflow-y-auto space-y-8">
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Label className="text-foreground">Export</Label>
					<Tooltip>
						<TooltipTrigger>
							<Info className="size-3 opacity-50" />
						</TooltipTrigger>
						<TooltipContent>
							<p>Export your profile data in various formats</p>
						</TooltipContent>
					</Tooltip>
				</div>
				<p className="text-sm text-muted-foreground">
					Export your profile information in different formats.
				</p>
			</div>

			<div className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Export options coming soon...
				</p>
			</div>
		</div>
	);
}
