"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ProfilePreferences } from "@/app/generated/prisma";
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
	GeneralFormData,
	ProfileFormData,
	ProfileModalData,
	ProjectFormData,
	SessionUser,
} from "@/types/profile";

export default function ProfileModalClient({
	user,
	id,
	name,
	username,
	email,
	image,
	title,
	about,
	location,
	website,
	projects: initialProjects,
	education: initialEducation,
	workExperiences: initialWorkExperiences,
	profileOrder: initialprofileOrder,
	contacts: initialContacts,
	profilePreferences: initialProfilePreferences,
}: ProfileModalData & {
	user: NonNullable<SessionUser>["user"];
}) {
	const router = useRouter();

	// State for data with initial server data
	const [profile, setProfile] = useState({
		id,
		name,
		username,
		title,
		about,
		location,
		website,
		image,
	});
	const [projects, setProjects] = useState(initialProjects);
	const [education, setEducation] = useState(initialEducation);
	const [contacts, setContacts] = useState(initialContacts);
	const [profileOrder, setprofileOrder] = useState(initialprofileOrder);
	const [profilePreferences, setProfilePreferences] = useState(
		initialProfilePreferences,
	);

	const [isOpen, setIsOpen] = useState(true);
	const [step, setStep] = useState(1);
	const [activeTab, setActiveTab] = useState<ProfileTab>("general");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [showProjectForm, setShowProjectForm] = useState(false);
	const [showEducationForm, setShowEducationForm] = useState(false);
	const [showContactForm, setShowContactForm] = useState(false);
	const [generalFormData, setGeneralFormData] = useState<
		Partial<GeneralFormData>
	>({});
	// const [originalPath, setOriginalPath] = useState<string | null>(null);

	const searchParams = useSearchParams();
	const pathname = usePathname();

	const handleTabChange = (tabId: ProfileTab) => {
		setActiveTab(tabId);
		setShowProjectForm(false);
		setShowEducationForm(false);
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

		const currentOrder = profileOrder;

		const oldIndex = currentOrder.indexOf(active.id as string);
		const newIndex = currentOrder.indexOf(over.id as string);

		if (oldIndex === -1 || newIndex === -1) return;

		const newOrder = arrayMove(currentOrder, oldIndex, newIndex);

		// Optimistically update local state
		setprofileOrder(newOrder);

		try {
			await fetch("/api/me/profile/section-order", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					profileOrder: newOrder,
				}),
			});
		} catch (_) {
			// Revert on error
			setprofileOrder(currentOrder);
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
		if (user && !user.onboarded) {
			setStep(0);
		}
	}, [user]);

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
		if (user.onboarded) {
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

			// Refresh projects data and update local state
			// const updatedProjects = await mutateProjects();
			// if (updatedProjects?.projects) {
			// 	setProjects(updatedProjects.projects);
			// }
			setShowProjectForm(false);
		} catch (error) {
			console.error("Error saving project:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onGeneralSubmit = async (data: GeneralFormData) => {
		setIsSubmitting(true);
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

			// Update local state with response data
			if (result.user) {
				setProfile(result.user);
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

			setEducation(result.education);
			setShowEducationForm(false);
		} catch (error) {
			console.error("Error saving education:", error);
		} finally {
			setIsSubmitting(false);
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

			setContacts(result.contacts);
			setShowContactForm(false);
		} catch (error) {
			console.error("Error saving contact:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onProfilePreferencesSubmit = async (data: ProfilePreferences) => {
		setIsSubmitting(true);
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

			setProfilePreferences(result.profilePreferences);
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
		setShowContactForm(false);
	};

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
				<AnimatePresence mode="wait">
					{step === 0 && (
						<OnboardingStep
							onSubmit={onSubmit}
							isSubmitting={isSubmitting}
							submitError={submitError}
						/>
					)}
					{step === 1 && (
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
									profileOrder={profileOrder}
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
									{activeTab === "experience" && <ExperienceTab />}
									{activeTab === "education" && (
										<EducationTab
											education={education}
											showEducationForm={showEducationForm}
											onShowEducationForm={setShowEducationForm}
											onSubmit={onEducationSubmit}
											isSubmitting={isSubmitting}
											onEducationUpdate={setEducation}
										/>
									)}
									{activeTab === "projects" && (
										<ProjectsTab
											projects={projects}
											showProjectForm={showProjectForm}
											onShowProjectForm={setShowProjectForm}
											onSubmit={onProjectSubmit}
											isSubmitting={isSubmitting}
										/>
									)}
									{activeTab === "contacts" && (
										<ContactsTab
											contacts={contacts}
											showContactForm={showContactForm}
											onShowContactForm={setShowContactForm}
											onSubmit={onContactSubmit}
											isSubmitting={isSubmitting}
											onContactsUpdate={setContacts}
										/>
									)}
									{activeTab === "domains" && (
										<DomainsTab
											username={username ?? ""}
											profilePreferences={profilePreferences}
											onSubmit={onProfilePreferencesSubmit}
											isSubmitting={isSubmitting}
											onProfilePreferencesUpdate={setProfilePreferences}
										/>
									)}
									{activeTab === "integrations" && <IntegrationsTab />}
									{activeTab === "export" && <ExportTab />}
								</div>
							</div>
							<div className="flex justify-end space-x-2 pt-8 absolute right-0 -bottom-1">
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
