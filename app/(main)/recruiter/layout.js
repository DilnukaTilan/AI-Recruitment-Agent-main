"use client";

import React, { useContext, useEffect, useState } from "react";
import DashboardProvider from "./provider";
import WelcomeContainer from "./dashboard/_components/WelcomeContainer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useRouter } from "next/navigation";

function DashboardLayout({ children }) {
  const { user } = useContext(UserDetailContext);
  const router = useRouter();
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (user === null) return;
    if (user === undefined) return;

    if (user.role !== "recruiter") {
      router.replace("/" + user.role + "/dashboard");
    } else {
      setRoleChecked(true);
    }
  }, [user, router]);

  if (!roleChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <div className="p-10 w-full space-y-6">
        <WelcomeContainer />
        {children}
      </div>
      <SpeedInsights />
    </DashboardProvider>
  );
}

export default DashboardLayout;
