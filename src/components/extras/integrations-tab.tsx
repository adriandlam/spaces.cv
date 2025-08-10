"use client";

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

			<ScrollArea className="h-[65dvh] mt-8">hi</ScrollArea>
		</div>
	);
}
