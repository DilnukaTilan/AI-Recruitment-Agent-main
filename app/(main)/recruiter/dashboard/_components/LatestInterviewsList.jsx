"use client";

import { Video } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import InterviewCard from "./InterviewCard";

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
      .order("created_at", { ascending: false })
      .limit(3);

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
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-5">
        Previously Created Interviews
      </h3>

      {interviewList?.length === 0 ? (
        <div className="p-5 flex flex-col items-center gap-3 text-center text-gray-500 bg-white border rounded-xl shadow-sm">
          <Video className="text-primary h-10 w-10" />
          <h2 className="text-base">You don't have any interviews created!</h2>
          <Button
            className="cursor-pointer"
            onClick={() => router.push("/recruiter/dashboard/create-interview")}
          >
            + Create New Interview
          </Button>
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
