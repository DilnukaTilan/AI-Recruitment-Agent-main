"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";

export default function MainPage() {
  const router = useRouter();

  const { user } = useContext(UserDetailContext);

  useEffect(() => {
    if (user?.role === "recruiter") {
      router.replace("/recruiter/dashboard");
    } else if (user?.role === "candidate") {
      router.replace("/candidate/dashboard");
    }
  }, [user, router]);

  return null;
}
