"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "lucide-react";
import {
	notFound,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";
import type {
	ProfilePreferences,
	Contact,
	Education,
	WorkExperience,
} from "@/app/generated/prisma";
import DomainsTab from "@/components/extras/domains-tab";
import ExportTab from "@/components/extras/export-tab";
import IntegrationsTab from "@/components/extras/integrations-tab";
import ContactsTab from "@/components/profile/contacts-tab";
import EducationTab from "@/components/profile/education-tab";
import ExperienceTab from "@/components/profile/experience-tab";
import GeneralTab from "@/components/profile/general-tab";
import { OnboardingStep } from "@/components/profile/onboarding-step";
import type { ProfileTab } from "@/components/profile/profile-tabs-list";
import ProfileTabsList from "@/components/profile/profile-tabs-list";
import ProjectsTab from "@/components/profile/projects-tab";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type {
	ContactFormData,
	EducationFormData,
	ExperienceFormData,
	GeneralFormData,
	ProfileFormData,
	ProjectFormData,
} from "@/types/profile";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export default function ProfileModal() {
	const router = useRouter();

	const { data, mutate, isLoading } = useSWR("/api/me/profile", fetcher, {
		onSuccess: (data) => {
			if (data.user.onboarded) {
				setStep(1);
			} else {
				setStep(0);
			}
		},
	});

	const profile = data?.user;

	const [isOpen, setIsOpen] = useState(true);
	const [step, setStep] = useState(1);
	const [activeTab, setActiveTab] = useState<ProfileTab>("general");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [showProjectForm, setShowProjectForm] = useState(false);
	const [showEducationForm, setShowEducationForm] = useState(false);
	const [showExperienceForm, setShowExperienceForm] = useState(false);
	const [showContactForm, setShowContactForm] = useState(false);
	const [generalFormData, setGeneralFormData] = useState<
		Partial<GeneralFormData>
	>({});
	const [, setProfilePreferences] = useState<ProfilePreferences | undefined>();
	// const [originalPath, setOriginalPath] = useState<string | null>(null);

	const searchParams = useSearchParams();
	const pathname = usePathname();

	const handleTabChange = (tabId: ProfileTab) => {
		setActiveTab(tabId);
		setShowProjectForm(false);
		setShowEducationForm(false);
		setShowExperienceForm(false);
		setShowContactForm(false);
		if (tabId === "general") {
			window.history.pushState(null, "", pathname);
		} else {
			const params = new URLSearchParams(searchParams.toString());
			params.set("tab", tabId);
			window.history.pushState(null, "", `${pathname}?${params.toString()}`);
		}
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const currentOrder = profile?.profileOrder;

		if (!currentOrder) return;

		const oldIndex = currentOrder.indexOf(active.id as string);
		const newIndex = currentOrder.indexOf(over.id as string);

		if (oldIndex === -1 || newIndex === -1) return;

		const newOrder = arrayMove(currentOrder, oldIndex, newIndex);

		mutate(
			{
				user: {
					...profile,
					profileOrder: newOrder,
				},
			},
			false,
		);

		try {
			const response = await fetch("/api/me/profile/section-order", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					profileOrder: newOrder,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update order");
			}
		} catch (_) {
			// Revert on error by revalidating from server
			mutate();
		}
	};

	// useEffect(() => {
	// 	// Capture the original path when modal first opens
	// 	// This should be the underlying page URL without the modal route
	// 	if (!originalPath && pathname) {
	// 		const basePath = pathname.replace(/\/profile$/, "");
	// 		setOriginalPath(basePath || "/");
	// 	}
	// }, [pathname, originalPath]);

	useEffect(() => {
		const tabParam = searchParams.get("tab");
		const validTabs = [
			"general",
			"experience",
			"education",
			"projects",
			"contacts",
			"domains",
			"integrations",
			"export",
		];
		if (tabParam && validTabs.includes(tabParam)) {
			setActiveTab(tabParam as ProfileTab);
		} else if (!tabParam) {
			setActiveTab("general");
		}
	}, [searchParams]);

	useEffect(() => {
		if (profile) {
			setGeneralFormData({
				name: profile.name || "",
				username: profile.username || "",
				title: profile.title || "",
				about: profile.about || "",
				location: profile.location || "",
				website: profile.website || "",
			});
			setProfilePreferences(profile.profilePreferences);
		}
	}, [profile]);

	const onSubmit = async (data: ProfileFormData) => {
		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const response = await fetch("/api/me/profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: data.name,
					username: data.username.toLowerCase(),
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				setSubmitError(result.error || "Failed to update profile");
				return;
			}

			await getSession({
				query: { disableCookieCache: true },
			});

			setStep(1);
		} catch (_) {
			setSubmitError("An unexpected error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (profile?.onboarded) {
			setIsOpen(false);
			// Navigate back to the original path that was captured when modal opened
			// if (originalPath) {
			// 	router.push(originalPath);
			// } else {
			router.push("/");
			// }
		} else {
			setIsOpen(true);
		}
	};

	const onProjectSubmit = async (data: ProjectFormData) => {
		setIsSubmitting(true);

		mutate(
			{
				user: {
					...data,
					...profile,
				},
			},
			false,
		);
		try {
			const response = await fetch("/api/me/profile/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to save project");
			}

			await mutate(
				{
					user: {
						...profile,
						projects: result.projects,
					},
				},
				false,
			);
			setShowProjectForm(false);
		} catch (error) {
			console.error("Error saving project:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onGeneralSubmit = async (data: GeneralFormData) => {
		setIsSubmitting(true);

		mutate(
			{
				user: {
					...data,
					...profile,
				},
			},
			false,
		);

		try {
			const response = await fetch("/api/me/profile/general", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to update profile");
			}
		} catch (error) {
			console.error("Error saving general info:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onEducationSubmit = async (data: EducationFormData) => {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/me/profile/education", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to save education");
			}

			await mutate({
				user: {
					...profile,
					education: result.education,
				},
			});
			setShowEducationForm(false);
		} catch (error) {
			console.error("Error saving education:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onEducationUpdate = async (id: string, updates: Partial<Education>) => {
		if (!profile?.education) return;

		// Optimistic update
		const updatedEducation = profile.education.map((e: Education) =>
			e.id === id ? { ...e, ...updates } : e,
		);

		mutate(
			{
				user: {
					...profile,
					education: updatedEducation,
				},
			},
			false,
		);

		try {
			const response = await fetch("/api/me/profile/education", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, ...updates }),
			});

			if (!response.ok) {
				throw new Error("Failed to update education");
			}
		} catch (error) {
			// Revert on error
			mutate();
			console.error("Error updating education:", error);
		}
	};

	const onEducationDelete = async (id: string) => {
		if (!profile?.education) return;

		// Optimistic update
		const updatedEducation = profile.education.filter(
			(e: Education) => e.id !== id,
		);

		mutate(
			{
				user: {
					...profile,
					education: updatedEducation,
				},
			},
			false,
		);

		try {
			const response = await fetch("/api/me/profile/education", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});

			if (!response.ok) {
				throw new Error("Failed to delete education");
			}

			// Revalidate to ensure consistency
			mutate();
		} catch (error) {
			// Revert on error
			mutate();
			console.error("Error deleting education:", error);
		}
	};

	const onExperienceSubmit = async (data: ExperienceFormData) => {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/me/profile/experience", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to save experience");
			}

			await mutate({
				user: {
					...profile,
					workExperiences: result.experience,
				},
			});
			setShowExperienceForm(false);
		} catch (error) {
			console.error("Error saving experience:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onExperienceUpdate = async (
		id: string,
		updates: Partial<WorkExperience>,
	) => {
		if (!profile?.workExperiences) return;

		// Optimistic update
		const updatedExperiences = profile.workExperiences.map(
			(e: WorkExperience) => (e.id === id ? { ...e, ...updates } : e),
		);

		mutate(
			{
				user: {
					...profile,
					workExperiences: updatedExperiences,
				},
			},
			false,
		);

		try {
			const response = await fetch("/api/me/profile/experience", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, ...updates }),
			});

			if (!response.ok) {
				throw new Error("Failed to update experience");
			}

			// Revalidate to ensure consistency
			mutate();
		} catch (error) {
			// Revert on error
			mutate();
			console.error("Error updating experience:", error);
		}
	};

	const onExperienceDelete = async (id: string) => {
		if (!profile?.workExperiences) return;

		// Optimistic update
		const updatedExperiences = profile.workExperiences.filter(
			(e: WorkExperience) => e.id !== id,
		);

		mutate(
			{
				user: {
					...profile,
					workExperiences: updatedExperiences,
				},
			},
			false,
		);

		try {
			const response = await fetch("/api/me/profile/experience", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});

			if (!response.ok) {
				throw new Error("Failed to delete experience");
			}

			// Revalidate to ensure consistency
			mutate();
		} catch (error) {
			// Revert on error
			mutate();
			console.error("Error deleting experience:", error);
		}
	};

	const onContactSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/me/profile/contacts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to save contact");
			}

			await mutate({
				user: {
					...profile,
					contacts: result.contacts,
				},
			});
			setShowContactForm(false);
		} catch (error) {
			console.error("Error saving contact:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onContactUpdate = async (id: string, updates: Partial<Contact>) => {
		if (!profile?.contacts) return;

		// Optimistic update
		const updatedContacts = profile.contacts.map((c: Contact) =>
			c.id === id ? { ...c, ...updates } : c,
		);

		mutate(
			{
				user: {
					...profile,
					contacts: updatedContacts,
				},
			},
			false,
		);

		try {
			const response = await fetch("/api/me/profile/contacts", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, ...updates }),
			});

			if (!response.ok) {
				throw new Error("Failed to update contact");
			}
		} catch (error) {
			// Revert on error
			mutate();
			console.error("Error updating contact:", error);
		}
	};

	const onContactDelete = async (id: string) => {
		if (!profile?.contacts) return;

		// Optimistic update
		const updatedContacts = profile.contacts.filter(
			(c: Contact) => c.id !== id,
		);

		mutate(
			{
				user: {
					...profile,
					contacts: updatedContacts,
				},
			},
			false,
		);

		try {
			const response = await fetch("/api/me/profile/contacts", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});

			if (!response.ok) {
				throw new Error("Failed to delete contact");
			}
		} catch (error) {
			// Revert on error
			mutate();
			console.error("Error deleting contact:", error);
		}
	};

	const onProfilePreferencesSubmit = async (data: ProfilePreferences) => {
		setIsSubmitting(true);

		mutate(
			{
				user: {
					...data,
					...profile,
				},
			},
			false,
		);
		try {
			const response = await fetch("/api/me/profile/profile-preferences", {
				method: "PUT",

				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to update profile preferences");
			}
		} catch (error) {
			console.error("Error saving profile preferences:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSaveChanges = async () => {
		switch (activeTab) {
			case "general": {
				const generalForm = document.querySelector(
					"#general-form",
				) as HTMLFormElement;
				if (generalForm) {
					generalForm.requestSubmit();
				}
				break;
			}
			case "education": {
				const educationForm = document.querySelector(
					"#education-form",
				) as HTMLFormElement;
				if (educationForm && showEducationForm) {
					educationForm.requestSubmit();
				}
				break;
			}
			case "projects": {
				const projectForm = document.querySelector(
					"#project-form",
				) as HTMLFormElement;
				if (projectForm && showProjectForm) {
					projectForm.requestSubmit();
				}
				break;
			}
			case "contacts": {
				const contactForm = document.querySelector(
					"#contact-form",
				) as HTMLFormElement;
				if (contactForm && showContactForm) {
					contactForm.requestSubmit();
				}
				break;
			}
			case "experience":
				break;
			default:
				console.log("No specific save action for tab:", activeTab);
		}
	};

	const resetForm = () => {
		setSubmitError(null);
		setIsSubmitting(false);
		setShowProjectForm(false);
		setShowEducationForm(false);
		setShowExperienceForm(false);
		setShowContactForm(false);
	};

	if (!profile && !isLoading) {
		notFound();
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (open) {
					handleClose();
				} else {
					if (!open) {
						resetForm();
					}
					handleClose();
				}
			}}
		>
			<DialogContent
				className={cn(
					"w-full overflow-hidden transition-all duration-300 ease-in-out",
					step === 1 ? "!max-w-4xl !h-[85dvh]" : "!max-w-md h-[20rem]",
				)}
				showCloseButton={false}
			>
				{isLoading && (
					<div className="flex justify-center items-center h-full gap-1.5 text-sm text-muted-foreground">
						<Loader className="size-4 animate-spin" />
						Loading profile...
					</div>
				)}
				<AnimatePresence mode="wait">
					{step === 0 && (
						<OnboardingStep
							onSubmit={onSubmit}
							isSubmitting={isSubmitting}
							submitError={submitError}
						/>
					)}
					{step === 1 && profile && (
						<motion.div
							key="profile"
							initial={{ x: step !== 1 ? "-125%" : 0 }}
							animate={{ x: 0 }}
							transition={{
								duration: 0.2,
								ease: "easeOut",
							}}
							className="relative"
						>
							<div className="flex gap-4 h-full">
								<ProfileTabsList
									isLoading={false}
									activeTab={activeTab}
									onTabChange={handleTabChange}
									profileOrder={profile?.profileOrder}
									onDragEnd={handleDragEnd}
								/>
								<Separator orientation="vertical" />
								<div className="flex-1 px-4 relative">
									{activeTab === "general" && (
										<GeneralTab
											onSubmit={onGeneralSubmit}
											isSubmitting={isSubmitting}
											defaultValues={generalFormData}
											userImage={profile.image ?? undefined}
											userName={profile.name ?? undefined}
										/>
									)}
									{activeTab === "experience" && (
										<ExperienceTab
											experiences={profile?.workExperiences}
											showExperienceForm={showExperienceForm}
											onShowExperienceForm={setShowExperienceForm}
											onSubmit={onExperienceSubmit}
											isSubmitting={isSubmitting}
											onExperienceUpdate={onExperienceUpdate}
											onExperienceDelete={onExperienceDelete}
										/>
									)}
									{activeTab === "education" && (
										<EducationTab
											education={profile?.education}
											showEducationForm={showEducationForm}
											onShowEducationForm={setShowEducationForm}
											onSubmit={onEducationSubmit}
											isSubmitting={isSubmitting}
											onEducationUpdate={onEducationUpdate}
											onEducationDelete={onEducationDelete}
										/>
									)}
									{activeTab === "projects" && (
										<ProjectsTab
											projects={profile?.projects}
											showProjectForm={showProjectForm}
											onShowProjectForm={setShowProjectForm}
											onSubmit={onProjectSubmit}
											isSubmitting={isSubmitting}
										/>
									)}
									{activeTab === "contacts" && (
										<ContactsTab
											contacts={profile?.contacts}
											showContactForm={showContactForm}
											onShowContactForm={setShowContactForm}
											onSubmit={onContactSubmit}
											isSubmitting={isSubmitting}
											onContactUpdate={onContactUpdate}
											onContactDelete={onContactDelete}
										/>
									)}
									{activeTab === "domains" && (
										<DomainsTab
											username={profile?.username ?? ""}
											profilePreferences={profile?.profilePreferences}
											onSubmit={onProfilePreferencesSubmit}
											isSubmitting={isSubmitting}
											onProfilePreferencesUpdate={setProfilePreferences}
										/>
									)}
									{activeTab === "integrations" && <IntegrationsTab />}
									{/* {activeTab === "export" && <ExportTab />} */}
								</div>
							</div>
							<div className="flex justify-between gap-0.5 pt-8 absolute right-0 -bottom-1">
								<Button
									size="sm"
									type="button"
									variant="ghost"
									onClick={() => {
										setShowProjectForm(false);
										setShowContactForm(false);
										setShowEducationForm(false);
										setShowExperienceForm(false);
									}}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									type="submit"
									variant="secondary"
									onClick={handleSaveChanges}
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader className="size-3.5 animate-spin" />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</DialogContent>
		</Dialog>
	);
}
