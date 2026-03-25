"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/provider";
import { supabase } from "@/services/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Camera,
  Save,
  Loader2,
  ShieldCheck,
  KeyRound,
  CalendarDays,
  BadgeCheck,
  Lock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function RecruiterProfile() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [pictureSaving, setPictureSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    fullname: "",
    email: "",
    picture: null,
  });
  const [originalData, setOriginalData] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [authProvider, setAuthProvider] = useState(null);
  const userEmailRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    const fetchProvider = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        setAuthProvider(authUser.app_metadata?.provider || "email");
      }
    };
    fetchProvider();
  }, []);

  const isGoogleUser = authProvider === "google";

  useEffect(() => {
    if (user?.email && user.email !== userEmailRef.current) {
      userEmailRef.current = user.email;
      loadProfileData();
    }
  }, [user?.email]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      let userData = {
        fullname: user?.name || user?.email?.split("@")[0] || "",
        email: user?.email || "",
        picture: user?.picture || null,
      };

      if (user?.email) {
        const { data: userRecord, error } = await supabase
          .from("users")
          .select("name, email, picture")
          .eq("email", user.email)
          .single();

        if (!error && userRecord) {
          userData = {
            ...userData,
            fullname: userRecord.name || userData.fullname,
            email: userRecord.email || userData.email,
            picture: userRecord.picture || userData.picture,
          };
        }
      }

      setProfileData(userData);
      setOriginalData(userData);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load the profile data.");
    } finally {
      setLoading(false);
    }
  };

  const [memberSince, setMemberSince] = useState("N/A");
  useEffect(() => {
    const fetchCreatedAt = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser?.created_at) {
        setMemberSince(
          new Date(authUser.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
        );
      }
    };
    fetchCreatedAt();
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const currentFullname = profileData.fullname;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("The image size should be less than 5MB.");
      return;
    }

    try {
      setPictureSaving(true);

      const safeEmail = user.email.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `profile-${safeEmail}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, file);

      if (error) {
        toast.error("Failed to upload the image.");
        console.error("Upload error:", error);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(fileName);

      const newPictureUrl = urlData?.publicUrl;
      if (!newPictureUrl || !newPictureUrl.startsWith("http")) {
        toast.error("Failed to retrieve a valid image URL.");
        return;
      }

      setProfileData((prev) => ({ ...prev, picture: newPictureUrl }));

      const { error: updateError } = await supabase.from("users").upsert(
        {
          email: user.email,
          name: currentFullname,
          picture: newPictureUrl,
        },
        { onConflict: "email" },
      );

      if (updateError) {
        toast.error("Failed to save the picture to the database.");
        return;
      }

      setOriginalData((prev) => ({ ...prev, picture: newPictureUrl }));
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      toast.error("Failed to upload the image.");
    } finally {
      setPictureSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user?.email) {
      toast.error("The user is not authenticated.");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);
      const { error } = await supabase.from("users").upsert(
        {
          email: user.email,
          name: profileData.fullname,
          picture: profileData.picture,
        },
        { onConflict: "email" },
      );

      if (error) {
        toast.error("Failed to update the profile.");
        return;
      }

      setOriginalData(profileData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to save the profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!password) return;

    if (password.length < 8) {
      toast.error("The password must be at least 8 characters long.");
      return;
    }

    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error("Failed to change the password.");
      } else {
        toast.success("Password changed successfully!");
        setPassword("");
      }
    } catch (e) {
      toast.error("An error occurred while changing the password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email: user.email }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to delete account.");
        return;
      }
      await supabase.auth.signOut();
      toast.success("Your account has been deleted.");
      router.push("/login");
    } catch (error) {
      toast.error("An error occurred while deleting your account.");
    } finally {
      setDeleting(false);
    }
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(profileData) !== JSON.stringify(originalData);
  };

  const initials =
    profileData.fullname?.charAt(0)?.toUpperCase() ||
    profileData.email?.charAt(0)?.toUpperCase() ||
    "U";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-[3px] border-blue-600 border-t-transparent" />
          <span className="text-sm text-slate-500 font-medium">
            Loading profile…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Profile Settings
        </h2>
        <p className="text-gray-500">
          Manage your personal information, photo and account security.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-blue-50/70 shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-br from-blue-500 to-indigo-500 rounded-t-2xl" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0 group">
            {profileData.picture ? (
              <img
                src={profileData.picture}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg shadow-blue-500/20"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center ring-4 ring-white shadow-lg shadow-blue-500/30">
                <span className="text-3xl font-bold text-white">
                  {initials}
                </span>
              </div>
            )}

            <label
              htmlFor="picture-upload"
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            >
              {pictureSaving ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </label>
            <input
              id="picture-upload"
              type="file"
              accept="image/*"
              onChange={handlePictureUpload}
              className="hidden"
            />

            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white shadow" />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">
                {profileData.fullname || "Your Name"}
              </h3>
              <Badge className="self-center sm:self-auto bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 font-medium text-xs">
                <BadgeCheck className="h-3 w-3" />
                Candidate
              </Badge>
            </div>
            <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              {profileData.email}
            </p>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Member since {memberSince}
            </p>
          </div>

          <div className="shrink-0">
            <label
              htmlFor="picture-upload"
              className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <Camera className="h-4 w-4" />
              {pictureSaving ? "Uploading…" : "Change photo"}
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Personal Information
                </h4>
                <p className="text-xs text-slate-500">
                  Update your name and account details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="fullname"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Full Name
                </Label>
                <Input
                  id="fullname"
                  value={profileData.fullname}
                  onChange={(e) =>
                    handleInputChange("fullname", e.target.value)
                  }
                  placeholder="Enter your full name"
                  className="rounded-xl border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={profileData.email}
                    placeholder="Enter your email"
                    type="email"
                    disabled
                    className="rounded-xl border-slate-200 bg-slate-100 text-slate-500 pr-10 cursor-not-allowed"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-400">
                  Email address cannot be changed for security reasons.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!hasChanges() || saving}
              className="w-full group relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-6 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-600 hover:to-blue-500 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
            >
              <span className="relative flex items-center justify-center gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    Save Changes
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Security</h4>
                <p className="text-xs text-slate-500">
                  Manage your password and login method
                </p>
              </div>
            </div>

            {isGoogleUser ? (
              <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 border border-blue-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Signed in with Google
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Password management is handled by Google. To change your
                    password, visit your Google account settings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password (min. 8 characters)"
                      disabled={passwordSaving}
                      className="rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-400 focus:ring-indigo-400/20 pr-10 transition-colors"
                    />
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Use at least 8 characters with a mix of letters and numbers.
                  </p>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={!password || password.length < 8 || passwordSaving}
                  className="w-full group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-6 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-600 hover:to-indigo-500 hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {passwordSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Changing…
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                        Update Password
                      </>
                    )}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/30">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Account Overview
              </h4>
              <p className="text-xs text-slate-500">
                Your account details at a glance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Account Type",
                value: "Candidate",
                icon: <User className="h-4 w-4" />,
                color: "blue",
              },
              {
                label: "Login Method",
                value: isGoogleUser ? "Google OAuth" : "Email & Password",
                icon: <ShieldCheck className="h-4 w-4" />,
                color: "indigo",
              },
              {
                label: "Member Since",
                value: memberSince,
                icon: <CalendarDays className="h-4 w-4" />,
                color: "emerald",
              },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl p-4 
                  ${color === "blue" ? "bg-blue-50/60 border border-blue-100" : ""}
                  ${color === "indigo" ? "bg-indigo-50/60 border border-indigo-100" : ""}
                  ${color === "emerald" ? "bg-emerald-50/60 border border-emerald-100" : ""}
                `}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                    ${color === "blue" ? "bg-blue-100 text-blue-600" : ""}
                    ${color === "indigo" ? "bg-indigo-100 text-indigo-600" : ""}
                    ${color === "emerald" ? "bg-emerald-100 text-emerald-600" : ""}
                  `}
                >
                  {icon}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide
                      ${color === "blue" ? "text-blue-500" : ""}
                      ${color === "indigo" ? "text-indigo-500" : ""}
                      ${color === "emerald" ? "text-emerald-600" : ""}
                    `}
                  >
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Danger Zone
              </h4>
              <p className="text-xs text-slate-500">
                Irreversible account actions
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50/60 p-4">
            <div>
              <p className="text-sm font-semibold text-red-900">
                Delete Account
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="group shrink-0 rounded-xl bg-linear-to-r from-red-600 to-rose-600 px-5 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:from-rose-600 hover:to-red-500 hover:shadow-xl hover:shadow-red-500/30 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Delete Account
                </h3>
                <p className="text-sm text-slate-500">
                  This action is permanent.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              All your data, including your profile and interview history, will
              be permanently removed. This cannot be undone.
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type <span className="font-mono text-red-600">DELETE</span> to
                confirm
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="rounded-xl border-red-200 bg-red-50/50 focus:border-red-400 focus:ring-red-400/20"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="flex-1 rounded-xl bg-linear-to-r from-red-600 to-rose-600 px-4 font-semibold text-white shadow-md transition-all duration-300 hover:from-rose-600 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Confirm Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
