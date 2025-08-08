"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  EducationFormData,
  GeneralFormData,
  ProfileFormData,
  ProjectFormData,
} from "@/types/profile";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { EducationTab } from "@/components/profile/education-tab";
import { ExperienceTab } from "@/components/profile/experience-tab";
import { GeneralTab } from "@/components/profile/general-tab";
import { OnboardingStep } from "@/components/profile/onboarding-step";
import {
  ProfileTabsList,
  type ProfileTab,
} from "@/components/profile/profile-tabs-list";
import { ProjectsTab } from "@/components/profile/projects-tab";

export default function ProfileModal() {
  const router = useRouter();
  const { data: session, isPending, refetch: refetchSession } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(1); // Default to profile view since most users will be onboarded
  const [activeTab, setActiveTab] = useState<ProfileTab>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [generalFormData, setGeneralFormData] = useState<
    Partial<GeneralFormData>
  >({});

  // Initialize section order from session data
  useEffect(() => {
    if (session?.user?.sectionOrder) {
      setSectionOrder(session.user.sectionOrder);
    } else {
      setSectionOrder(["experience", "education", "projects"]);
    }
  }, [session?.user?.sectionOrder]);

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Function to handle tab changes without updating URL to prevent rerenders
  const handleTabChange = useCallback((tabId: ProfileTab) => {
    setActiveTab(tabId);
    if (tabId === "general") {
      window.history.pushState(null, "", pathname);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    }
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sectionOrder.indexOf(active.id as string);
    const newIndex = sectionOrder.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) return;

    const previousOrder = [...sectionOrder]; // Store original order
    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);

    // Optimistic update - update UI immediately
    setSectionOrder(newOrder);

    // Save the new order to the backend
    try {
      const response = await fetch("/api/profile/section-order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionOrder: newOrder,
        }),
      });

      if (!response.ok) {
        setSectionOrder(previousOrder); // Revert to previous order on failure
      }
    } catch (error) {
      setSectionOrder(previousOrder);
    }
  };

  // Read initial tab from URL params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["general", "experience", "education", "projects"];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam as ProfileTab);
    } else if (!tabParam) {
      // No tab parameter means we're on the general tab (/profile)
      setActiveTab("general");
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user && !session.user.onboarded) {
      setStep(0); // Only change to onboarding if user is not onboarded
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      setGeneralFormData({
        name: session.user.name || "",
        username: session.user.username || "",
        title: session.user.title || "",
        about: session.user.about || "",
        location: session.user.location || "",
        website: session.user.website || "",
      });
      if (session.user.projects) {
        setProjects(session.user.projects);
      }
      if (session.user.educations) {
        setEducations(session.user.educations);
      }
    }
  }, [session?.user]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/profile", {
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

      refetchSession(); // Refresh session data

      setStep(1); // Push to next step
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (session?.user.onboarded) {
      setIsOpen(false);
      router.back();
    } else {
      setIsOpen(true);
    }
  };

  const onProjectSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Project data:", data);
      // TODO: Implement API call to save project
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Add the new project to the local state
      const newProject = {
        id: Date.now().toString(), // temporary ID
        ...data,
        createdAt: new Date(),
      };
      setProjects((prev) => [newProject, ...prev]);
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
      const response = await fetch("/api/profile/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      refetchSession(); // Refresh session data
    } catch (error) {
      console.error("Error saving general info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEducationSubmit = async (data: EducationFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Education data:", data);
      // TODO: Implement API call to save education
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Add the new education to the local state
      const newEducation = {
        id: Date.now().toString(), // temporary ID
        ...data,
        createdAt: new Date(),
      };
      setEducations((prev) => [newEducation, ...prev]);
      setShowEducationForm(false);
    } catch (error) {
      console.error("Error saving education:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveChanges = async () => {
    // Close modal and redirect to home
    setIsOpen(false);
    router.push("/");
  };

  const resetForm = () => {
    setStep(0);
    setSubmitError(null);
    setIsSubmitting(false);
    setShowProjectForm(false);
    setShowEducationForm(false);
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
          step === 1 ? "!max-w-3xl !h-[85dvh]" : "!max-w-md h-[20rem]"
        )}
        showCloseButton={false}
      >
        <AnimatePresence mode="wait">
          {isPending ? (
            <div
              key="loading"
              className="fixed inset-0 flex justify-center items-center h-full gap-2"
            >
              <Loader className="size-4 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading profile...
              </p>
            </div>
          ) : (
            <>
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
                  <div className="flex gap-6 h-full">
                    <ProfileTabsList
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                      sectionOrder={sectionOrder}
                      onDragEnd={handleDragEnd}
                    />
                    <Separator orientation="vertical" />
                    <div className="flex-1">
                      <AnimatePresence>
                        {activeTab === "general" && (
                          <GeneralTab
                            onSubmit={onGeneralSubmit}
                            isSubmitting={isSubmitting}
                            defaultValues={generalFormData}
                            userImage={session?.user.image ?? undefined}
                            userName={session?.user.name ?? undefined}
                          />
                        )}
                        {activeTab === "experience" && <ExperienceTab />}
                        {activeTab === "education" && (
                          <EducationTab
                            educations={educations}
                            showEducationForm={showEducationForm}
                            onShowEducationForm={setShowEducationForm}
                            onSubmit={onEducationSubmit}
                            isSubmitting={isSubmitting}
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
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-8 absolute right-0 -bottom-1">
                    <Button
                      size="sm"
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
            </>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
