"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FormContainer from "./_components/FormContainer";
import QuestionList from "./_components/QuestionList";
import { useUser } from "@/app/provider";

const TOTAL_STEPS = 3;

function CreateInterview() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [interviewId, setInterviewId] = useState();
  const [questionList, setQuestionList] = useState(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.credits <= 0) {
      toast.error("You don't have enough credits to create an interview");
      router.push("/recruiter/billing");
    }
  }, [user, router]);

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onGoToNext = () => {
    if (user?.credits <= 0) {
      toast.error("Please purchase credits to create an interview");
      router.push("/recruiter/billing");
      return;
    }

    let missingField = "";
    if (!formData.jobPosition) missingField = "Job Position";
    else if (!formData.jobDescription) missingField = "Job Description";
    else if (!formData.duration) missingField = "Duration";
    else if (!formData.type) missingField = "Interview Type";

    if (missingField) {
      toast.error(`${missingField} is required`);
      return;
    }

    setStep(step + 1);
  };

  const onCreateLink = async (interview_id) => {
    setLoading(true);

    if (user?.credits <= 0) {
      toast.error("Please purchase credits to create an interview");
      router.push("/recruiter/billing");
      setLoading(false);
      return;
    }
    try {
      setInterviewId(interview_id);
      setStep(step + 1);
    } catch (error) {
      toast.error("Failed to create interview link");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / TOTAL_STEPS) * 100;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col gap-1 border-b pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Create New Interview
          </h2>
        </div>
        <p className="text-gray-500 ml-12">
          Fill in the details below to generate AI-powered interview questions.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-600">
            Step <span className="text-blue-600">{step}</span> of {TOTAL_STEPS}
          </p>
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i + 1 < step
                    ? "h-2.5 w-2.5 bg-blue-600"
                    : i + 1 === step
                      ? "h-2.5 w-6 bg-linear-to-r from-blue-600 to-indigo-600"
                      : "h-2.5 w-2.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
          <div className="relative z-10 p-6 sm:p-8">
            <FormContainer
              formData={formData}
              onHandleInputChange={onHandleInputChange}
              GoToNext={onGoToNext}
            />
          </div>
        </div>
      )}
      {step === 2 && (
        <QuestionList
          formData={formData}
          onCreateLink={onCreateLink}
          loading={loading}
          questionList={questionList}
          setQuestionList={setQuestionList}
        />
      )}
    </div>
  );
}

export default CreateInterview;
