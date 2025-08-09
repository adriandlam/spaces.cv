"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import type { PublicProfile } from "@/types/profile";
import { Label } from "../ui/label";
import normalizeUrl from "normalize-url";
import Link from "next/link";
import { ExternalArrow, getContactIcon } from "../icons";
import { contactTypeLabels } from "./contacts-tab";

export default function ProfilePage({ username }: { username: string }) {
	const { data, isLoading } = useSWR<{ user: PublicProfile }>(
		`/api/profile?username=${username}`,
		fetcher,
	);

	const profile = data?.user;

	if (isLoading) return <div>Loading...</div>;

	return (
		<div className="space-y-10">
			<div className="flex items-center gap-4">
				<Avatar className="size-20 border">
					<AvatarFallback className="text-xl tracking-wider uppercase">
						{profile?.name.split(" ").map((name) => name.charAt(0))}
					</AvatarFallback>
				</Avatar>
				<div className="">
					<h1 className="text-xl">{profile?.name}</h1>
					<p className="text-muted-foreground">{profile?.title}</p>
					{profile?.website && (
						<Link
							href={normalizeUrl(profile?.website, { forceHttps: true })}
							className="inline-flex gap-0.5 text-sm opacity-50 hover:underline underline-offset-2 hover:opacity-100 duration-200 ease-out"
						>
							{normalizeUrl(profile?.website, {
								stripWWW: true,
								stripProtocol: true,
							})}
							<ExternalArrow className="size-3 mt-0.5" />
						</Link>
					)}
				</div>
			</div>
			{profile?.about && (
				<div>
					<Label>About</Label>
					<p>{profile?.about}</p>
				</div>
			)}
			{profile?.sectionOrder.map((section) => {
				switch (section) {
					case "education":
						return (
							<div key={section} className="space-y-6">
								<Label className="text-foreground">Education</Label>
								<div className="space-y-4">
									{profile?.educations.map((education) => (
										<div key={education.id} className="flex gap-2">
											<div className="flex flex-col opacity-50 w-40 mt-1">
												<p className="text-sm">
													{education.from} — {education.to}
												</p>
											</div>
											<div className="space-y-2">
												<Link
													href={education.url || ""}
													className="inline-flex gap-0.5 text-sm opacity-80 hover:underline underline-offset-3 hover:opacity-100 duration-200 ease-out"
												>
													{education.institution}
													<ExternalArrow className="size-3 mt-0.5" />
												</Link>
												<p className="text-muted-foreground opacity-75 text-sm">
													{education.fieldOfStudy}, {education.degree}
												</p>
											</div>
											<p className="text-sm ml-auto mt-1 opacity-50">
												{education.location}
											</p>
										</div>
									))}
								</div>
							</div>
						);
					case "contacts":
						return (
							<div key={section} className="space-y-6">
								<Label className="text-foreground">Contact</Label>
								<div className="space-y-4">
									{profile?.contacts.map((contact) => (
										<div key={contact.id} className="flex items-center gap-2">
											<div className="flex items-center gap-2 opacity-50 w-40">
												{getContactIcon(contact.type)}
												<p className="text-sm">
													{contactTypeLabels[contact.type]}
												</p>
											</div>
											<Link
												href={contact.href}
												className="inline-flex gap-0.5 text-sm opacity-80 hover:underline underline-offset-3 hover:opacity-100 duration-200 ease-out"
											>
												{contact.value}
												<ExternalArrow className="size-3 mt-0.5" />
											</Link>
										</div>
									))}
								</div>
							</div>
						);
				}
			})}
		</div>
	);
}
