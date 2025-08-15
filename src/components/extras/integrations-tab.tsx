"use client";

import { GitHubIcon } from "../icons";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";

export default function IntegrationsTab() {
	return (
		<div className="max-h-full overflow-y-auto space-y-8">
			<div className="flex justify-between items-center mb-1">
				<div>
					<h3 className="text-xl">Integrations</h3>
					<p className="text-sm text-muted-foreground">
						Unlock full functionality by connecting your profile to third-party
						services
					</p>
				</div>
			</div>

			{/* <ScrollArea className="h-[65dvh] mt-8">
				<div className="space-y-3">
					<GitHubIcon className="size-4" />
					<Label>GitHub</Label>
					<p>Connect your GitHub account</p>
				</div>
			</ScrollArea> */}
		</div>
	);
}
