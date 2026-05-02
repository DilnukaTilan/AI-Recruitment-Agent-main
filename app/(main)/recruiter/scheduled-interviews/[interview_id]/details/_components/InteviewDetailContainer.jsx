"use client";

import {
  Briefcase,
  Calendar,
  CheckSquare,
  Clock3,
  FileText,
  List,
  Users,
  Sparkles,
  CircleDot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const statCardStyles = [
  {
    gradient: "from-blue-500 to-blue-600",
    bgGlow: "bg-blue-500/10",
    textColor: "text-blue-600",
    borderColor: "border-blue-100",
    shadowColor: "shadow-blue-500/10",
  },
  {
    gradient: "from-emerald-500 to-emerald-600",
    bgGlow: "bg-emerald-500/10",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-100",
    shadowColor: "shadow-emerald-500/10",
  },
  {
    gradient: "from-indigo-500 to-indigo-600",
    bgGlow: "bg-indigo-500/10",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-100",
    shadowColor: "shadow-indigo-500/10",
  },
  {
    gradient: "from-violet-500 to-violet-600",
    bgGlow: "bg-violet-500/10",
    textColor: "text-violet-600",
    borderColor: "border-violet-100",
    shadowColor: "shadow-violet-500/10",
  },
];

function StatCard({ icon: Icon, label, value, style }) {
  return (
    <div
      className={`group relative min-w-0 overflow-hidden rounded-2xl border ${style.borderColor} bg-white p-3 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${style.shadowColor}`}
    >
      <div
        className={`absolute -right-4 -top-4 h-16 w-16 rounded-full ${style.bgGlow} opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative flex flex-col sm:flex-row min-w-0 items-center gap-2 sm:gap-3">
        <span
          className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${style.gradient} text-white shadow-md ${style.shadowColor}`}
        >
          <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </span>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="truncate text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-0.5 text-lg sm:text-xl font-extrabold tracking-tight text-slate-800 truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function InteviewDetailContainer({ interview, summary }) {
  const interviewTitle = interview?.jobPosition?.trim() || "Untitled Interview";
  const questions = Array.isArray(interview?.questionList?.interviewQuestions)
    ? interview.questionList.interviewQuestions
    : [];

  const completionPercentage =
    summary.totalCandidates > 0
      ? Math.round(
          (summary.completedCandidates / summary.totalCandidates) * 100,
        )
      : 0;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12)]">
      <div className="relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-indigo-50/50 to-violet-50" />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-400/8 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-400/8 blur-3xl" />
        <div className="absolute right-1/3 top-0 h-px w-40 bg-linear-to-r from-transparent via-blue-300/40 to-transparent" />

        <div className="relative px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl flex-1">
              <div className="flex flex-col items-start gap-4 min-[480px]:flex-row min-[480px]:items-center">
                <div className="relative">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10">
                    <Briefcase className="h-5.5 w-5.5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold tracking-tight text-blue-600 sm:text-[1.65rem]">
                    {interviewTitle}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                    Candidate progress, interview setup, and submitted reports.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto lg:max-w-md lg:flex-1 lg:grid-cols-2 xl:max-w-none xl:flex-none xl:grid-cols-4">
              <StatCard
                icon={Users}
                label="Candidates"
                value={summary.totalCandidates}
                style={statCardStyles[0]}
              />
              <StatCard
                icon={CheckSquare}
                label="Completed"
                value={summary.completedCandidates}
                style={statCardStyles[1]}
              />
              <StatCard
                icon={FileText}
                label="Reports"
                value={summary.responseCount}
                style={statCardStyles[2]}
              />
              <StatCard
                icon={List}
                label="Questions"
                value={questions.length}
                style={statCardStyles[3]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <FileText className="h-4 w-4" />
              </span>
              <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Job Description
              </h4>
            </div>
            <div className="mt-4 rounded-xl bg-slate-50/80 px-4 py-3">
              <p className="whitespace-pre-line text-[13.5px] leading-7 text-slate-600">
                {interview?.jobDescription?.trim() ||
                  "No job description was provided for this interview."}
              </p>
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                  <List className="h-4 w-4" />
                </span>
                <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Interview Questions
                </h4>
              </div>
              {questions.length > 0 && (
                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-600 ring-1 ring-violet-100">
                  {questions.length}
                </span>
              )}
            </div>

            {questions.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
                <p className="text-sm text-slate-400">
                  No interview questions were saved for this record.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {questions.map((question, index) => (
                  <div
                    key={`${question?.question || "question"}-${index}`}
                    className="group/item flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 transition-all duration-200 hover:border-slate-200 hover:bg-slate-50"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium leading-relaxed text-slate-700">
                        {question?.question || "Question unavailable"}
                      </p>
                      {question?.type && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <CircleDot className="h-3 w-3 text-slate-300" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {question.type}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-linear-to-br from-slate-50 to-white p-5 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Completion Overview
            </h4>

            <div className="mt-4 flex items-center justify-center">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${completionPercentage * 2.89} 289`}
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient
                      id="progressGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <span className="text-2xl font-extrabold text-slate-800">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              {summary.completedCandidates} of {summary.totalCandidates}{" "}
              candidates completed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-linear-to-br from-slate-50 to-white p-5 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Interview Summary
            </h4>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 transition-colors duration-200 hover:border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </span>
                  <span className="text-sm text-slate-600">Created</span>
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {formatDate(interview?.created_at)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 transition-colors duration-200 hover:border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
                    <Clock3 className="h-4 w-4 text-indigo-600" />
                  </span>
                  <span className="text-sm text-slate-600">Duration</span>
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {interview?.duration || "Not available"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 transition-colors duration-200 hover:border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-100">
                    <Users className="h-4 w-4 text-amber-600" />
                  </span>
                  <span className="text-sm text-slate-600">Pending</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    summary.pendingCandidates > 0
                      ? "border-amber-200 bg-amber-50 font-bold text-amber-700"
                      : "border-emerald-200 bg-emerald-50 font-bold text-emerald-700"
                  }
                >
                  {summary.pendingCandidates > 0
                    ? `${summary.pendingCandidates} remaining`
                    : "All done"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteviewDetailContainer;
