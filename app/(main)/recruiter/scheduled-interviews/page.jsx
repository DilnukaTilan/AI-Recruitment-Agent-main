"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  CheckSquare,
  ChevronRight,
  List,
  Loader2,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import { getInterviewCandidateAccessList } from "@/lib/interviewCandidates";

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

function formatRelativeDate(dateString) {
  if (!dateString) return "No responses yet";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "No responses yet";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatPill({ icon: Icon, value, label, iconColor, bgFrom, bgTo }) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl border border-white/60 bg-linear-to-b ${bgFrom} ${bgTo} px-2 py-3.5 text-center shadow-sm`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </span>
      <span className="text-base leading-none font-extrabold tabular-nums text-slate-800">
        {value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
  );
}

function ScheduledInterviewCard({ interview }) {
  const interviewTitle = interview?.jobPosition?.trim() || "Untitled Interview";
  const questionCount = Array.isArray(
    interview?.questionList?.interviewQuestions,
  )
    ? interview.questionList.interviewQuestions.length
    : Array.isArray(interview?.questList)
      ? interview.questList.length
      : 0;

  const candidateCount = getInterviewCandidateAccessList(interview).length;
  const completedCandidateCount = interview?.completed_candidates_count ?? 0;
  const responseCount = interview?.interview_results_count ?? 0;
  const createdAtLabel = formatDate(interview?.created_at);
  const latestResponseLabel = formatRelativeDate(interview?.latest_response_at);
  const expiresAt = interview?.created_at
    ? formatDate(
        new Date(
          new Date(interview.created_at).getTime() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      )
    : "Not available";

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
              Created {createdAtLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatPill
            icon={Users}
            value={completedCandidateCount}
            label="Completed"
            iconColor="text-emerald-500"
            bgFrom="from-emerald-50"
            bgTo="to-white"
          />
          <StatPill
            icon={CheckSquare}
            value={responseCount}
            label="Responses"
            iconColor="text-indigo-500"
            bgFrom="from-indigo-50"
            bgTo="to-white"
          />
          <StatPill
            icon={List}
            value={questionCount || "-"}
            label="Questions"
            iconColor="text-violet-500"
            bgFrom="from-violet-50"
            bgTo="to-white"
          />
        </div>

        <div className="rounded-xl border border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">
              Latest response
            </span>
            <span className="text-slate-500">{latestResponseLabel}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
            <span>
              {candidateCount} candidate{candidateCount === 1 ? "" : "s"}
            </span>
            <span className="text-slate-300">|</span>
            <span>Expires {expiresAt}</span>
          </div>
        </div>

        <div className="mt-auto h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />

        <Button
          asChild
          className="group/button h-10 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:from-indigo-600 hover:to-blue-500 hover:shadow-2xl hover:shadow-indigo-500/40 cursor-pointer"
        >
          <Link
            href={`/recruiter/scheduled-interviews/${interview.interview_id}/details`}
          >
            View Details
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ScheduledInterviewsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [interviewList, setInterviewList] = useState([]);

  useEffect(() => {
    if (user?.email) {
      getScheduledInterviews();
    }
  }, [user?.email]);

  const getScheduledInterviews = async () => {
    setLoading(true);

    try {
      const { data: interviews, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("userEmail", user.email)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const safeInterviews = interviews || [];
      const interviewIds = safeInterviews
        .map((interview) => interview?.interview_id)
        .filter(Boolean);

      if (interviewIds.length === 0) {
        setInterviewList([]);
        return;
      }

      const { data: interviewResults, error: resultsError } = await supabase
        .from("interview_results")
        .select("interview_id, email, completed_at")
        .in("interview_id", interviewIds);

      if (resultsError) throw resultsError;

      const summaryByInterviewId = (interviewResults || []).reduce(
        (accumulator, result) => {
          const interviewId = result?.interview_id;
          if (!interviewId) return accumulator;

          const currentSummary = accumulator[interviewId] || {
            interview_results_count: 0,
            latest_response_at: null,
            completedEmails: new Set(),
          };

          currentSummary.interview_results_count += 1;

          if (
            result?.completed_at &&
            (!currentSummary.latest_response_at ||
              new Date(result.completed_at) >
                new Date(currentSummary.latest_response_at))
          ) {
            currentSummary.latest_response_at = result.completed_at;
          }

          if (result?.email) {
            currentSummary.completedEmails.add(result.email.toLowerCase());
          }

          accumulator[interviewId] = currentSummary;
          return accumulator;
        },
        {},
      );

      const interviewsWithResponses = safeInterviews
        .map((interview) => {
          const summary = summaryByInterviewId[interview.interview_id];

          return {
            ...interview,
            interview_results_count: summary?.interview_results_count || 0,
            latest_response_at: summary?.latest_response_at || null,
            completed_candidates_count: summary?.completedEmails?.size || 0,
          };
        })
        .filter((interview) => interview.interview_results_count > 0);

      setInterviewList(interviewsWithResponses);
    } catch (error) {
      console.error("Failed to fetch scheduled interviews:", error);
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
          Scheduled Interviews
        </h2>
        <p className="text-gray-500">
          Review interviews that already have candidate responses and open
          detailed reports.
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
                Loading scheduled interviews
              </h3>
              <p className="text-sm text-slate-400">
                Pulling completed interview activity for your candidates.
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
              No interview responses yet
            </h3>
            <p className="text-sm text-slate-400">
              Interviews will appear here once at least one candidate completes
              a response.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {interviewList.map((interview) => (
            <ScheduledInterviewCard
              interview={interview}
              key={interview.id || interview.interview_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ScheduledInterviewsPage;
