"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ExperienceTabProps {
	onAddExperience?: () => void;
}

export default function ExperienceTab({ onAddExperience }: ExperienceTabProps) {
	return (
		<div>
			<div className="flex justify-between items-center mb-1">
				<h3 className="text-xl">Work Experience</h3>
				<Button variant="ghost" size="sm" onClick={onAddExperience}>
					<Plus />
					Add Experience
				</Button>
			</div>
		</div>
	);
}
