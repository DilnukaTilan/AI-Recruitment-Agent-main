"use client";

import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Phone, Timer, Mic, MicOff, Loader2 } from "lucide-react";
import Image from "next/image";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AlertConfirmation from "./_components/AlertConfirmation";
import axios from "axios";
import TimerComponent from "./_components/TimerComponent";
import { getVapiClient } from "@/lib/vapiconfig";
import { supabase } from "@/services/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  hasCandidateRemainingJoins,
  isCandidateAllowedForInterview,
} from "@/lib/interviewCandidates";

const SILENCE_PROMPT_DELAY_MS = 12_000;
const SILENCE_END_DELAY_MS = 30_000;
const SILENCE_PROMPT_MESSAGE =
  "Are you still there? Would you like me to repeat the question, or should we move on to the next question?";
const SILENCE_END_MESSAGE =
  "I still cannot hear a response, so I will end the interview here. Thank you for your time. I will submit the interview and generate feedback now.";
const SILENCE_TRANSCRIPT_NOTE =
  "[No verbal response detected after the interview question and follow-up prompt.]";

const stringifyErrorValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  if (typeof value !== "object") return String(value);

  const message = value.message || value.errorMsg || value.msg || value.type;

  if (typeof message === "string") {
    return message;
  }

  if (message) {
    return stringifyErrorValue(message);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const getReadableVapiErrorMessage = (error) => {
  const message =
    stringifyErrorValue(error?.error?.message) ||
    stringifyErrorValue(error?.error?.errorMsg) ||
    stringifyErrorValue(error?.message) ||
    stringifyErrorValue(error?.msg) ||
    stringifyErrorValue(error);

  return message || "The interview connection encountered an error.";
};

const isExpectedCallShutdownError = (message) => {
  return /meeting (has )?ended|ended due to ejection|ejection/i.test(message);
};

const isEmptyObject = (value) => {
  return (
    value &&
    typeof value === "object" &&
    !(value instanceof Error) &&
    Object.keys(value).length === 0
  );
};

const isEmptyVapiErrorPayload = (error) => {
  return isEmptyObject(error) || isEmptyObject(error?.error);
};

const getLatestUserResponseSignature = (messages = []) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    const text =
      message?.role === "user" && typeof message?.content === "string"
        ? message.content.trim()
        : "";

    if (text) {
      return text;
    }
  }

  return "";
};

