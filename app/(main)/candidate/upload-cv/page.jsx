"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Eye,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";

const CV_BUCKET = "candidate-cvs";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];

function formatFileSize(bytes) {
  if (!bytes) return "";

  const sizeInMb = bytes / (1024 * 1024);
  return `${sizeInMb.toFixed(sizeInMb >= 10 ? 0 : 1)} MB`;
}

function getSafeFileName(fileName) {
  const normalizedName = fileName.trim().replace(/\s+/g, "-");
  const safeName = normalizedName.replace(/[^a-zA-Z0-9._-]/g, "");
  return safeName || `cv-${Date.now()}`;
}

function hasAcceptedExtension(fileName) {
  return ACCEPTED_EXTENSIONS.some((extension) =>
    fileName.toLowerCase().endsWith(extension),
  );
}

function getDisplayFileName(filePath) {
  return filePath?.split("/").pop() || filePath;
}

export default function UploadCvPage() {
  const { user, setUser, fetchAndSetUser } = useUser();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentCv, setCurrentCv] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setCurrentCv(user?.cv || null);
  }, [user?.cv]);

  const validateFile = (file) => {
    if (!file) return false;

    if (
      !ACCEPTED_TYPES.includes(file.type) &&
      !hasAcceptedExtension(file.name)
    ) {
      toast.error("Please upload a PDF, DOC, or DOCX file.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Please upload a CV smaller than 10MB.");
      return false;
    }

    return true;
  };

  const handleFileSelection = (file) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFileSelection(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select your CV first.");
      return;
    }

    if (!user?.email) {
      toast.error("Please sign in before uploading your CV.");
      return;
    }

    try {
      setUploading(true);

      const safeEmail = user.email.replace(/[^a-zA-Z0-9]/g, "_");
      const safeFileName = getSafeFileName(selectedFile.name);
      const filePath = `${safeEmail}/${Date.now()}-${safeFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(CV_BUCKET)
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          contentType: selectedFile.type,
          upsert: false,
        });

      if (uploadError) {
        toast.error("Failed to upload your CV.");
        console.error("CV upload error:", uploadError);
        return;
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ cv: uploadData.path })
        .eq("email", user.email)
        .select("*")
        .single();

      if (updateError) {
        await supabase.storage.from(CV_BUCKET).remove([uploadData.path]);
        toast.error("CV uploaded, but it could not be saved to your profile.");
        console.error("CV profile update error:", updateError);
        return;
      }

      setCurrentCv(uploadData.path);
      setSelectedFile(null);
      setUser?.(updatedUser);
      await fetchAndSetUser?.();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("CV uploaded successfully.");
    } catch (error) {
      toast.error("Something went wrong while uploading your CV.");
      console.error("Unexpected CV upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleViewCv = async () => {
    if (!currentCv) {
      toast.error("No CV is available to view.");
      return;
    }

    const previewWindow = window.open("", "_blank");

    try {
      setViewing(true);

      const { data, error } = await supabase.storage
        .from(CV_BUCKET)
        .createSignedUrl(currentCv, 300);

      if (error || !data?.signedUrl) {
        previewWindow?.close();
        toast.error("Failed to open your CV.");
        console.error("CV signed URL error:", error);
        return;
      }

      if (previewWindow) {
        previewWindow.location.href = data.signedUrl;
      } else {
        window.location.href = data.signedUrl;
      }
    } catch (error) {
      previewWindow?.close();
      toast.error("Something went wrong while opening your CV.");
      console.error("Unexpected CV view error:", error);
    } finally {
      setViewing(false);
    }
  };

  const handleDeleteCv = async () => {
    if (!currentCv) {
      toast.error("No CV is available to delete.");
      return;
    }

    if (!user?.email) {
      toast.error("Please sign in before deleting your CV.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your uploaded CV?",
    );
    if (!confirmed) return;

    try {
      setDeleting(true);

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({ cv: null })
        .eq("email", user.email)
        .select("*")
        .single();

      if (updateError) {
        toast.error("Failed to remove the CV from your profile.");
        console.error("CV profile delete error:", updateError);
        return;
      }

      const cvToDelete = currentCv;
      const { error: removeError } = await supabase.storage
        .from(CV_BUCKET)
        .remove([cvToDelete]);

      if (removeError) {
        toast.error("CV was removed from your profile, but not from storage.");
        console.error("CV storage delete error:", removeError);
      } else {
        toast.success("CV deleted successfully.");
      }

      setCurrentCv(null);
      setUser?.(updatedUser);
      await fetchAndSetUser?.();
    } catch (error) {
      toast.error("Something went wrong while deleting your CV.");
      console.error("Unexpected CV delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-10">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Upload CV
        </h2>
        <p className="text-gray-500">
          Keep your latest CV attached to your candidate profile.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)] sm:p-8">
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            className={`relative z-10 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 sm:min-h-[320px] sm:px-6 sm:py-10 ${
              dragActive
                ? "border-indigo-400 bg-indigo-50 shadow-inner"
                : "border-slate-200 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/40"
            }`}
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 sm:h-16 sm:w-16">
              <UploadCloud className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {selectedFile ? selectedFile.name : "Select your CV"}
            </h3>
            <p className="mt-2 max-w-md text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              PDF, DOC, or DOCX files up to 10MB.
            </p>

            {selectedFile && (
              <div className="mt-5 flex max-w-full items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm sm:px-4 sm:py-3">
                <FileText className="h-4 w-4 shrink-0 text-indigo-600" />
                <span className="min-w-0 truncate font-medium">
                  {selectedFile.name}
                </span>
                <span className="shrink-0 text-slate-400">
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>
            )}

            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-xl border-slate-200 bg-white px-5 font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 sm:w-auto cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Choose File
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="group w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-5 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-600 hover:to-blue-500 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    Upload CV
                  </>
                )}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => handleFileSelection(event.target.files?.[0])}
              className="hidden"
            />
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Current CV</h3>
              <p className="text-xs text-slate-500">Saved in your profile</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {currentCv ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleViewCv}
                  disabled={viewing || deleting}
                  className="flex w-full items-start gap-3 rounded-lg p-1 text-left outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      CV uploaded
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-indigo-600">
                      {getDisplayFileName(currentCv)}
                    </p>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleViewCv}
                    disabled={viewing || deleting}
                    className="rounded-xl border-slate-200 bg-white font-semibold text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    {viewing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDeleteCv}
                    disabled={viewing || deleting}
                    className="rounded-xl border-red-200 bg-white font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    No CV uploaded
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your uploaded file will be linked to this account.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
