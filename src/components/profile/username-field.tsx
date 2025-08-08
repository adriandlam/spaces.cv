"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, CircleX, Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Control } from "react-hook-form";
import { useSession } from "@/lib/auth-client";

interface UsernameFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

interface UsernameStatus {
  checking: boolean;
  available: boolean | null;
  message: string;
}

export function UsernameField({
  control,
  name,
  label = "Username",
  placeholder = "johndoe",
  disabled = false,
  required = false,
  className = "",
}: UsernameFieldProps) {
  const { data: session } = useSession();
  const [usernameValue, setUsernameValue] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>({
    checking: false,
    available: null,
    message: "",
  });

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
    const timeoutId = setTimeout(() => {
      if (usernameValue) {
        checkUsername(usernameValue);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [usernameValue, checkUsername]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <div className="flex justify-between">
            <Label htmlFor={name} className={required ? "text-sm" : "text-sm"}>
              {label}{required && "*"}
            </Label>
            <p className="opacity-35 text-xs">
              {field.value?.length || 0} of 32
            </p>
          </div>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                id={name}
                value={field.value?.toLowerCase() || ""}
                placeholder={placeholder}
                disabled={disabled}
                className={`!pl-7 ${className}`}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  field.onChange(value);
                  setUsernameValue(value);
                }}
              />
              <span className="pointer-events-none opacity-35 absolute left-2.5 top-1/2 -translate-y-1/2">
                @
              </span>
              <AnimatePresence>
                {usernameStatus.checking && field.value?.length > 0 && (
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
                    (usernameStatus.available === false &&
                      field.value?.length > 0)) && (
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
                  field.value?.length > 0 && (
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
              field.value?.length > 0 && (
                <p className="text-xs text-destructive ml-3">
                  {usernameStatus.message}
                </p>
              )}
          </div>
        </FormItem>
      )}
    />
  );
}