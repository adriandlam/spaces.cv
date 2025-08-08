"use client";

import * as React from "react";
import { SortableTab } from "@/components/sortable-tab";
import { Label } from "@/components/ui/label";
import { closestCenter, DragEndEvent, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const defaultProfileTabs = [
  { id: "general", label: "General" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
] as const;

export type ProfileTab = (typeof defaultProfileTabs)[number]["id"];

interface ProfileTabsListProps {
  activeTab: ProfileTab;
  onTabChange: (tabId: ProfileTab) => void;
  sectionOrder: string[];
  onDragEnd: (event: DragEndEvent) => void;
}

export function ProfileTabsList({
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
      <Label className="text-sm opacity-75">Profile</Label>
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
    </div>
  );
}

export { defaultProfileTabs };