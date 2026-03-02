"use client";

import { UserDetailContext } from "@/context/UserDetailContext";
import { supabase } from "@/services/supabaseClient";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const fetchAndSetUser = async () => {
    const {
      data: { user: supaUser },
    } = await supabase.auth.getUser();
    if (!supaUser) {
      setUser(null);
      return;
    }
    let { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", supaUser.email);
    if (error || !users || users.length === 0) {
      setUser(null);
      return;
    }

    if (users[0]?.banned) {
      await supabase.auth.signOut();
      toast.error(
        "Your account has been banned. Please contact support for more information.",
      );
      router.push("/login");
      setUser(null);
      return;
    }

    setUser(users[0]);
  };

  const updateUserCredits = async (newCredits) => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .update({ credits: newCredits })
        .eq("email", user.email)
        .select();

      if (!error && data?.[0]) {
        setUser(data[0]);
        return { success: true, data: data[0] };
      }
      return { success: false, error };
    } catch (error) {
      console.error("Error updating credits:", error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchAndSetUser();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, _session) => {
        fetchAndSetUser();
      },
    );
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <UserDetailContext.Provider value={{ user, setUser, updateUserCredits }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;

export const useUser = () => {
  const context = useContext(UserDetailContext);
  return context;
};
