"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Info } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { SortableTab } from "@/components/sortable-tab";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { ExternalArrow } from "../icons";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const defaultProfileTabs = [
	{ id: "general", label: "General" },
	{ id: "experience", label: "Experience" },
	{ id: "education", label: "Education" },
	{ id: "projects", label: "Projects" },
	{ id: "contacts", label: "Contact" },
] as const;

const extrasTabs = [
	{ id: "domains", label: "Domains & Publishing" },
	{ id: "integrations", label: "Integrations" },
	{ id: "export", label: "Export" },
] as const;

export type ProfileTab =
	| (typeof defaultProfileTabs)[number]["id"]
	| (typeof extrasTabs)[number]["id"];

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
		<div className="h-full space-y-6 w-48">
			<div className="space-y-3">
				<Label className="text-sm opacity-75">Profile</Label>
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

			<div className="space-y-3">
				<Label className="text-sm opacity-75">Extras</Label>
				<ul className="space-y-1">
					{extrasTabs.map((tab) => {
						const isActive = activeTab === tab.id;
						return (
							<li key={tab.id}>
								<Button
									variant={isActive ? "secondary" : "ghost"}
									size="sm"
									className={cn(
										"w-full justify-start !pl-6 transition-opacity font-normal",
										!isActive && "opacity-50",
									)}
									onClick={() => onTabChange(tab.id)}
								>
									{tab.label}
								</Button>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}

export { defaultProfileTabs };
