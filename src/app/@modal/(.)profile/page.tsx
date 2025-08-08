"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  CircleCheck,
  CircleX,
  GripHorizontal,
  Loader,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  EducationFormData,
  GeneralFormData,
  ProfileFormData,
  ProjectFormData,
} from "@/types/profile";
import {
  educationFormSchema,
  generalFormSchema,
  profileFormSchema,
  projectFormSchema,
} from "@/lib/validations/profile";

const profileTabs = [
  { id: "general", label: "General" },
  { id: "work", label: "Work Experience" },
  { id: "education", label: "Education" },
  // { id: "awards", label: "Awards" },
  { id: "projects", label: "Projects" },
] as const;

type ProfileTab = (typeof profileTabs)[number]["id"];

export default function ProfileModal() {
  const router = useRouter();
  const { data: session, refetch: refetchSession } = useSession();
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(1); // Default to profile view since most users will be onboarded
  const [activeTab, setActiveTab] = useState<ProfileTab>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [usernameValue, setUsernameValue] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      username: "",
    },
  });

  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      year: "",
      description: "",
      company: "",
      link: "",
      collaborators: "",
    },
  });

  const generalForm = useForm<GeneralFormData>({
    resolver: zodResolver(generalFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      username: "",
      title: "",
      about: "",
      location: "",
      website: "",
    },
  });

  const educationForm = useForm<EducationFormData>({
    resolver: zodResolver(educationFormSchema),
    mode: "onChange",
    defaultValues: {
      from: "",
      to: "",
      degree: "",
      institution: "",
      location: "",
      url: "",
      description: "",
      classmates: "",
      fieldOfStudy: "",
      gpa: "",
      activities: "",
    },
  });

  const {
    handleSubmit,
    formState: { isValid },
    watch,
    reset,
  } = form;
  const nameValue = watch("name", "");

  const checkUsername = useCallback(
    async (username: string) => {
      if (!username.trim()) {
        setUsernameStatus({ checking: false, available: null, message: "" });
        return;
      }

      if (username.length < 3) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: "Username must be at least 3 characters",
        });
        return;
      }

      // If username matches current user's username, mark as available
      if (session?.user.username && username === session.user.username) {
        setUsernameStatus({
          checking: false,
          available: true,
          message: "This is your current username",
        });
        return;
      }

      setUsernameStatus({ checking: true, available: null, message: "" });

      try {
        const response = await fetch("/api/check-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (response.ok) {
          setUsernameStatus({
            checking: false,
            available: data.available,
            message: data.message,
          });
        } else {
          setUsernameStatus({
            checking: false,
            available: false,
            message: data.error || "Error checking username",
          });
        }
      } catch (error) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: "Error checking username",
        });
      }
    },
    [session?.user.username]
  );

  useEffect(() => {
    if (session?.user && !session.user.onboarded) {
      setStep(0); // Only change to onboarding if user is not onboarded
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      generalForm.reset({
        name: session.user.name || "",
        username: session.user.username || "",
        title: session.user.title || "",
        about: session.user.about || "",
        location: session.user.location || "",
        website: session.user.website || "",
      });
      setUsernameValue(session.user.username || "");
    }
  }, [session?.user, generalForm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (usernameValue) {
        checkUsername(usernameValue);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [usernameValue, checkUsername]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          username: usernameValue.toLowerCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error || "Failed to update profile");
        return;
      }

      // Refresh session data
      refetchSession();

      // Move to next step
      setStep(1);
    } catch (error) {
      console.error("Profile update error:", error);
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
      projectForm.reset();
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

      // Refresh session data
      refetchSession();
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
      educationForm.reset();
      setShowEducationForm(false);
    } catch (error) {
      console.error("Error saving education:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset();
    generalForm.reset();
    projectForm.reset();
    educationForm.reset();
    setStep(0);
    setSubmitError(null);
    setIsSubmitting(false);
    setShowProjectForm(false);
    setShowEducationForm(false);
    setUsernameValue("");
    setUsernameStatus({ checking: false, available: null, message: "" });
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
        <AnimatePresence mode="popLayout">
          {step === 0 && (
            <motion.div
              key="profile-setup"
              initial={{ x: step !== 0 ? "-125%" : 0 }}
              animate={{ x: 0 }}
              exit={{ x: "-125%" }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="relative"
            >
              <DialogHeader>
                <DialogTitle>Welcome to Spaces!</DialogTitle>
                <DialogDescription>
                  Just a few more things before we can get you started.
                  You&apos;ll be able to change these later.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  className="space-y-4 mt-4"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <Label htmlFor="name">Display Name</Label>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              id="name"
                              placeholder="John Doe"
                              disabled={isSubmitting}
                            />
                            <AnimatePresence>
                              {fieldState.error &&
                                nameValue.trim().length > 0 && (
                                  <motion.span
                                    key="name-error"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{
                                      duration: 0.1,
                                      ease: "easeOut",
                                    }}
                                  >
                                    <CircleX className="text-destructive absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                                  </motion.span>
                                )}
                              {nameValue.trim().length > 0 &&
                                !fieldState.error && (
                                  <motion.span
                                    key="name-success"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{
                                      duration: 0.1,
                                      ease: "easeOut",
                                    }}
                                  >
                                    <CircleCheck className="text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                                  </motion.span>
                                )}
                            </AnimatePresence>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <Label htmlFor="username">Username</Label>
                          <p className="opacity-35 text-xs">
                            {usernameValue.length} of 32
                          </p>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              id="username"
                              placeholder="johndoe"
                              disabled={isSubmitting}
                              className="!pl-7"
                              onChange={(e) => {
                                field.onChange(e);
                                setUsernameValue(e.target.value);
                              }}
                            />
                            <span className="pointer-events-none opacity-35 absolute left-2.5 top-1/2 -translate-y-1/2">
                              @
                            </span>
                            <AnimatePresence>
                              {usernameStatus.checking &&
                                usernameValue.length > 0 && (
                                  <motion.span
                                    key="username-loading"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{
                                      duration: 0.1,
                                      ease: "easeOut",
                                    }}
                                  >
                                    <Loader className="text-blue-400 absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin" />
                                  </motion.span>
                                )}
                              {!usernameStatus.checking &&
                                (fieldState.error ||
                                  (usernameStatus.available === false &&
                                    usernameValue.length > 0)) && (
                                  <motion.span
                                    key="username-error"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{
                                      duration: 0.1,
                                      ease: "easeOut",
                                    }}
                                  >
                                    <CircleX className="text-destructive absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                                  </motion.span>
                                )}
                              {!usernameStatus.checking &&
                                !fieldState.error &&
                                usernameStatus.available === true &&
                                usernameValue.length > 0 && (
                                  <motion.span
                                    key="username-success"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{
                                      duration: 0.1,
                                      ease: "easeOut",
                                    }}
                                  >
                                    <CircleCheck className="text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                                  </motion.span>
                                )}
                            </AnimatePresence>
                          </div>
                        </FormControl>
                        <div className="space-y-1">
                          <FormMessage />
                          {!fieldState.error &&
                            usernameStatus.available === false &&
                            usernameValue.length > 0 && (
                              <p className="text-xs ml-3">
                                {usernameStatus.message}
                              </p>
                            )}
                        </div>
                      </FormItem>
                    )}
                  />
                  {submitError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 p-2 bg-red-50 rounded-md border border-red-200"
                    >
                      {submitError}
                    </motion.p>
                  )}
                  <div className="flex justify-end space-x-2 pt-4 absolute right-0 -bottom-1">
                    <Button
                      size="sm"
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      variant="secondary"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="size-3.5 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
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
                <div className="h-full space-y-4.5 w-48">
                  <Label className="text-sm opacity-75">Profile</Label>
                  <ul className="space-y-1">
                    {profileTabs.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <li key={tab.id}>
                          <Button
                            variant={isActive ? "outline" : "ghost"}
                            size="sm"
                            className="w-full justify-start !pl-6 transition-opacity font-normal"
                            onClick={() => setActiveTab(tab.id)}
                          >
                            {tab.label}
                            <GripHorizontal className="ml-auto" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <Separator orientation="vertical" />
                <div className="flex-1">
                  <AnimatePresence>
                    {activeTab === "general" && (
                      <Form {...generalForm}>
                        <form
                          onSubmit={generalForm.handleSubmit(onGeneralSubmit)}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-8">
                            <Avatar className="ring ring-border size-20 mt-2.5">
                              <AvatarImage
                                src={session?.user.image ?? undefined}
                                alt={session?.user.name ?? ""}
                              />
                              <AvatarFallback>
                                <Camera
                                  strokeWidth={1.5}
                                  className="size-6 text-muted-foreground"
                                />
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 w-full">
                              <FormField
                                control={generalForm.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                  <FormItem>
                                    <Label aria-required className="text-sm">
                                      Display Name*
                                    </Label>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          {...field}
                                          className="w-full"
                                          required
                                          disabled={isSubmitting}
                                        />
                                        <AnimatePresence>
                                          {fieldState.error &&
                                            field.value.trim().length > 0 && (
                                              <motion.span
                                                key="name-error"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{
                                                  duration: 0.1,
                                                  ease: "easeOut",
                                                }}
                                              >
                                                <CircleX className="text-destructive absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                                              </motion.span>
                                            )}
                                          {field.value.trim().length > 0 &&
                                            !fieldState.error && (
                                              <motion.span
                                                key="name-success"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{
                                                  duration: 0.1,
                                                  ease: "easeOut",
                                                }}
                                              >
                                                <CircleCheck className="text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                                              </motion.span>
                                            )}
                                        </AnimatePresence>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={generalForm.control}
                                name="username"
                                render={({ field, fieldState }) => (
                                  <FormItem>
                                    <div className="flex justify-between">
                                      <Label aria-required className="text-sm">
                                        Username*
                                      </Label>
                                      <p className="opacity-35 text-xs">
                                        {field.value?.length || 0} of 32
                                      </p>
                                    </div>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          {...field}
                                          className="w-full !pl-7"
                                          required
                                          disabled={isSubmitting}
                                          placeholder="johndoe"
                                          onChange={(e) => {
                                            field.onChange(e);
                                            setUsernameValue(e.target.value);
                                          }}
                                        />
                                        <span className="pointer-events-none opacity-35 absolute left-2.5 top-1/2 -translate-y-1/2">
                                          @
                                        </span>
                                        <AnimatePresence>
                                          {usernameStatus.checking &&
                                            field.value.length > 0 && (
                                              <motion.span
                                                key="username-loading"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{
                                                  duration: 0.1,
                                                  ease: "easeOut",
                                                }}
                                              >
                                                <Loader className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin" />
                                              </motion.span>
                                            )}
                                          {!usernameStatus.checking &&
                                            (fieldState.error ||
                                              (usernameStatus.available ===
                                                false &&
                                                field.value.length > 0)) && (
                                              <motion.span
                                                key="username-error"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{
                                                  duration: 0.1,
                                                  ease: "easeOut",
                                                }}
                                              >
                                                <CircleX className="text-destructive absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                                              </motion.span>
                                            )}
                                          {!usernameStatus.checking &&
                                            !fieldState.error &&
                                            usernameStatus.available === true &&
                                            field.value.length > 0 && (
                                              <motion.span
                                                key="username-success"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{
                                                  duration: 0.1,
                                                  ease: "easeOut",
                                                }}
                                              >
                                                <CircleCheck className="text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                                              </motion.span>
                                            )}
                                        </AnimatePresence>
                                      </div>
                                    </FormControl>
                                    <div className="space-y-1">
                                      <FormMessage />
                                      {!fieldState.error &&
                                        usernameStatus.available === false &&
                                        field.value.length > 0 && (
                                          <p className="text-xs text-destructive ml-3">
                                            {usernameStatus.message}
                                          </p>
                                        )}
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          <FormField
                            control={generalForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-sm">
                                  What do you do?
                                </Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Software Engineer, Designer, etc."
                                    className="w-full"
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={generalForm.control}
                            name="about"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-sm">About</Label>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Tell us about yourself..."
                                    className="w-full resize-none"
                                    rows={3}
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={generalForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-sm">Location</Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="San Francisco, CA"
                                    className="w-full"
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={generalForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-sm">Website</Label>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="https://example.com"
                                    className="w-full"
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end pt-4">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={isSubmitting}
                              variant="outline"
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
                        </form>
                      </Form>
                    )}
                    {activeTab === "work" && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl">Work Experience</h3>
                          <Button variant="ghost" size="sm">
                            <Plus />
                            Add Experience
                          </Button>
                        </div>
                        <Separator />
                      </div>
                    )}
                    {activeTab === "education" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl">Education</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEducationForm(true)}
                            disabled={showEducationForm}
                          >
                            <Plus />
                            Add Education
                          </Button>
                        </div>
                        <Separator />

                        <AnimatePresence>
                          {showEducationForm && (
                            <motion.div
                              key="education-form"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{
                                duration: 0.2,
                                ease: "easeOut",
                              }}
                              className="space-y-4"
                            >
                              <Form {...educationForm}>
                                <form
                                  onSubmit={educationForm.handleSubmit(
                                    onEducationSubmit
                                  )}
                                  className="space-y-3"
                                >
                                  <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                      control={educationForm.control}
                                      name="from"
                                      render={({ field, fieldState }) => (
                                        <FormItem>
                                          <Label className="text-sm">
                                            From*
                                          </Label>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="2020"
                                              className={
                                                fieldState.error
                                                  ? "border-red-500"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={educationForm.control}
                                      name="to"
                                      render={({ field, fieldState }) => (
                                        <FormItem>
                                          <Label className="text-sm">To*</Label>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="2024 or Present"
                                              className={
                                                fieldState.error
                                                  ? "border-red-500"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                      control={educationForm.control}
                                      name="degree"
                                      render={({ field, fieldState }) => (
                                        <FormItem>
                                          <Label className="text-sm">
                                            Degree/Certification*
                                          </Label>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="Bachelor of Science"
                                              className={
                                                fieldState.error
                                                  ? "border-red-500"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={educationForm.control}
                                      name="fieldOfStudy"
                                      render={({ field, fieldState }) => (
                                        <FormItem>
                                          <Label className="text-sm">
                                            Field of Study
                                          </Label>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="Computer Science"
                                              className={
                                                fieldState.error
                                                  ? "border-red-500"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <FormField
                                    control={educationForm.control}
                                    name="institution"
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <Label className="text-sm">
                                          Institution*
                                        </Label>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            placeholder="Stanford University"
                                            className={
                                              fieldState.error
                                                ? "border-red-500"
                                                : ""
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                      control={educationForm.control}
                                      name="location"
                                      render={({ field, fieldState }) => (
                                        <FormItem>
                                          <Label className="text-sm">
                                            Location
                                          </Label>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="Stanford, CA"
                                              className={
                                                fieldState.error
                                                  ? "border-red-500"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={educationForm.control}
                                      name="gpa"
                                      render={({ field, fieldState }) => (
                                        <FormItem>
                                          <Label className="text-sm">GPA</Label>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="3.8"
                                              className={
                                                fieldState.error
                                                  ? "border-red-500"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <FormField
                                    control={educationForm.control}
                                    name="url"
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <Label className="text-sm">URL</Label>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            placeholder="https://stanford.edu"
                                            className={
                                              fieldState.error
                                                ? "border-red-500"
                                                : ""
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={educationForm.control}
                                    name="description"
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <Label className="text-sm">
                                          Description
                                        </Label>
                                        <FormControl>
                                          <Textarea
                                            {...field}
                                            placeholder="Relevant coursework, achievements, etc..."
                                            className={`resize-none ${
                                              fieldState.error
                                                ? "border-red-500"
                                                : ""
                                            }`}
                                            rows={3}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={educationForm.control}
                                    name="classmates"
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <Label className="text-sm">
                                          Classmates
                                        </Label>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            placeholder="John Doe, Jane Smith"
                                            className={
                                              fieldState.error
                                                ? "border-red-500"
                                                : ""
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <div className="flex justify-end">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setShowEducationForm(false);
                                        educationForm.reset();
                                      }}
                                      disabled={isSubmitting}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    {/* {activeTab === "awards" && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl">Awards</h3>
                          <Button variant="ghost" size="sm">
                            <Plus />
                            Add Award
                          </Button>
                        </div>
                        <Separator />
                      </div>
                    )} */}
                    {activeTab === "projects" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl">Projects</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowProjectForm(true)}
                            disabled={showProjectForm}
                          >
                            <Plus />
                            Add Project
                          </Button>
                        </div>
                        <Separator />

                        <AnimatePresence>
                          {showProjectForm && (
                            <motion.div
                              key="project-form"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{
                                duration: 0.2,
                                ease: "easeOut",
                              }}
                              className="space-y-4"
                            >
                              <Form {...projectForm}>
                                <form
                                  onSubmit={projectForm.handleSubmit(
                                    onProjectSubmit
                                  )}
                                  className="space-y-3"
                                >
                                  <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                      control={projectForm.control}
                                      name="title"
                                      render={({ field, fieldState }) => (
                                        <FormItem>
                                          <Label className="text-sm">
                                            Title*
                                          </Label>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="My Awesome Project"
                                              className={
                                                fieldState.error
                                                  ? "border-red-500"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={projectForm.control}
                                      name="year"
                                      render={({ field, fieldState }) => (
                                        <FormItem>
                                          <Label className="text-sm">
                                            Year*
                                          </Label>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="2024"
                                              className={
                                                fieldState.error
                                                  ? "border-red-500"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <FormField
                                    control={projectForm.control}
                                    name="description"
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <Label className="text-sm">
                                          Description*
                                        </Label>
                                        <FormControl>
                                          <Textarea
                                            {...field}
                                            placeholder="A brief description of your project..."
                                            className={`resize-none ${
                                              fieldState.error
                                                ? "border-red-500"
                                                : ""
                                            }`}
                                            rows={3}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                      control={projectForm.control}
                                      name="company"
                                      render={({ field, fieldState }) => (
                                        <FormItem>
                                          <Label className="text-sm">
                                            Company
                                          </Label>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="Company name"
                                              className={
                                                fieldState.error
                                                  ? "border-red-500"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={projectForm.control}
                                      name="link"
                                      render={({ field, fieldState }) => (
                                        <FormItem>
                                          <Label className="text-sm">
                                            Link
                                          </Label>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              placeholder="https://example.com"
                                              className={
                                                fieldState.error
                                                  ? "border-red-500"
                                                  : ""
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <FormField
                                    control={projectForm.control}
                                    name="collaborators"
                                    render={({ field, fieldState }) => (
                                      <FormItem>
                                        <Label className="text-sm">
                                          Collaborators
                                        </Label>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            placeholder="John Doe, Jane Smith"
                                            className={
                                              fieldState.error
                                                ? "border-red-500"
                                                : ""
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <div className="flex justify-end">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setShowProjectForm(false);
                                        projectForm.reset();
                                      }}
                                      disabled={isSubmitting}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-8 absolute right-0 -bottom-1">
                <Button
                  size="sm"
                  onClick={() => {
                    resetForm();
                    setIsOpen(false);
                    router.push("/");
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
