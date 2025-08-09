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
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const defaultProfileTabs = [
	{ id: "general", label: "General" },
	{ id: "experience", label: "Experience" },
	{ id: "education", label: "Education" },
	{ id: "projects", label: "Projects" },
] as const;

export type ProfileTab = (typeof defaultProfileTabs)[number]["id"];

interface ProfileTabsListProps {
	isLoading: boolean;
	activeTab: ProfileTab;
	onTabChange: (tabId: ProfileTab) => void;
	sectionOrder: string[];
	onDragEnd: (event: DragEndEvent) => void;
}

export function ProfileTabsList({
	isLoading,
	activeTab,
	onTabChange,
	sectionOrder,
	onDragEnd,
}: ProfileTabsListProps) {
	// Create ordered profile tabs based on user's section order
	const profileTabs = React.useMemo(() => {
		const orderedTabs: (typeof defaultProfileTabs)[number][] = [
			defaultProfileTabs[0],
		]; // Always keep "general" first

		if (sectionOrder.length > 0) {
			sectionOrder.forEach((sectionId: string) => {
				const tab = defaultProfileTabs.find((t) => t.id === sectionId);
				if (tab) {
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
				<Tooltip>
					<TooltipTrigger>
						<Info className="size-3 opacity-75 hover:opacity-100 text-muted-foreground" />
					</TooltipTrigger>
					<TooltipContent>
						<p>Your profile is public and displayed in the order you specify</p>
					</TooltipContent>
				</Tooltip>
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
