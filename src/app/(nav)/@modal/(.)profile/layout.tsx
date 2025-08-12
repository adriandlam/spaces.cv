"use client";

import { DndContext } from "@dnd-kit/core";

export default function ProfileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <DndContext>{children}</DndContext>;
}
