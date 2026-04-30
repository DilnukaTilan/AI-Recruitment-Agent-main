"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Briefcase,
  Calendar,
  Loader2,
  Mail,
  Sparkles,
  Video,
} from "lucide-react";
import { useUser } from "@/app/provider";
import { supabase } from "@/services/supabaseClient";

function formatDate(dateString) {
  if (!dateString) return "Not available";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function parseFeedbackPayload(rawPayload) {
  if (!rawPayload) return null;

  if (typeof rawPayload === "string") {
    try {
      const parsedPayload = JSON.parse(rawPayload);
      return parsedPayload?.feedback || parsedPayload;
    } catch {
      return null;
    }
  }

  return rawPayload?.feedback || rawPayload;
}

function CandidateInterviewCard({ interview }) {
  const interviewTitle =
    interview?.jobPosition?.trim() || "Completed Interview";
  const interviewSummary =
    interview?.summary?.trim() ||
    "Your interview has been completed successfully. You will be emailed by the recruiter with the next steps.";

  const isRecommended =
    interview?.recommendation === "Recommended" ||
    interview?.recommendation === "Strongly Recommended";

  const summaryRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;

    const checkScroll = () => {
      setShowScrollIndicator(
        el.scrollHeight > el.clientHeight &&
          el.scrollTop + el.clientHeight < el.scrollHeight - 4,
      );
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, [interviewSummary]);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200/70 hover:shadow-[0_16px_40px_-8px_rgba(79,70,229,0.18)]">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 transition-transform duration-300 group-hover:scale-105">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3
              className="truncate text-[15px] leading-snug font-semibold text-blue-600"
              title={interviewTitle}
            >
              {interviewTitle}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="h-3 w-3" />
              Completed {formatDate(interview?.completed_at)}
            </p>
          </div>
        </div>

        <div
          className={`relative rounded-xl border px-3 py-3 ${
            isRecommended
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${
              isRecommended ? "text-emerald-800" : "text-amber-800"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Interview Summary
          </div>
          <p
            ref={summaryRef}
            className="mt-2 h-40 overflow-y-auto text-sm leading-6 text-slate-600 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {interviewSummary}
          </p>
          {showScrollIndicator && (
            <div
              className={`pointer-events-none absolute right-0 bottom-0 left-0 rounded-b-xl bg-linear-to-t pt-8 ${
                isRecommended
                  ? "from-teal-50 via-teal-50/80 to-transparent"
                  : "from-orange-50 via-orange-50/80 to-transparent"
              }`}
            />
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Next Steps
              </p>
              <p className="mt-1 text-sm text-slate-600">
                You will be emailed by the recruiter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateInterviewsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [interviewList, setInterviewList] = useState([]);

  useEffect(() => {
    if (user?.email) {
      getCandidateInterviews();
    }
  }, [user?.email]);

  const getCandidateInterviews = async () => {
    setLoading(true);

    try {
      const { data: interviewResults, error: resultsError } = await supabase
        .from("interview_results")
        .select(
          "interview_id, completed_at, conversation_transcript, recommendations",
        )
        .eq("email", user.email)
        .order("completed_at", { ascending: false });

      if (resultsError) throw resultsError;

      const latestResultByInterviewId = (interviewResults || []).reduce(
        (accumulator, result) => {
          const interviewId = result?.interview_id;
          if (!interviewId || accumulator[interviewId]) return accumulator;

          accumulator[interviewId] = result;
          return accumulator;
        },
        {},
      );

      const interviewIds = Object.keys(latestResultByInterviewId);

      if (interviewIds.length === 0) {
        setInterviewList([]);
        return;
      }

      const { data: interviews, error: interviewsError } = await supabase
        .from("interviews")
        .select("interview_id, jobPosition, type, duration, userEmail")
        .in("interview_id", interviewIds);

      if (interviewsError) throw interviewsError;

      const interviewsById = (interviews || []).reduce(
        (accumulator, interview) => {
          if (!interview?.interview_id) return accumulator;

          accumulator[interview.interview_id] = interview;
          return accumulator;
        },
        {},
      );

      const candidateInterviews = interviewIds
        .map((interviewId) => {
          const result = latestResultByInterviewId[interviewId];
          const interview = interviewsById[interviewId] || {};
          const feedback = parseFeedbackPayload(
            result?.conversation_transcript,
          );

          return {
            interview_id: interviewId,
            jobPosition: interview?.jobPosition || "Completed Interview",
            type: interview?.type || "General",
            duration: interview?.duration || "Not specified",
            recruiterEmail: interview?.userEmail || null,
            completed_at: result?.completed_at || null,
            recommendation:
              feedback?.recommendation ||
              result?.recommendations ||
              "Recommendation unavailable",
            summary: feedback?.summary || "",
          };
        })
        .sort(
          (left, right) =>
            new Date(right.completed_at).getTime() -
            new Date(left.completed_at).getTime(),
        );

      setInterviewList(candidateInterviews);
    } catch (error) {
      console.error("Failed to fetch candidate interviews:", error);
      setInterviewList([]);
    } finally {
      setLoading(false);
    }
  };

  const hasInterviews = useMemo(
    () => interviewList.length > 0,
    [interviewList.length],
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-10">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          My Interviews
        </h2>
        <p className="text-gray-500">
          Review the interviews you have completed and the summary generated for
          each conversation.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[15px] font-semibold text-slate-800">
                Loading your interviews
              </h3>
              <p className="text-sm text-slate-400">
                Pulling your completed interview history and summaries.
              </p>
            </div>
          </div>
        </div>
      ) : !hasInterviews ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
            <Video className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold text-slate-800">
              No completed interviews yet
            </h3>
            <p className="text-sm text-slate-400">
              Interviews you complete will appear here once your session ends.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {interviewList.map((interview) => (
            <CandidateInterviewCard
              interview={interview}
              key={interview.interview_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CandidateInterviewsPage;
