"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CandidateFeedbackDialog from "./CandidateFeedbackDialog";

function formatDateTime(dateString) {
  if (!dateString) return "Not available";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name, email) {
  const source = name?.trim() || email || "C";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function CandidateList({ candidates, interviewTitle }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.18)]">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h3 className="text-lg font-bold text-slate-900">Candidates</h3>
        <p className="mt-1 text-sm text-slate-500">
          Each candidate is marked as completed or pending based on whether they
          have submitted this interview.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {candidates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            No candidates have been added to this interview yet.
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate) => {
              const isCompleted = candidate.status === "Completed";

              return (
                <div
                  key={candidate.email}
                  className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:text-left"
                >
                  <div className="flex min-w-0 flex-1 flex-col items-center gap-3 sm:flex-row sm:items-center">
                    <Avatar className="h-12 w-12 shrink-0 rounded-full shadow-md shadow-blue-500/20 sm:h-11 sm:w-11">
                      {candidate.picture ? (
                        <AvatarImage
                          src={candidate.picture}
                          alt={candidate.name || candidate.email}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                        {getInitials(candidate.name, candidate.email)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 sm:flex-1">
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <h4 className="truncate text-sm font-semibold text-slate-800">
                          {candidate.name}
                        </h4>
                        <Badge
                          className={
                            isCompleted
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }
                          variant="outline"
                        >
                          {candidate.status}
                        </Badge>
                      </div>

                      <p className="mt-1 break-all text-xs text-slate-500 sm:text-sm">
                        {candidate.email}
                      </p>

                      <p className="mt-1.5 text-xs text-slate-400">
                        {isCompleted
                          ? `Completed on ${formatDateTime(candidate.completedAt)}`
                          : "Awaiting candidate response."}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 items-center justify-center sm:w-auto sm:justify-end">
                    {isCompleted ? (
                      <CandidateFeedbackDialog
                        candidate={candidate}
                        interviewTitle={interviewTitle}
                      />
                    ) : (
                      <span className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-center text-xs font-medium text-slate-500 sm:w-auto sm:py-1">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default CandidateList;
