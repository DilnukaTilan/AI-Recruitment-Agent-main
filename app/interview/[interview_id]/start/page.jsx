"use client";

import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Phone, Timer } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import AlertConfirmation from "./_components/AlertConfirmation";
import axios from "axios";
import TimerComponent from "./_components/TimerComponent";
import { getVapiClient } from "@/lib/vapiconfig";
import { supabase } from "@/services/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const vapi = getVapiClient();
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  const [activeUser, setActiveUser] = useState(false);
  const [start, setStart] = useState(false);
  const [subtitles, setSubtitles] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const conversation = useRef(null);
  const endedReasonRef = useRef(null);
  const feedbackRequestedRef = useRef(false);
  const { interview_id } = useParams();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    picture: null,
    name: interviewInfo?.candidate_name || "Candidate",
  });
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  useEffect(() => {
    if (!interviewInfo && typeof window !== "undefined") {
      const stored = localStorage.getItem("interviewInfo");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.interview_id === interview_id) {
            setInterviewInfo(parsed);
          } else {
            localStorage.removeItem("interviewInfo");
            router.replace(`/interview/${interview_id}`);
          }
        } catch {
          localStorage.removeItem("interviewInfo");
          router.replace(`/interview/${interview_id}`);
        }
      } else {
        router.replace(`/interview/${interview_id}`);
      }
    }
  }, [interviewInfo, interview_id, router, setInterviewInfo]);

  useEffect(() => {
    setUserProfile((prev) => ({
      ...prev,
      name: interviewInfo?.candidate_name || "Candidate",
    }));
  }, [interviewInfo?.candidate_name]);

  useEffect(() => {
    if (interviewInfo && interviewInfo?.jobPosition && vapi && !start) {
      setStart(true);
      startCall();
    }
  }, [assistantId, interviewInfo, start, vapi]);

  const formatEndedReason = (reason) => {
    if (!reason) return null;
    return reason.replaceAll("-", " ");
  };

  const getEndToastMessage = (reason) => {
    if (!reason) {
      return "Call has ended.";
    }

    const formattedReason = formatEndedReason(reason);

    switch (reason) {
      case "customer-did-not-give-microphone-permission":
        return "Call ended because microphone permission was not granted.";
      case "assistant-ended-call":
      case "assistant-ended-call-after-message-spoken":
      case "assistant-ended-call-with-hangup-task":
      case "assistant-said-end-call-phrase":
        return `Call ended by the AI assistant (${formattedReason}).`;
      case "exceeded-max-duration":
        return "Call ended because it reached the maximum duration.";
      case "customer-ended-call":
        return "Interview ended.";
      default:
        return `Call ended: ${formattedReason}.`;
    }
  };

  const startCall = async () => {
    if (!assistantId) {
      toast.error(
        "Vapi assistant ID is missing. Set NEXT_PUBLIC_VAPI_ASSISTANT_ID.",
      );
      setStart(false);
      return;
    }

    const questionList =
      interviewInfo?.questionList?.interviewQuestions?.map(
        (question) => question?.question,
      ) || [];

    const assistantOverrides = {
      variableValues: {
        candidateName: interviewInfo?.candidate_name || "Candidate",
        jobPosition: interviewInfo?.jobPosition || "Unknown Position",
        jobDescription: interviewInfo?.jobDescription || "",
        interviewType: interviewInfo?.type || "",
        interviewDuration: interviewInfo?.duration || "",
        questionList: questionList.join(" | "),
      },
    };

    endedReasonRef.current = null;
    feedbackRequestedRef.current = false;
    setSubtitles("");
    setUserTranscript("");

    console.log("assistantId:", assistantId);
    console.log("assistantOverrides:", assistantOverrides);

    await vapi.start(
      assistantId,
      assistantOverrides,
      undefined,
      undefined,
      undefined,
      { roomDeleteOnUserLeaveEnabled: false },
    );
  };

  useEffect(() => {
    if (!vapi) return;

    const handleMessage = (message) => {
      if (
        message?.type === "status-update" &&
        message?.status === "ended" &&
        message?.endedReason
      ) {
        endedReasonRef.current = message.endedReason;
        console.log("Vapi ended reason:", message.endedReason);
      }

      if (message?.role === "assistant" && message?.content) {
        setSubtitles(message.content);
      }

      if (
        message?.type === "transcript" &&
        message?.role === "user" &&
        message?.transcript
      ) {
        setUserTranscript(message.transcript);
      }

      if (message?.conversation) {
        const filteredConversation =
          message.conversation.filter((msg) => msg.role !== "system") || [];
        conversation.current = JSON.stringify(filteredConversation, null, 2);
      }
    };

    const handleCallStart = () => {
      toast("Call started...");
      setStart(true);
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
      setActiveUser(false);
      toast("AI is speaking...");
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setActiveUser(true);
    };

    const handleError = (error) => {
      console.error("Vapi error:", error);
      const errorMessage =
        error?.error?.message ||
        error?.error?.errorMsg ||
        error?.message ||
        "The interview connection ran into an error.";
      toast.error(errorMessage);
    };

    const handleCallEnd = () => {
      const endedReason = endedReasonRef.current;
      const endMessage = getEndToastMessage(endedReason);

      if (!conversation.current) {
        toast.error(
          endMessage || "Call ended before a transcript was captured.",
        );
        setStart(false);
        setIsSpeaking(false);
        setActiveUser(false);
        router.replace(`/interview/${interview_id}`);
        return;
      }

      if (feedbackRequestedRef.current) {
        return;
      }

      feedbackRequestedRef.current = true;
      toast(
        endedReason
          ? `${endMessage} Generating feedback...`
          : "Call has ended. Generating feedback...",
      );
      setIsGeneratingFeedback(true);
      GenerateFeedback();
    };

    vapi.on("message", handleMessage);
    vapi.on("call-start", handleCallStart);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("call-end", handleCallEnd);
    vapi.on("error", handleError);

    return () => {
      vapi.off("message", handleMessage);
      vapi.off("call-start", handleCallStart);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("call-end", handleCallEnd);
      vapi.off("error", handleError);
    };
  }, [interview_id, router, vapi]);

  const GenerateFeedback = async () => {
    if (!interviewInfo || !conversation.current) {
      toast.error("Interview data missing. Please restart the interview.");
      router.replace(`/interview/${interview_id}`);
      return;
    }

    try {
      const result = await axios.post("/api/ai-feedback", {
        conversation: conversation.current,
      });

      const content = result?.data?.content
        ?.replace("```json", "")
        ?.replace("```", "")
        ?.trim();

      if (!content) throw new Error("Feedback content is empty");

      let parsedTranscript;
      try {
        parsedTranscript = JSON.parse(content);
      } catch {
        console.error("Invalid JSON:", content);
        throw new Error("Could not parse AI feedback JSON");
      }

      const { error: insertError } = await supabase
        .from("interview_results")
        .insert([
          {
            fullname: interviewInfo?.candidate_name,
            email: interviewInfo?.userEmail,
            interview_id,
            conversation_transcript: parsedTranscript,
            recommendations: "Not recommended",
            completed_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error("Insert failed");
      }

      try {
        const aiResult = await axios.post("/api/ai-model", {
          jobPosition: interviewInfo?.jobPosition,
          jobDescription: interviewInfo?.jobDescription,
          duration: interviewInfo?.duration,
          type: interviewInfo?.type,
        });

        const rawContent = aiResult?.data?.content || aiResult?.data?.Content;
        let newQuestions = null;

        if (rawContent) {
          const match = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
          if (match && match[1]) {
            newQuestions = JSON.parse(match[1].trim());
          }
        }

        if (newQuestions) {
          await supabase
            .from("interviews")
            .update({ questionList: newQuestions })
            .eq("interview_id", interview_id);
        }
      } catch (error) {
        console.error(
          "Failed to generate or update new questions for next candidate",
          error,
        );
      }

      toast.success("Feedback generated successfully!");
      if (typeof window !== "undefined") {
        localStorage.removeItem("interviewInfo");
      }
      router.replace(`/interview/${interviewInfo?.interview_id}/completed`);
    } catch (error) {
      console.error("Feedback generation failed:", error);
      toast.error("Failed to generate feedback");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const stopInterview = () => {
    endedReasonRef.current = "customer-ended-call";
    if (typeof vapi?.end === "function") {
      vapi.end();
      return;
    }
    vapi.stop();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {interviewInfo?.jobPosition || "AI"} Interview Session
            </h1>
            <p className="text-gray-600">Powered by AI Interview Assistant</p>
          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <Timer className="text-blue-600" />
            <span className="font-mono text-lg font-semibold text-gray-700">
              <TimerComponent start={start} />
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className={`bg-white rounded-xl p-6 shadow-md border transition-all duration-300 ${isSpeaking ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200"}`}
          >
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="relative">
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-75"></div>
                )}
                <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-blue-100">
                  <Image
                    src="/AIR.png"
                    alt="AI Recruiter"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  AI Recruiter
                </h2>
                <p className="text-sm text-gray-500">Interview HR</p>
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-xl p-6 shadow-md border transition-all duration-300 ${activeUser ? "border-purple-300 ring-2 ring-purple-100" : "border-gray-200"}`}
          >
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="relative">
                {activeUser && (
                  <div className="absolute inset-0 rounded-full bg-purple-100 animate-ping opacity-75"></div>
                )}
                <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
                  {userProfile.picture ? (
                    <Image
                      src={userProfile.picture}
                      alt={userProfile.name}
                      width={80}
                      height={80}
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {userProfile.name}
                </h2>
                <p className="text-sm text-gray-500">Candidate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200 space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
              Assistant
            </p>
            <div className="min-h-10 flex items-center justify-center">
              {subtitles ? (
                <p className="text-center text-gray-700 animate-fadeIn">
                  "{subtitles}"
                </p>
              ) : (
                <p className="text-center text-gray-400">
                  {isSpeaking
                    ? "AI is speaking..."
                    : "Waiting for assistant..."}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-purple-50 border border-purple-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 mb-1">
              Candidate
            </p>
            <div className="min-h-10 flex items-center justify-center">
              {userTranscript ? (
                <p className="text-center text-gray-700 animate-fadeIn">
                  "{userTranscript}"
                </p>
              ) : (
                <p className="text-center text-gray-400">
                  {activeUser
                    ? "Start speaking to see your transcript..."
                    : "Waiting for your response..."}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
          <div className="flex flex-col items-center">
            <div className="flex gap-4 mb-4">
              <AlertConfirmation stopInterview={stopInterview}>
                <button
                  className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 shadow-sm transition-all flex items-center gap-2"
                  aria-label="End call"
                >
                  <Phone size={20} />
                  <span>End Interview</span>
                </button>
              </AlertConfirmation>
            </div>

            <p className="text-sm text-gray-500">
              {activeUser ? "Please respond..." : "AI is speaking..."}
            </p>
          </div>
        </div>
      </div>
      {isGeneratingFeedback && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Generating Feedback
            </h2>
            <p className="text-gray-600">
              Please wait while we analyze your interview...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StartInterview;
