"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, TriangleAlert } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import {
  getInterviewCandidateAccessList,
  normalizeEmail,
} from "@/lib/interviewCandidates";
import CandidateList from "./_components/CandidateList";
import InteviewDetailContainer from "./_components/InteviewDetailContainer";

function buildUserProfileMap(userRows = []) {
  return userRows.reduce((accumulator, userRecord) => {
    const normalizedUserEmail = normalizeEmail(userRecord?.email);
    if (!normalizedUserEmail) return accumulator;

    accumulator[normalizedUserEmail] = {
      email: normalizedUserEmail,
      name: userRecord?.name?.trim() || null,
      picture: userRecord?.picture || null,
    };

    return accumulator;
  }, {});
}

function getCandidateDisplayName(email, latestResult, userProfile) {
  return (
    userProfile?.name ||
    latestResult?.fullname?.trim() ||
    email.split("@")[0].replace(/[._-]+/g, " ")
  );
}

function buildCandidateRows(interview, results, userProfilesByEmail) {
  const candidateAccessList = getInterviewCandidateAccessList(interview);

  const latestResultByEmail = (results || []).reduce((accumulator, result) => {
    const normalizedCandidateEmail = normalizeEmail(result?.email);
    if (!normalizedCandidateEmail) return accumulator;

    const existingResult = accumulator[normalizedCandidateEmail];
    const nextDate = result?.completed_at
      ? new Date(result.completed_at)
      : null;
    const currentDate = existingResult?.completed_at
      ? new Date(existingResult.completed_at)
      : null;

    if (
      !existingResult ||
      (nextDate && (!currentDate || nextDate > currentDate))
    ) {
      accumulator[normalizedCandidateEmail] = result;
    }

    return accumulator;
  }, {});

  const candidateRows = candidateAccessList.map((candidate) => {
    const latestResult = latestResultByEmail[candidate.email] || null;
    const completed = Boolean(latestResult);
    const userProfile = userProfilesByEmail[candidate.email] || null;

    return {
      email: candidate.email,
      maxJoins: candidate.maxJoins,
      name: getCandidateDisplayName(candidate.email, latestResult, userProfile),
      picture: userProfile?.picture || null,
      status: completed ? "Completed" : "Pending",
      completedAt: latestResult?.completed_at || null,
      result: latestResult,
    };
  });

  Object.entries(latestResultByEmail).forEach(([email, result]) => {
    const alreadyIncluded = candidateRows.some(
      (candidate) => candidate.email === email,
    );
    if (alreadyIncluded) return;

    const userProfile = userProfilesByEmail[email] || null;

    candidateRows.push({
      email,
      maxJoins: null,
      name: getCandidateDisplayName(email, result, userProfile),
      picture: userProfile?.picture || null,
      status: "Completed",
      completedAt: result?.completed_at || null,
      result,
    });
  });

  return candidateRows.sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "Completed" ? -1 : 1;
    }

    return left.email.localeCompare(right.email);
  });
}

function ScheduledInterviewDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [interview, setInterview] = useState(null);
  const [results, setResults] = useState([]);
  const [userProfilesByEmail, setUserProfilesByEmail] = useState({});

  useEffect(() => {
    if (user?.email && params?.interview_id) {
      getInterviewDetails();
    }
  }, [user?.email, params?.interview_id]);

  const getInterviewDetails = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [
        { data: interviewData, error: interviewError },
        { data: resultData, error: resultsError },
      ] = await Promise.all([
        supabase
          .from("interviews")
          .select("*")
          .eq("userEmail", user.email)
          .eq("interview_id", params.interview_id)
          .single(),
        supabase
          .from("interview_results")
          .select(
            "fullname, email, completed_at, conversation_transcript, recommendations, interview_id",
          )
          .eq("interview_id", params.interview_id)
          .order("completed_at", { ascending: false }),
      ]);

      if (interviewError) throw interviewError;
      if (resultsError) throw resultsError;

      const candidateEmails = Array.from(
        new Set([
          ...getInterviewCandidateAccessList(interviewData).map(
            (candidate) => candidate.email,
          ),
          ...(resultData || [])
            .map((result) => normalizeEmail(result?.email))
            .filter(Boolean),
        ]),
      );

      let userProfileMap = {};

      if (candidateEmails.length > 0) {
        const { data: userRecords, error: usersError } = await supabase
          .from("users")
          .select("email, name, picture")
          .in("email", candidateEmails);

        if (usersError) {
          console.error("Failed to fetch candidate user profiles:", usersError);
        } else {
          userProfileMap = buildUserProfileMap(userRecords);
        }
      }

      setInterview(interviewData || null);
      setResults(resultData || []);
      setUserProfilesByEmail(userProfileMap);
    } catch (error) {
      console.error("Failed to fetch interview details:", error);
      setErrorMessage(
        error?.message || "Unable to load the interview details right now.",
      );
      setInterview(null);
      setResults([]);
      setUserProfilesByEmail({});
    } finally {
      setLoading(false);
    }
  };

  const candidates = useMemo(
    () => buildCandidateRows(interview, results, userProfilesByEmail),
    [interview, results, userProfilesByEmail],
  );

  const summary = useMemo(() => {
    const totalCandidates = candidates.length;
    const completedCandidates = candidates.filter(
      (candidate) => candidate.status === "Completed",
    ).length;

    return {
      totalCandidates,
      completedCandidates,
      pendingCandidates: Math.max(totalCandidates - completedCandidates, 0),
      responseCount: results.length,
    };
  }, [candidates, results.length]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-10">
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[15px] font-semibold text-slate-800">
                Loading interview details
              </h3>
              <p className="text-sm text-slate-400">
                Gathering the interview summary and candidate reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col gap-1 border-b pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Interview Details
            </h2>
          </div>
          <p className="text-gray-500 ml-12">
            Review the interview setup and candidate completion status in one
            place.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30">
            <TriangleAlert className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold text-slate-800">
              Interview not found
            </h3>
            <p className="text-sm text-slate-400">
              {errorMessage || "This interview could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-10">
      <div className="flex flex-col gap-1 border-b pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Interview Details
          </h2>
        </div>
        <p className="text-gray-500 ml-12">
          Review the interview setup and candidate completion status in one
          place.
        </p>
      </div>

      <InteviewDetailContainer interview={interview} summary={summary} />
      <CandidateList
        candidates={candidates}
        interviewTitle={interview?.jobPosition}
      />
    </div>
  );
}

export default ScheduledInterviewDetailsPage;
