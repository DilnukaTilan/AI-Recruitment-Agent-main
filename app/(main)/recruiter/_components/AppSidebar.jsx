"use client";

import React, { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SideBarRecruiter } from "@/services/Constants";
import { LogOutIcon, Plus } from "lucide-react";
import { UserAuth } from "@/context/AuthContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppSidebar() {
  const router = useRouter();
  const path = usePathname();
  const { signOut } = UserAuth();
  const { user } = useContext(UserDetailContext);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "RC";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="flex items-center justify-center px-3 py-2.5">
        <span className="group-data-[collapsible=icon]:hidden">
          <Image
            src="/logo.png"
            alt="logo"
            width={120}
            height={120}
            className="w-30 object-contain"
            priority
          />
        </span>
      </SidebarHeader>

      <div className="px-3 group-data-[collapsible=icon]:px-1.5">
        <Button
          className="w-full cursor-pointer gap-2 rounded-lg shadow-sm transition-all hover:shadow-md"
          size="sm"
          onClick={() => router.push("/recruiter/dashboard/create-interview")}
        >
          <Plus className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            New Interview
          </span>
        </Button>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            {SideBarRecruiter.map((option, index) => {
              const isActive = path === option.path;
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={option.name}
                    className={`
                      group/item relative rounded-lg px-3 py-2.5 transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold shadow-sm group-data-[collapsible=icon]:shadow-none"
                          : "text-muted-foreground hover:bg-border/30 hover:text-foreground"
                      }
                    `}
                  >
                    <Link href={option.path}>
                      <option.icon
                        className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover/item:text-foreground"
                        }`}
                      />
                      <span className="text-[13px]">{option.name}</span>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.75 rounded-r-full bg-primary" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 rounded-lg bg-accent/50 px-3 py-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Link href="/recruiter/profile">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">
              {user?.name || "Recruiter"}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {user?.email || ""}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full cursor-pointer justify-start gap-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-1"
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
        >
          <LogOutIcon className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden text-[13px]">
            Log out
          </span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
