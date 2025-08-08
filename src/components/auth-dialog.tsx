import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "./ui/input";
import { CircleX, CircleCheck, Loader } from "lucide-react";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "./ui/form";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient, signIn } from "@/lib/auth-client";
import { GitHubIcon, GoogleIcon } from "./provider-icons";

const emailFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailFormSchema>;

export default function AuthDialog({
  authDialogOpen,
  setAuthDialogOpen,
}: {
  authDialogOpen: boolean;
  setAuthDialogOpen: (open: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const {
    handleSubmit,
    formState: { isValid },
    watch,
    reset,
  } = form;
  const emailValue = watch("email", "");

  const onSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await authClient.signIn.magicLink({
        email: data.email,
        name: "",
        callbackURL: "/",
        newUserCallbackURL: "/profile",
        errorCallbackURL: "/auth/error",
      });

      if (error) {
        setSubmitError(
          error.message || "An error occurred while sending the magic link"
        );
        setIsSubmitting(false);
        return;
      }

      setStep(2);
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    reset();
    setStep(0);
    setSubmitError(null);
    setIsSubmitting(false);
  };

  return (
    <Dialog
      open={authDialogOpen}
      onOpenChange={(open) => {
        setAuthDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogContent
        className="!max-w-sm h-[16rem] overflow-hidden"
        showCloseButton={false}
      >
        <AnimatePresence mode="popLayout">
          {step === 0 && (
            <motion.div
              key="auth-options"
              initial={{ x: "-125%" }}
              animate={{ x: 0 }}
              exit={{ x: "-125%" }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            >
              <DialogHeader>
                <DialogTitle>Create a new profile</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  By continuing you agree to our{" "}
                  <Link
                    href="/terms"
                    className="underline underline-offset-3 text-foreground"
                  >
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-3 text-foreground"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              </DialogHeader>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() =>
                    signIn.social({
                      provider: "google",
                    })
                  }
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    signIn.social({
                      provider: "github",
                    })
                  }
                >
                  <GitHubIcon />
                  Continue with Github
                </Button>
                <Button variant="link" onClick={() => setStep(1)}>
                  Continue with email
                </Button>
              </div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="email-form"
              initial={{ x: "125%" }}
              animate={{ x: 0 }}
              exit={{ x: "125%" }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="relative"
            >
              <DialogHeader>
                <DialogTitle>Continue with email</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a link to create a
                  new profile.
                </p>
              </DialogHeader>
              <Form {...form}>
                <form className="my-4" onSubmit={handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="me@example.com"
                              disabled={isSubmitting}
                              className={
                                fieldState.error ? "border-red-500" : ""
                              }
                            />
                            <AnimatePresence>
                              {fieldState.error &&
                                emailValue.trim().length > 0 && (
                                  <motion.span
                                    key="email-error"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{
                                      duration: 0.1,
                                      ease: "easeOut",
                                    }}
                                  >
                                    <CircleX className="text-rose-400 absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                                  </motion.span>
                                )}
                              {emailValue.trim().length > 0 &&
                                !fieldState.error && (
                                  <motion.span
                                    key="email-success"
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
                  {submitError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 mt-2 p-2 bg-red-50 rounded-md border border-red-200"
                    >
                      {submitError}
                    </motion.p>
                  )}

                  <DialogFooter className="flex gap-4 absolute right-0 -bottom-1">
                    <Button
                      variant="link"
                      onClick={() => {
                        setStep(0);
                        reset();
                        setSubmitError(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      size="sm"
                      type="submit"
                      disabled={!isValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="size-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="email-form"
              initial={{ x: "125%" }}
              animate={{ x: 0 }}
              exit={{ x: "125%" }}
              className="relative"
            >
              <DialogHeader>
                <DialogTitle>Check your inbox</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a link to{" "}
                  <span className="font-medium text-foreground">
                    {emailValue}
                  </span>
                  .
                </p>
              </DialogHeader>
              <DialogFooter className="flex gap-4 absolute right-0 -bottom-1">
                <Button
                  disabled={isSubmitting}
                  variant="link"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <DialogClose asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      resetForm();
                      setAuthDialogOpen(false);
                    }}
                    variant="secondary"
                  >
                    Finish
                  </Button>
                </DialogClose>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
