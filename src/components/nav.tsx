"use client";

import { z } from "zod";
import { Check, CircleCheck, CircleX, Home, Search, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "./ui/input";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

const emailSchema = z.email();

export default function Nav() {
  const [authDialogOpen, setAuthDialogOpen] = useState(true);

  const pathname = usePathname();

  return (
    <nav className="h-screen border-r px-3 flex justify-center items-center flex-col gap-6">
      {navItems.map((item) => (
        <Tooltip key={item.href}>
          <TooltipTrigger>
            <Link
              href={item.href}
              className={cn(
                "opacity-70 hover:opacity-100 transition-opacity",
                pathname === item.href && "opacity-100"
              )}
            >
              <item.icon className="size-5 mx-2" strokeWidth={1.5} />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      <AuthDialog
        authDialogOpen={authDialogOpen}
        setAuthDialogOpen={setAuthDialogOpen}
      />
    </nav>
  );
}

function AuthDialog({
  authDialogOpen,
  setAuthDialogOpen,
}: {
  authDialogOpen: boolean;
  setAuthDialogOpen: (open: boolean) => void;
}) {
  const [continueWithEmail, setContinueWithEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.message);
    } else {
      setEmailError("");
    }
  }, [email]);

  return (
    <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
      <DialogContent
        className="!max-w-sm h-[25dvh] overflow-hidden"
        showCloseButton={false}
      >
        <AnimatePresence mode="popLayout">
          {continueWithEmail ? (
            <motion.div
              key="email-form"
              initial={{ x: "200%" }}
              animate={{ x: 0 }}
              exit={{ x: "200%" }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            >
              <DialogHeader>
                <DialogTitle>Continue with email</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a link to create a
                  new profile.
                </p>
              </DialogHeader>
              <form className="my-4">
                <div className="relative">
                  <Input
                    placeholder="me@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <AnimatePresence>
                    {emailError && email.trim().length > 0 && (
                      <motion.span
                        key="email-error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                      >
                        <CircleX className="text-rose-400 absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                      </motion.span>
                    )}
                    {email.trim().length > 0 && !emailError && (
                      <motion.span
                        key="email-success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                      >
                        <CircleCheck className="text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 size-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </form>
              <DialogFooter className="flex gap-4">
                <Button
                  variant="link"
                  onClick={() => {
                    setContinueWithEmail(false);
                    setEmail("");
                  }}
                >
                  Back
                </Button>
                <Button disabled size="sm" variant="secondary" type="submit">
                  Submit
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="auth-options"
              initial={{ x: continueWithEmail ? "-200%" : 0 }}
              animate={{ x: 0 }}
              exit={{ x: "-200%" }}
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
                    className="underline underline-offset-2 text-foreground"
                  >
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-2 text-foreground"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              </DialogHeader>
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="secondary">
                  <GoogleIcon />
                  Continue with Google
                </Button>
                <Button
                  variant="link"
                  onClick={() => setContinueWithEmail(true)}
                >
                  Continue with email
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M15.68 8.18183C15.68 7.61456 15.6291 7.06911 15.5345 6.54547H8V9.64002H12.3055C12.12 10.64 11.5564 11.4873 10.7091 12.0546V14.0618H13.2945C14.8073 12.6691 15.68 10.6182 15.68 8.18183Z"
        fill="#4285F4"
      ></path>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8 16C10.16 16 11.9709 15.2837 13.2945 14.0618L10.7091 12.0546C9.99273 12.5346 9.07636 12.8182 8 12.8182C5.91636 12.8182 4.15272 11.4109 3.52363 9.52002H0.850906V11.5927C2.16727 14.2073 4.87272 16 8 16Z"
        fill="#34A853"
      ></path>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3.52364 9.52001C3.36364 9.04001 3.27273 8.52729 3.27273 8.00001C3.27273 7.47274 3.36364 6.96001 3.52364 6.48001V4.40729H0.850909C0.309091 5.48729 0 6.70911 0 8.00001C0 9.29092 0.309091 10.5127 0.850909 11.5927L3.52364 9.52001Z"
        fill="#FBBC05"
      ></path>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8 3.18182C9.17454 3.18182 10.2291 3.58545 11.0582 4.37818L13.3527 2.08364C11.9673 0.792727 10.1564 0 8 0C4.87272 0 2.16727 1.79273 0.850906 4.40727L3.52363 6.48C4.15272 4.58909 5.91636 3.18182 8 3.18182Z"
        fill="#EA4335"
      ></path>
    </svg>
  );
}
