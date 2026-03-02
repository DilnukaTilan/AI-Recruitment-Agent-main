"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [userProfile, setUserProfile] = useState(undefined);
  const router = useRouter();

  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };
    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (email) => {
    console.log("Fetching profile for:", email);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    console.log("Profile fetch result:", { data, error });

    if (!error) {
      setUserProfile(data);
    } else {
      console.error("Failed to fetch profile:", error);
    }
  };

  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      console.log("Supabase response:", { data, error });

      if (error) {
        if (
          error.message === "Invalid login credentials" ||
          error.message === "Email not confirmed"
        ) {
          return {
            success: false,
            error:
              "Invalid login credentials. If you just registered, please check your email and confirm your account before logging in.",
          };
        }
        return { success: false, error: error.message };
      }

      const { data: userData, error: profileError } = await supabase
        .from("users")
        .select("role, banned")
        .eq("email", email)
        .single();

      if (profileError || !userData) {
        toast.error("Could not fetch user profile.");
        return { success: false, error: "Profile not found." };
      }

      if (userData.banned) {
        await supabase.auth.signOut();
        return {
          success: false,
          error:
            "Your account has been banned. Please contact support for more information.",
        };
      }

      setUserProfile(userData);

      toast.success("Logged in!");

      if (userData.role === "recruiter") {
        window.location.href = "/recruiter/dashboard";
      } else if (userData.role === "candidate") {
        window.location.href = "/candidate/dashboard";
      }

      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  const signUpNewUser = async (email, password, { name, role }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      console.log("SIGNUP response:", authData, authError);

      if (authError || !authData?.user?.id) {
        return {
          success: false,
          error: authError?.message || "Signup failed. Please try again.",
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { error: insertError } = await supabase.from("users").insert([
        {
          email: email.toLowerCase(),
          name,
          role,
          password: hashedPassword,
          picture: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          credits: 3,
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        return { success: false, error: insertError.message };
      }

      return { success: true, user: authData.user };
    } catch (err) {
      console.error("Sign up exception:", err);
      return { success: false, error: "Unexpected error occurred." };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Sign out failed.");
      return;
    }

    setSession(null);
    setUserProfile(null);
    toast.success("Successfully signed out.");
    router.push("/login");
  };

  if (session === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading screen. Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        userProfile,
        signInUser,
        signUpNewUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
