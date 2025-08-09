import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableTabProps {
	id: string;
	label: string;
	isActive: boolean;
	onClick: () => void;
	isDraggable?: boolean;
}

export function SortableTab({
	id,
	label,
	isActive,
	onClick,
	isDraggable = true,
}: SortableTabProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id, disabled: !isDraggable });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style}>
			<Button
				variant={isActive ? "secondary" : "ghost"}
				size="sm"
				className={cn(
					"w-full justify-start !pl-6 transition-opacity font-normal group",
					isDragging && "!backdrop-blur-sm",
					!isActive && "opacity-50",
				)}
				onClick={onClick}
			>
				{label}
				{isDraggable && (
					<div
						{...attributes}
						{...listeners}
						className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-75 transition-opacity cursor-grab active:cursor-grabbing"
						onClick={(e) => e.stopPropagation()}
						onKeyUp={(e) => e.stopPropagation()}
						tabIndex={0}
					>
						<GripHorizontal className="size-4" />
					</div>
				)}
			</Button>
		</div>
	);
}
