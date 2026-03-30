"use client";

import { useUser } from "@/app/provider";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/services/supabaseClient";

function WelcomeContainer() {
  const { user } = useUser();
  const [userData, setUserData] = useState({
    name: user?.name || "User",
    picture: null,
  });

  useEffect(() => {
    if (user?.email) {
      fetchLatestUserData();
    }
  }, [user]);

  const fetchLatestUserData = async () => {
    try {
      const { data: userRecord, error } = await supabase
        .from("users")
        .select("name, picture")
        .eq("email", user.email)
        .single();

      if (!error && userRecord) {
        setUserData({
          name:
            userRecord.name ||
            user?.name ||
            user?.email?.split("@")[0] ||
            "User",
          picture: userRecord.picture || user?.picture,
        });
      } else {
        setUserData({
          name: user?.name || user?.email?.split("@")[0] || "User",
          picture: user?.picture,
        });
      }

      if (typeof window !== "undefined") {
        const googleProfile = localStorage.getItem("googleProfile");
        if (googleProfile) {
          const { name, picture } = JSON.parse(googleProfile);
          setUserData((prev) => ({
            ...prev,
            name: name || prev.name,
            picture: picture || prev.picture,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData({
        name: user?.name || user?.email?.split("@")[0] || "User",
        picture: user?.picture,
      });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-blue-50/70 p-4 shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)] sm:rounded-2xl sm:p-6">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-200/40 blur-2xl sm:-right-10 sm:-top-10 sm:h-36 sm:w-36" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-cyan-200/30 blur-2xl sm:-bottom-10 sm:-left-8 sm:h-32 sm:w-32" />

      <div className="relative z-10 flex flex-col-reverse items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
        <div className="space-y-1.5 sm:space-y-2">
          <p className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 font-medium tracking-wide text-blue-700 sm:px-3 sm:py-1 text-xs">
            Candidate Dashboard
          </p>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl md:text-2xl">
            Welcome back, <span className="text-blue-700">{userData.name}</span>
          </h2>
          <p className="text-xs text-slate-600 sm:text-sm md:text-base">
            Your path to great jobs starts with confident AI interviews.
          </p>
        </div>

        {userData.picture ? (
          <div className="shrink-0 rounded-full bg-white/80 p-0.5 shadow ring-1 ring-slate-200 sm:p-1">
            <Image
              src={userData.picture}
              alt="userAvatar"
              width={56}
              height={56}
              className="h-10 w-10 rounded-full object-cover sm:h-14 sm:w-14"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-300/40 sm:h-14 sm:w-14">
            <span className="text-sm font-semibold text-white sm:text-lg">
              {userData.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeContainer;
