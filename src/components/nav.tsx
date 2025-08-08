"use client";

import { Home, Search, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import AuthDialog from "./auth-dialog";
import { useSession } from "@/lib/auth-client";

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

export default function Nav() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const pathname = usePathname();
  const { data: session, isPending } = useSession();

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
              onClick={(e) => {
                e.preventDefault();
                if (!session && !isPending) {
                  setAuthDialogOpen(true);
                }
              }}
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
