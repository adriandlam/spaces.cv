"use client";

import { Button } from "@/components/ui/button";
import {
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
import { UsernameField } from "./username-field";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, CircleX, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { ProfileFormData } from "@/types/profile";
import { profileSchema } from "@/lib/validations/profile";

interface OnboardingStepProps {
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}

export function OnboardingStep({
  onSubmit,
  isSubmitting,
  submitError,
}: OnboardingStepProps) {
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      username: "",
    },
  });

  const {
    handleSubmit,
    formState: { isValid },
    watch,
  } = profileForm;

  const nameValue = watch("name", "");

  return (
    <motion.div
      key="profile-setup"
      initial={{ x: 0 }}
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
      <Form {...profileForm}>
        <form
          className="space-y-4 mt-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormField
            control={profileForm.control}
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

          <UsernameField
            control={profileForm.control}
            name="username"
            disabled={isSubmitting}
            required
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
  );
}