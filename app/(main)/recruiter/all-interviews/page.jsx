"use client";

import { Video } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import InterviewCard from "../dashboard/_components/InterviewCard";

function LatestInterviewsList() {
  const router = useRouter();
  const [interviewList, setInterviewList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (user?.email) {
      getInterviewList();
    }
  }, [user]);

  const getInterviewList = async () => {
    const { data: interviews, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("userEmail", user?.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch interviews:", error);
      return;
    }

    const safeInterviews = interviews || [];
    const interviewIds = safeInterviews
      .map((interview) => interview?.interview_id)
      .filter(Boolean);

    if (interviewIds.length === 0) {
      setInterviewList(safeInterviews);
      return;
    }

    const { data: interviewResults, error: resultsError } = await supabase
      .from("interview_results")
      .select("interview_id")
      .in("interview_id", interviewIds);

    if (resultsError) {
      console.error("Failed to fetch interview results:", resultsError);
      setInterviewList(safeInterviews);
      return;
    }

    const resultCountByInterviewId = (interviewResults || []).reduce(
      (acc, result) => {
        const interviewId = result?.interview_id;
        if (!interviewId) return acc;

        acc[interviewId] = (acc[interviewId] || 0) + 1;
        return acc;
      },
      {},
    );

    setInterviewList(
      safeInterviews.map((interview) => ({
        ...interview,
        interview_results_count:
          resultCountByInterviewId[interview.interview_id] || 0,
      })),
    );
  };

  const handleInterviewDelete = () => {
    getInterviewList();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          All Interviews
        </h2>
        <p className="text-gray-500">
          Here are all the interviews you've created.
        </p>
      </div>

      {interviewList?.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
            <Video className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold text-slate-800">
              No interviews yet
            </h2>
            <p className="text-sm text-slate-400">
              Create your first interview to start evaluating candidates.
            </p>
          </div>
        </div>
      ) : (
        interviewList && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {interviewList.map((interview) => (
              <InterviewCard
                interview={interview}
                key={interview.id || interview.interview_id}
                onDelete={handleInterviewDelete}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default LatestInterviewsList;