function StartInterview() {
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const vapi = getVapiClient();
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  const [activeUser, setActiveUser] = useState(false);
  const [start, setStart] = useState(false);
  const [subtitles, setSubtitles] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [transcriptMessages, setTranscriptMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const conversation = useRef(null);
  const endedReasonRef = useRef(null);
  const feedbackRequestedRef = useRef(false);
  const interviewInfoRef = useRef(interviewInfo);
  const transcriptMessagesRef = useRef([]);
  const latestUserResponseSignatureRef = useRef("");
  const silenceTimerRef = useRef(null);
  const silenceFallbackTimerRef = useRef(null);
  const silenceStageRef = useRef("idle");
  const callActiveRef = useRef(false);
  const startedRef = useRef(false);
  const { interview_id } = useParams();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    picture: null,
    name: interviewInfo?.candidate_name || "Candidate",
  });
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

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
    const verifyAccess = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user?.email) {
          setAccessDenied(true);
          router.replace("/login");
          return;
        }

        const { data, error } = await supabase
          .from("interviews")
          .select("candidateEmails, candidateAccessList")
          .eq("interview_id", interview_id)
          .single();

        if (error) throw error;

        if (!isCandidateAllowedForInterview(data, session.user.email)) {
          setAccessDenied(true);
          localStorage.removeItem("interviewInfo");
          toast.error(
            "You do not have access to this interview. Please contact your recruiter.",
          );
          router.replace("/candidate/dashboard");
          return;
        }

        const { count, error: resultsError } = await supabase
          .from("interview_results")
          .select("*", { count: "exact", head: true })
          .eq("interview_id", interview_id)
          .eq("email", session.user.email);

        if (resultsError) throw resultsError;

        if (!hasCandidateRemainingJoins(data, session.user.email, count ?? 0)) {
          setAccessDenied(true);
          localStorage.removeItem("interviewInfo");
          toast.error(
            "You have already used all allowed interview attempts for this link.",
          );
          router.replace("/candidate/dashboard");
          return;
        }

        setAccessDenied(false);
      } catch (error) {
        console.error("Failed to verify interview access:", error);
        setAccessDenied(true);
        toast.error("Failed to verify interview access.");
        router.replace(`/interview/${interview_id}`);
      } finally {
        setAccessChecked(true);
      }
    };

    if (interview_id) {
      verifyAccess();
    }
  }, [interview_id, router]);

  useEffect(() => {
    setUserProfile((prev) => ({
      ...prev,
      name: interviewInfo?.candidate_name || "Candidate",
    }));
  }, [interviewInfo?.candidate_name]);

  useEffect(() => {
    interviewInfoRef.current = interviewInfo;
  }, [interviewInfo]);

  useEffect(() => {
    transcriptMessagesRef.current = transcriptMessages;
  }, [transcriptMessages]);

  useEffect(() => {
    if (
      accessChecked &&
      !accessDenied &&
      interviewInfo?.jobPosition &&
      vapi &&
      !startedRef.current
    ) {
      startedRef.current = true;
      setStart(true);
      startCall();
    }
  }, [accessChecked, accessDenied, interviewInfo, vapi]);

  const formatEndedReason = (reason) => {
    if (!reason) return null;
    return reason.replaceAll("-", " ");
  };

  const getEndToastMessage = useCallback((reason) => {
    if (!reason) {
      return "The call has ended.";
    }

    const formattedReason = formatEndedReason(reason);

    switch (reason) {
      case "customer-did-not-give-microphone-permission":
        return "The call ended because microphone permission was not granted.";
      case "assistant-ended-call":
      case "assistant-ended-call-after-message-spoken":
      case "assistant-ended-call-with-hangup-task":
      case "assistant-said-end-call-phrase":
        return `The call was ended by the AI assistant (${formattedReason}).`;
      case "exceeded-max-duration":
        return "The call ended because the maximum duration was reached.";
      case "customer-ended-call":
        return "The interview has ended.";
      case "candidate-silent-timeout":
        return "The interview ended because no response was detected after the follow-up prompt.";
      default:
        return `Call ended: ${formattedReason}.`;
    }
  }, []);

  const clearSilenceTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (silenceFallbackTimerRef.current) {
      clearTimeout(silenceFallbackTimerRef.current);
      silenceFallbackTimerRef.current = null;
    }
  }, []);

  const appendTranscriptMessage = useCallback((role, text) => {
    const transcriptText = typeof text === "string" ? text.trim() : "";

    if (!transcriptText) return;

    if (role === "assistant") {
      setSubtitles(transcriptText);
    }

    if (role === "user") {
      setUserTranscript(transcriptText);
    }

    setTranscriptMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];

      if (
        lastMessage &&
        lastMessage.role === role &&
        lastMessage.text === transcriptText
      ) {
        return prevMessages;
      }

      const nextMessages = [
        ...prevMessages,
        {
          id: `local-${Date.now()}-${role}-${prevMessages.length}`,
          role,
          text: transcriptText,
          isFinal: true,
        },
      ];

      transcriptMessagesRef.current = nextMessages;
      return nextMessages;
    });
  }, []);

  const resetSilenceTracking = useCallback(() => {
    clearSilenceTimers();
    silenceStageRef.current = "idle";
  }, [clearSilenceTimers]);

  const buildFallbackConversation = useCallback(() => {
    const transcriptMessages = transcriptMessagesRef.current || [];
    const fallbackMessages = transcriptMessages
      .filter((message) => {
        return (
          (message?.role === "assistant" || message?.role === "user") &&
          typeof message?.text === "string" &&
          message.text.trim()
        );
      })
      .map((message) => ({
        role: message.role,
        content: message.text.trim(),
      }));

    if (endedReasonRef.current === "candidate-silent-timeout") {
      const hasSilenceNote = fallbackMessages.some(
        (message) => message.content === SILENCE_TRANSCRIPT_NOTE,
      );

      if (!hasSilenceNote) {
        fallbackMessages.push({
          role: "user",
          content: SILENCE_TRANSCRIPT_NOTE,
        });
      }
    }

    return fallbackMessages.length > 0
      ? JSON.stringify(fallbackMessages, null, 2)
      : null;
  }, []);

  const buildLocalFallbackRating = useCallback((interviewTypes) => {
    const typeToCategory = {
      Technical: "TechnicalSkills",
      Behavioral: "Behavioral",
      Experience: "Experience",
      "Problem-Solving": "ProblemSolving",
      Leadership: "Leadership",
    };
    const types = Array.isArray(interviewTypes)
      ? interviewTypes
      : typeof interviewTypes === "string"
        ? interviewTypes.split(",")
        : [];
    const categories = types
      .map((type) => type.trim())
      .filter(Boolean)
      .map((type) => typeToCategory[type] ?? type.replace(/\s+/g, ""));

    return Object.fromEntries(
      [...new Set([...categories, "Communication"])].map((category) => [
        category,
        0,
      ]),
    );
  }, []);

  const buildLocalFallbackFeedback = useCallback(
    (reason, interviewTypes) => {
      const rating = buildLocalFallbackRating(interviewTypes);

      if (reason === "candidate-silent-timeout") {
        return {
          feedback: {
            rating,
            summary:
              "The candidate did not provide a verbal response after the recruiter asked a question. The recruiter followed up to confirm whether the candidate was still present, but no response was detected. Because the interview could not continue, the session was concluded automatically.",
            recommendation: "Not Recommended",
            recommendationMessage:
              "The candidate could not be evaluated because they remained silent after repeated prompts.",
          },
        };
      }

      return {
        feedback: {
          rating,
          summary:
            "The interview ended before enough response data was available for a full assessment. The available transcript was limited, so the system generated a conservative fallback report. Additional recruiter review may be needed before making a hiring decision.",
          recommendation: "Not Recommended",
          recommendationMessage:
            "There was not enough interview evidence to recommend the candidate.",
        },
      };
    },
    [buildLocalFallbackRating],
  );

  const startCall = async () => {
    if (!assistantId) {
      toast.error(
        "Vapi assistant ID is missing. Please set NEXT_PUBLIC_VAPI_ASSISTANT_ID.",
      );
      startedRef.current = false;
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

    resetSilenceTracking();
    endedReasonRef.current = null;
    feedbackRequestedRef.current = false;
    callActiveRef.current = false;
    setSubtitles("");
    setUserTranscript("");
    setTranscriptMessages([]);
    transcriptMessagesRef.current = [];
    latestUserResponseSignatureRef.current = "";

    try {
      await vapi.start(
        assistantId,
        assistantOverrides,
        undefined,
        undefined,
        undefined,
        { roomDeleteOnUserLeaveEnabled: false },
      );
    } catch (error) {
      console.error("Failed to start Vapi call:", error);
      toast.error("Failed to start the interview call. Please try again.");
      startedRef.current = false;
      setStart(false);
    }
  };

  const generateFeedback = useCallback(async () => {
    const info = interviewInfoRef.current;
    const fallbackConversation = buildFallbackConversation();
    const conversationPayload =
      endedReasonRef.current === "candidate-silent-timeout"
        ? fallbackConversation || conversation.current
        : conversation.current || fallbackConversation;

    if (!info || !conversationPayload) {
      toast.error("Interview data is missing. Please restart the interview.");
      router.replace(`/interview/${interview_id}`);
      return;
    }

    try {
      let parsedTranscript = null;

      try {
        const result = await axios.post("/api/ai-feedback", {
          conversation: conversationPayload,
          interviewTypes: info.type,
        });

        let content = result?.data?.content?.trim();
        const jsonFenceMatch = content?.match(/```json\s*([\s\S]*?)\s*```/);
        content = jsonFenceMatch
          ? jsonFenceMatch[1].trim()
          : content?.replace(/```/g, "").trim();

        if (!content) throw new Error("Feedback content is empty");
        parsedTranscript = JSON.parse(content);
      } catch (error) {
        console.error("AI feedback response could not be used:", error);
        parsedTranscript = buildLocalFallbackFeedback(
          endedReasonRef.current,
          info.type,
        );
      }

      const { error: insertError } = await supabase
        .from("interview_results")
        .insert([
          {
            fullname: info.candidate_name,
            email: info.userEmail,
            interview_id,
            conversation_transcript: parsedTranscript,
            recommendations:
              parsedTranscript?.feedback?.recommendation || "Not Recommended",
            completed_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error("Insert failed");
      }

      try {
        const aiResult = await axios.post("/api/ai-model", {
          jobPosition: info.jobPosition,
          jobDescription: info.jobDescription,
          duration: info.duration,
          type: info.type,
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
      localStorage.removeItem("interviewInfo");
      router.replace(`/interview/${info.interview_id}/completed`);
    } catch (error) {
      console.error("Feedback generation failed:", error);
      toast.error("Failed to generate feedback.");
    } finally {
      setIsGeneratingFeedback(false);
    }
  }, [
    buildFallbackConversation,
    buildLocalFallbackFeedback,
    interview_id,
    router,
  ]);

  useEffect(() => {
    if (!vapi) return;

    const requestFeedbackOnce = () => {
      if (feedbackRequestedRef.current) {
        return;
      }

      feedbackRequestedRef.current = true;
      setIsGeneratingFeedback(true);
      generateFeedback();
    };

    const concludeSilentInterview = () => {
      if (!callActiveRef.current || feedbackRequestedRef.current) {
        return;
      }

      clearSilenceTimers();
      silenceStageRef.current = "ending";
      endedReasonRef.current = "candidate-silent-timeout";
      appendTranscriptMessage("assistant", SILENCE_END_MESSAGE);

      if (typeof vapi.say === "function") {
        vapi.say(SILENCE_END_MESSAGE, true, false, true);

        silenceFallbackTimerRef.current = setTimeout(() => {
          if (!feedbackRequestedRef.current) {
            if (typeof vapi.stop === "function") {
              vapi.stop();
            }

            callActiveRef.current = false;
            requestFeedbackOnce();
          }
        }, 12_000);

        return;
      }

      if (typeof vapi.end === "function") {
        vapi.end();
      } else if (typeof vapi.stop === "function") {
        vapi.stop();
      }

      callActiveRef.current = false;
      requestFeedbackOnce();
    };

    const scheduleSilentInterviewEnd = (delayMs = SILENCE_END_DELAY_MS) => {
      if (!callActiveRef.current || feedbackRequestedRef.current) {
        return;
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      silenceTimerRef.current = setTimeout(() => {
        if (
          callActiveRef.current &&
          !feedbackRequestedRef.current &&
          (silenceStageRef.current === "prompting" ||
            silenceStageRef.current === "prompted")
        ) {
          concludeSilentInterview();
        }
      }, delayMs);
    };

    const promptForSilence = () => {
      if (
        !callActiveRef.current ||
        feedbackRequestedRef.current ||
        silenceStageRef.current !== "waiting-for-response"
      ) {
        return;
      }

      silenceStageRef.current = "prompting";
      appendTranscriptMessage("assistant", SILENCE_PROMPT_MESSAGE);

      if (typeof vapi.say === "function") {
        vapi.say(SILENCE_PROMPT_MESSAGE, false, true, true);
        scheduleSilentInterviewEnd(SILENCE_END_DELAY_MS + 5_000);
      } else {
        silenceStageRef.current = "prompted";
        scheduleSilentInterviewEnd();
      }
    };

    const scheduleSilencePrompt = () => {
      if (!callActiveRef.current || feedbackRequestedRef.current) {
        return;
      }

      clearSilenceTimers();
      silenceStageRef.current = "waiting-for-response";
      silenceTimerRef.current = setTimeout(
        promptForSilence,
        SILENCE_PROMPT_DELAY_MS,
      );
    };

    const markCandidateResponded = () => {
      if (
        silenceStageRef.current === "waiting-for-response" ||
        silenceStageRef.current === "prompting" ||
        silenceStageRef.current === "prompted"
      ) {
        resetSilenceTracking();
      }
    };

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

      const transcriptRole =
        message?.role === "assistant" || message?.role === "user"
          ? message.role
          : null;
      const transcriptText = message?.transcript?.trim();

      if (message?.type === "transcript" && transcriptRole && transcriptText) {
        const isFinalTranscript =
          message?.transcriptType === "final" ||
          message?.transcriptType === "finalTranscript" ||
          message?.isFinal === true;

        if (transcriptRole === "assistant") {
          setSubtitles(transcriptText);
        }

        if (transcriptRole === "user") {
          latestUserResponseSignatureRef.current = transcriptText;
          markCandidateResponded();
          setUserTranscript(transcriptText);
        }

        setTranscriptMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];

          if (
            lastMessage &&
            lastMessage.role === transcriptRole &&
            lastMessage.text === transcriptText
          ) {
            if (lastMessage.isFinal === isFinalTranscript) {
              return prevMessages;
            }

            const nextMessages = prevMessages.map((item, index) =>
              index === prevMessages.length - 1
                ? { ...item, isFinal: isFinalTranscript }
                : item,
            );

            transcriptMessagesRef.current = nextMessages;
            return nextMessages;
          }

          if (
            lastMessage &&
            lastMessage.role === transcriptRole &&
            !lastMessage.isFinal
          ) {
            const nextMessages = prevMessages.map((item, index) =>
              index === prevMessages.length - 1
                ? {
                    ...item,
                    text: transcriptText,
                    isFinal: isFinalTranscript,
                  }
                : item,
            );

            transcriptMessagesRef.current = nextMessages;
            return nextMessages;
          }

          const nextMessages = [
            ...prevMessages,
            {
              id: `${Date.now()}-${transcriptRole}-${prevMessages.length}`,
              role: transcriptRole,
              text: transcriptText,
              isFinal: isFinalTranscript,
            },
          ];

          transcriptMessagesRef.current = nextMessages;
          return nextMessages;
        });
      }

      if (message?.conversation) {
        const filteredConversation =
          message.conversation.filter((msg) => msg.role !== "system") || [];
        conversation.current = JSON.stringify(filteredConversation, null, 2);

        const latestUserResponseSignature =
          getLatestUserResponseSignature(filteredConversation);

        if (
          latestUserResponseSignature &&
          latestUserResponseSignature !== latestUserResponseSignatureRef.current
        ) {
          latestUserResponseSignatureRef.current = latestUserResponseSignature;
          markCandidateResponded();
        }

        const conversationTranscript = filteredConversation
          .map((msg, index) => {
            const role =
              msg.role === "assistant" || msg.role === "user" ? msg.role : null;
            const text =
              typeof msg.content === "string" ? msg.content.trim() : "";

            if (!role || !text) {
              return null;
            }

            return {
              id: `conversation-${index}-${role}`,
              role,
              text,
              isFinal: true,
            };
          })
          .filter(Boolean);

        if (conversationTranscript.length > 0) {
          transcriptMessagesRef.current = conversationTranscript;
          setTranscriptMessages(conversationTranscript);
        }
      }
    };

    const handleCallStart = () => {
      callActiveRef.current = true;
      silenceStageRef.current = "idle";
      toast("The call has started...");
      setStart(true);
    };

    const handleSpeechStart = () => {
      if (silenceStageRef.current === "waiting-for-response") {
        resetSilenceTracking();
      }
      setIsSpeaking(true);
      setActiveUser(false);
      toast("AI is speaking...");
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setActiveUser(true);

      if (!callActiveRef.current || feedbackRequestedRef.current) {
        return;
      }

      if (silenceStageRef.current === "prompting") {
        silenceStageRef.current = "prompted";
        scheduleSilentInterviewEnd();
        return;
      }

      if (
        silenceStageRef.current !== "prompted" &&
        silenceStageRef.current !== "ending"
      ) {
        scheduleSilencePrompt();
      }
    };

    const handleError = (error) => {
      const errorMessage = getReadableVapiErrorMessage(error);
      const isIntentionalShutdown =
        endedReasonRef.current === "candidate-silent-timeout" ||
        silenceStageRef.current === "ending" ||
        feedbackRequestedRef.current;

      if (
        isIntentionalShutdown &&
        (isExpectedCallShutdownError(errorMessage) ||
          isEmptyVapiErrorPayload(error))
      ) {
        return;
      }

      console.error("Vapi error:", error);
      toast.error(errorMessage);
    };

    const handleCallEnd = () => {
      callActiveRef.current = false;
      clearSilenceTimers();
      const endedReason = endedReasonRef.current;
      const endMessage = getEndToastMessage(endedReason);

      if (!conversation.current && !buildFallbackConversation()) {
        toast.error(
          endMessage || "The call ended before a transcript could be captured.",
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
          : "The call has ended. Generating feedback...",
      );
      setIsGeneratingFeedback(true);
      generateFeedback();
    };

    vapi.on("message", handleMessage);
    vapi.on("call-start", handleCallStart);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("call-end", handleCallEnd);
    vapi.on("error", handleError);

    return () => {
      clearSilenceTimers();
      vapi.off("message", handleMessage);
      vapi.off("call-start", handleCallStart);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("call-end", handleCallEnd);
      vapi.off("error", handleError);
    };
  }, [
    appendTranscriptMessage,
    buildFallbackConversation,
    clearSilenceTimers,
    generateFeedback,
    getEndToastMessage,
    interview_id,
    resetSilenceTracking,
    router,
    vapi,
  ]);

  if (!accessChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)] max-w-md w-full">
          <div className="flex flex-col items-center gap-5 px-8 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-800">
                Verifying Access
              </h2>
              <p className="text-sm text-slate-500">
                Confirming that you are allowed to join this interview.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return null;
  }

  const stopInterview = () => {
    resetSilenceTracking();
    endedReasonRef.current = "customer-ended-call";
    if (!vapi) {
      toast.error("Interview connection is unavailable.");
      return;
    }
    if (typeof vapi.stop === "function") {
      vapi.stop();
    } else if (typeof vapi.end === "function") {
      vapi.end();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes subtlePulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        @keyframes waveBar {
          0%,
          100% {
            transform: scaleY(0.33);
          }
          50% {
            transform: scaleY(1);
          }
        }
        .pulse-ring {
          animation: pulseRing 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .subtle-pulse {
          animation: subtlePulse 2s ease-in-out infinite;
        }
        .wave-bar {
          animation: waveBar 0.8s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-4xl mx-auto w-full space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600">
              {interviewInfo?.jobPosition || "AI"} Interview
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Powered by AI Interview Assistant
            </p>
          </div>

          <div className="flex items-center self-center sm:self-auto gap-2.5 rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-2.5 shadow-sm">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30">
              <Timer className="h-3.5 w-3.5" />
            </div>
            <span className="font-mono text-sm font-bold text-slate-700 tabular-nums">
              <TimerComponent start={start} />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`relative overflow-hidden rounded-2xl border bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.15)] transition-all duration-500 ${
              isSpeaking
                ? "border-blue-300 shadow-[0_10px_35px_-20px_rgba(37,99,235,0.35)]"
                : "border-slate-200"
            }`}
          >
            <div className="flex flex-col items-center justify-center px-6 py-8 space-y-4">
              <div className="relative">
                {isSpeaking && (
                  <>
                    <div className="absolute inset-[-8px] rounded-full border-2 border-blue-400/40 pulse-ring" />
                    <div
                      className="absolute inset-[-4px] rounded-full border-2 border-blue-400/20 pulse-ring"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </>
                )}
                <div
                  className={`relative z-10 w-20 h-20 rounded-full overflow-hidden border-4 shadow-lg ${
                    isSpeaking ? "border-blue-300" : "border-white"
                  }`}
                >
                  <Image
                    src="/recruiter.jpg"
                    alt="AI Recruiter"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-800">
                  AI Recruiter
                </h2>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Interview Assistant
                </p>
              </div>

              <div className="flex items-center justify-center min-h-[28px]">
                {isSpeaking && (
                  <div
                    className="flex items-center gap-1"
                    aria-label="AI is speaking"
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-6 rounded-full bg-linear-to-t from-blue-600 to-indigo-400 wave-bar"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
                {!isSpeaking && !activeUser && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-400">
                    Idle
                  </span>
                )}
                {!isSpeaking && activeUser && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 subtle-pulse">
                    Listening…
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className={`relative overflow-hidden rounded-2xl border bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.15)] transition-all duration-500 ${
              activeUser
                ? "border-violet-300 shadow-[0_10px_35px_-20px_rgba(124,58,237,0.30)]"
                : "border-slate-200"
            }`}
          >
            <div className="flex flex-col items-center justify-center px-6 py-8 space-y-4">
              <div className="relative">
                {activeUser && (
                  <>
                    <div className="absolute inset-[-8px] rounded-full border-2 border-violet-400/40 pulse-ring" />
                    <div
                      className="absolute inset-[-4px] rounded-full border-2 border-violet-400/20 pulse-ring"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </>
                )}
                <div
                  className={`relative z-10 w-20 h-20 rounded-full overflow-hidden border-4 shadow-lg flex items-center justify-center ${
                    activeUser ? "border-violet-300" : "border-white"
                  } ${!userProfile.picture ? "bg-linear-to-br from-violet-100 to-purple-100" : ""}`}
                >
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
                    <span className="text-2xl font-bold bg-linear-to-br from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-slate-800">
                  {userProfile.name}
                </h2>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Candidate
                </p>
              </div>

              <div className="flex items-center justify-center min-h-[28px]">
                {activeUser && (
                  <div
                    className="flex items-center gap-1"
                    aria-label="You are speaking"
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-6 rounded-full bg-linear-to-t from-violet-600 to-purple-400 wave-bar"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
                {!activeUser && isSpeaking && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-400">
                    Waiting for AI…
                  </span>
                )}
                {!activeUser && !isSpeaking && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-400">
                    Idle
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.15)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500" />

          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30">
                <Mic className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Live Transcript
              </span>
            </div>

            <div className="rounded-xl border border-blue-100 bg-linear-to-r from-blue-50/80 to-indigo-50/80 px-4 py-3.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Assistant
                </span>
                {isSpeaking && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                )}
              </div>
              <div className="min-h-10 flex items-center">
                {subtitles ? (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    &ldquo;{subtitles}&rdquo;
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    {isSpeaking ? "AI is speaking…" : "Waiting for assistant…"}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-violet-100 bg-linear-to-r from-violet-50/80 to-purple-50/80 px-4 py-3.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">
                  You
                </span>
                {activeUser && (
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                )}
              </div>
              <div className="min-h-10 flex items-center">
                {userTranscript ? (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    &ldquo;{userTranscript}&rdquo;
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    {activeUser
                      ? "Speak now — your transcript will appear here…"
                      : "Waiting for your response…"}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Conversation
                </span>
                {transcriptMessages.length > 0 && (
                  <span className="text-[11px] font-medium text-slate-400">
                    {transcriptMessages.length} turn
                    {transcriptMessages.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                {transcriptMessages.length > 0 ? (
                  transcriptMessages.map((item) => {
                    const isAssistant = item.role === "assistant";

                    return (
                      <div
                        key={item.id}
                        className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[92%] rounded-xl border px-3.5 py-2.5 ${
                            isAssistant
                              ? "border-blue-100 bg-white text-slate-700"
                              : "border-violet-100 bg-white text-slate-700"
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wide ${
                                isAssistant
                                  ? "text-blue-700"
                                  : "text-violet-700"
                              }`}
                            >
                              {isAssistant ? "Assistant" : "You"}
                            </span>
                            {!item.isFinal && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Transcript turns will appear here as the interview begins.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.15)]">
          <div className="flex flex-col items-center py-5 px-6 gap-3">
            <div className="flex items-center gap-3">
              <AlertConfirmation stopInterview={stopInterview}>
                <button
                  className="group relative overflow-hidden flex items-center gap-2.5 rounded-xl bg-linear-to-r from-red-500 to-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-rose-700 hover:shadow-red-500/40 hover:-translate-y-0.5 cursor-pointer"
                  aria-label="End call"
                  id="end-interview-btn"
                >
                  <Phone size={16} />
                  <span>End Interview</span>
                </button>
              </AlertConfirmation>
            </div>

            <p className="text-xs font-medium text-slate-400">
              {activeUser ? (
                <span className="flex items-center gap-1.5">
                  <Mic className="h-3 w-3 text-violet-500" />
                  Your turn - please respond
                </span>
              ) : isSpeaking ? (
                <span className="flex items-center gap-1.5">
                  <MicOff className="h-3 w-3 text-slate-400" />
                  AI is speaking - please wait
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Connecting…
                </span>
              )}
            </p>
          </div>
        </div>

        <p className="text-center text-xs font-medium text-slate-400">
          Powered by AI interview technology • Secure and confidential
        </p>
      </div>

      {isGeneratingFeedback && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.65)] max-w-md w-full mx-4">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500" />

            <div className="flex flex-col items-center gap-5 px-8 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                <Loader2 className="h-7 w-7 animate-spin text-white" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-800">
                  Generating Feedback
                </h2>
                <p className="text-sm text-slate-500">
                  Analyzing your interview performance. This will only take a
                  moment.
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
      )}
    </div>
  );
}

export default StartInterview;
