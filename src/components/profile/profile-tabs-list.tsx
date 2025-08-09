"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Info } from "lucide-react";
import * as React from "react";
import { SortableTab } from "@/components/sortable-tab";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ExternalArrow } from "../icons";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

const defaultProfileTabs = [
	{ id: "general", label: "General" },
	{ id: "experience", label: "Experience" },
	{ id: "education", label: "Education" },
	{ id: "projects", label: "Projects" },
	{ id: "contacts", label: "Contact" },
] as const;

export type ProfileTab = (typeof defaultProfileTabs)[number]["id"];

interface ProfileTabsListProps {
	isLoading: boolean;
	activeTab: ProfileTab;
	onTabChange: (tabId: ProfileTab) => void;
	sectionOrder: string[];
	onDragEnd: (event: DragEndEvent) => void;
}

export default function ProfileTabsList({
	isLoading,
	activeTab,
	onTabChange,
	sectionOrder,
	onDragEnd,
}: ProfileTabsListProps) {
	const { data: session } = useSession();

	// Create ordered profile tabs based on user's section order
	const profileTabs = React.useMemo(() => {
		const orderedTabs: (typeof defaultProfileTabs)[number][] = [
			defaultProfileTabs[0],
		]; // Always keep "general" first

		if (sectionOrder.length > 0) {
			sectionOrder.forEach((sectionId: string) => {
				const tab = defaultProfileTabs.find((t) => t.id === sectionId);
				if (tab && tab.id !== "general") {
					orderedTabs.push(tab);
				}
			});
		} else {
			// Fallback to default order if no section order set
			orderedTabs.push(...defaultProfileTabs.slice(1));
		}

		return orderedTabs;
	}, [sectionOrder]);

	return (
		<div className="h-full space-y-3 w-48">
			<div className="flex justify-between items-center">
				<Label className="text-sm opacity-75">Profile</Label>
				<Link href={`/profile/${session?.user?.username}`}>
					<button
						type="button"
						className="flex items-start gap-1 text-xs hover:bg-accent px-2.5 py-1 rounded-md transition-all duration-200 ease-out"
					>
						Visit
						<ExternalArrow className="size-2.5 mt-0.5" />
					</button>
				</Link>
			</div>
			{!isLoading && (
				<DndContext
					collisionDetection={closestCenter}
					onDragEnd={onDragEnd}
					modifiers={[restrictToVerticalAxis]}
				>
					<SortableContext
						items={sectionOrder}
						strategy={verticalListSortingStrategy}
					>
						<ul className="space-y-1">
							{profileTabs.map((tab) => {
								const isActive = activeTab === tab.id;
								return (
									<li key={tab.id}>
										<SortableTab
											id={tab.id}
											label={tab.label}
											isActive={isActive}
											onClick={() => onTabChange(tab.id)}
											isDraggable={tab.id !== "general"}
										/>
									</li>
								);
							})}
						</ul>
					</SortableContext>
				</DndContext>
			)}
		</div>
	);
}

export { defaultProfileTabs };
