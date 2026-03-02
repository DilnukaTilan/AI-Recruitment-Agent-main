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
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-blue-50/70 p-5 shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)] sm:p-6">
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-cyan-200/30 blur-2xl" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium tracking-wide text-blue-700">
            Candidate Dashboard
          </p>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Welcome back, <span className="text-blue-700">{userData.name}</span>
          </h2>
          <p className="text-sm text-slate-600 sm:text-base">
            Your path to great jobs starts with confident AI interviews.
          </p>
        </div>

        {userData.picture ? (
          <div className="rounded-full bg-white/80 p-1 shadow ring-1 ring-slate-200">
            <Image
              src={userData.picture}
              alt="userAvatar"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-300/40">
            <span className="text-lg font-semibold text-white">
              {userData.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeContainer;
