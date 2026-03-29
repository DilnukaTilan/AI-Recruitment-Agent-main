"use client";

import React, { useContext, useEffect, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";

export default function MainLayout({ children }) {
  const { user } = useContext(UserDetailContext);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
      } else {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [router]);

  // if (!authChecked) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <p className="text-gray-500">Auth checking...</p>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="container mx-auto p-1 sm:p-2">{children}</main>
      <SpeedInsights />
    </div>
  );
}
