"use client";

import React, { useEffect, useState, useContext, useCallback } from "react";
import Image from "next/image";
import {
  Clock,
  Video,
  CheckCircle2,
  ChevronRight,
  User,
  Mail,
  Mic,
  Wifi,
  Camera,
  Chrome,
  Volume2,
  Loader2,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { useUser } from "@/app/provider";

function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}

const CHECKLIST_ITEMS = [
  { icon: Mic, text: "Give access to your microphone." },
  { icon: Wifi, text: "Ensure a stable internet connection." },
  { icon: Camera, text: "Enable camera permissions." },
  { icon: Chrome, text: "Use Chrome or Edge browser." },
  { icon: Volume2, text: "Find a quiet environment." },
];

function Interview() {
  const params = useParams();
  const interview_id = params?.interview_id;
  const [interviewData, setInterviewData] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const router = useRouter();
  const { user } = useUser();

  const GetInterviewDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data: Interviews, error } = await supabase
        .from("interviews")
        .select(
          "userEmail, jobPosition, jobDescription, duration, type, questionList",
        )
        .eq("interview_id", interview_id);

      if (error) throw error;
      if (!Interviews?.length) throw new Error("No interview found.");

      setInterviewData(Interviews[0]);
    } catch (error) {
      toast.error(error.message || "Failed to fetch details.");
    } finally {
      setLoading(false);
    }
  }, [interview_id]);

  useEffect(() => {
    if (interview_id) GetInterviewDetails();
  }, [interview_id, GetInterviewDetails]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error || !session?.user) {
          router.push("/login");
          return;
        }
      } catch {
        router.push("/login");
      }
    };
    checkAccess();
  }, [router]);

  useEffect(() => {
    if (user && !userEmail) setUserEmail(user.email || "");
    if (user && !userName) setUserName(user.name || "");
  }, [user, userEmail, userName]);

  const onJoinInterview = async () => {
    if (!userName.trim() || !userEmail.trim()) {
      toast.error("Your name and email are required to start the interview.");
      return;
    }
    setJoining(true);
    try {
      const newInterviewInfo = {
        ...interviewInfo,
        candidate_name: userName,
        jobPosition: interviewData?.jobPosition,
        jobDescription: interviewData?.jobDescription,
        duration: interviewData?.duration,
        userEmail: userEmail,
        type: interviewData?.type,
        questionList: interviewData?.questionList,
        interview_id: interview_id,
      };
      setInterviewInfo(newInterviewInfo);

      if (typeof window !== "undefined") {
        localStorage.setItem("interviewInfo", JSON.stringify(newInterviewInfo));
      }
      toast.success("Creating your interview session...");
      router.push(`/interview/${interview_id}/start`);
    } catch (error) {
      toast.error("Connection failed!");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)] max-w-md w-full">
          <div className="flex flex-col items-center gap-5 px-8 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-800">
                Loading Interview
              </h2>
              <p className="text-sm text-slate-500">
                Fetching your interview details. This will only take a moment.
              </p>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              AI Interview Portal
            </h1>
            <p className="mt-1 text-gray-500">
              Next-generation hiring experience
            </p>
          </div>
          <div className="relative isolate mt-4 flex h-80 w-full max-w-sm items-center justify-center overflow-hidden rounded-4xl border border-blue-100 sm:h-112 sm:max-w-md sm:p-8">
            <div className="pointer-events-none absolute inset-x-10 top-6 h-16 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-indigo-300/30 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_58%)]" />

            <div className="absolute left-5 top-5 rounded-full border border-blue-100 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm backdrop-blur-sm">
              AI Interview
            </div>

            <div className="relative h-full w-full transition-transform duration-500 hover:scale-[1.03]">
              <Image
                src="/interview.png"
                alt="Interview"
                fill
                className="object-contain drop-shadow-[0_24px_36px_rgba(37,99,235,0.18)]"
                priority
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between rounded-xl border border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">
                {interviewData?.jobPosition || "AI Interview"}
              </span>
              <span className="text-xs text-slate-500">Job Position</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Clock className="h-3 w-3" />
              {interviewData?.duration || "30 Min"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
          <div className="relative z-10 p-6 sm:p-8 space-y-7">
            <div>
              <SectionLabel icon={User} label="Your Full Name" />
              <Input
                value={userName}
                readOnly
                className="rounded-xl border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed select-none"
              />
            </div>

            <div>
              <SectionLabel icon={Mail} label="Professional Email" />
              <Input
                type="email"
                value={userEmail}
                readOnly
                className="rounded-xl border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed select-none"
              />
            </div>

            <div className="border-t border-slate-100" />

            <div>
              <SectionLabel icon={CheckCircle2} label="Preparation Checklist" />
              <p className="text-xs text-slate-400 mb-3 -mt-1">
                Ensure you've completed the following before starting.
              </p>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                      <item.icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </span>
                    <span className="text-sm text-slate-700 font-medium">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100" />

            <div className="flex justify-center sm:justify-end">
              <Button
                onClick={onJoinInterview}
                disabled={joining}
                size="lg"
                className={`group relative overflow-hidden rounded-xl px-8 font-semibold text-white shadow-md transition-all duration-300 gap-2 ${
                  joining
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-linear-to-r from-blue-600 to-indigo-600 hover:-translate-y-0.5 hover:from-indigo-600 hover:to-blue-500 hover:shadow-2xl hover:shadow-indigo-500/40 cursor-pointer"
                }`}
              >
                {joining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing…
                  </>
                ) : (
                  <span className="relative flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Start Interview Session
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs font-medium text-slate-400">
          Powered by AI interview technology • Secure and confidential
        </p>
      </div>
    </div>
  );
}

export default Interview;
