"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  CheckSquare,
  Copy,
  List,
  Loader2,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import InterviewCandidateList from "./InterviewCandidateList";
import { getInterviewCandidateEmails } from "@/lib/interviewCandidates";

const GmailIcon = ({ className }) => (
  <Image
    src="/gmail.svg"
    alt="Gmail"
    width={24}
    height={24}
    className={className}
  />
);
const OutlookIcon = ({ className }) => (
  <Image
    src="/outlook.svg"
    alt="Outlook"
    width={24}
    height={24}
    className={className}
  />
);
const WhatsAppIcon = ({ className }) => (
  <Image
    src="/whatsapp.svg"
    alt="WhatsApp"
    width={24}
    height={24}
    className={className}
  />
);

const SHARE_OPTIONS = [
  {
    key: "gmail",
    label: "Gmail",
    icon: GmailIcon,
    hoverBg: "hover:bg-red-50",
    hoverBorder: "hover:border-red-200",
    hoverText: "hover:text-red-700",
  },
  {
    key: "outlook",
    label: "Outlook",
    icon: OutlookIcon,
    hoverBg: "hover:bg-indigo-50",
    hoverBorder: "hover:border-indigo-200",
    hoverText: "hover:text-indigo-700",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: WhatsAppIcon,
    hoverBg: "hover:bg-emerald-50",
    hoverBorder: "hover:border-emerald-200",
    hoverText: "hover:text-emerald-700",
  },
];

function StatPill({ icon: Icon, value, label, iconColor, bgFrom, bgTo }) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl py-3.5 px-2 text-center bg-linear-to-b ${bgFrom} ${bgTo} border border-white/60 shadow-sm`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm`}
      >
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </span>
      <span className="text-base font-extrabold text-slate-800 leading-none tabular-nums">
        {value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
  );
}

function InterviewCard({ interview, onDelete }) {
  const { user } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [candidateEmails, setCandidateEmails] = useState(() =>
    getInterviewCandidateEmails(interview),
  );

  useEffect(() => {
    setCandidateEmails(getInterviewCandidateEmails(interview));
  }, [interview]);

  const interviewUrl = useMemo(() => {
    const hostUrl =
      process.env.NEXT_PUBLIC_HOST_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");
    return `${hostUrl.replace(/\/$/, "")}/${interview?.interview_id}`;
  }, [interview?.interview_id]);

  const expiresAt = useMemo(() => {
    const createdAt = interview?.created_at
      ? new Date(interview.created_at)
      : new Date();
    return new Date(
      createdAt.getTime() + 30 * 24 * 60 * 60 * 1000,
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [interview?.created_at]);

  const createdAtLabel = useMemo(() => {
    if (!interview?.created_at) return "Just now";
    return new Date(interview.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [interview?.created_at]);

  const questionCount = useMemo(() => {
    if (Array.isArray(interview?.questionList?.interviewQuestions))
      return interview.questionList.interviewQuestions.length;
    if (Array.isArray(interview?.questList)) return interview.questList.length;
    return 0;
  }, [interview?.questionList, interview?.questList]);

  const responseCount =
    interview?.interview_results_count ??
    interview?.interview_results?.length ??
    0;

  const interviewTitle = interview?.jobPosition?.trim() || "Untitled Interview";

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(interviewUrl);
      toast.success("Interview link copied!");
    } catch {
      toast.error("Failed to copy link. Please copy it manually.");
    }
  };

  const getEmailContent = () => {
    const senderName = user?.name ? `${user.name} (Recruiter)` : "Recruiter";
    const companyName = user?.companyName || "";
    const subject = `Invitation to Interview for the ${interviewTitle} Position | ${companyName}`;
    const body = `Dear Candidate,\n\nWe are pleased to invite you to interview for the ${interviewTitle} position.\n\nAccess the interview here:\n${interviewUrl}\n\nPlease complete it by ${expiresAt}.\n\nBest regards,\n${senderName}\n${companyName}`;
    return { subject, body };
  };

  const shareVia = (platform) => {
    const senderName = user?.name ? `${user.name} (Recruiter)` : "Recruiter";
    const companyName = user?.companyName || "";
    const whatsappMessage = `Hi,\n\nYou are invited to interview for the *${interviewTitle}* position.\n\n🔗 Interview link:\n${interviewUrl}\n\nPlease complete it by ${expiresAt}.\n\nBest regards,\n${senderName}${companyName ? ` — ${companyName}` : ""}`;
    const { subject, body } = getEmailContent();
    switch (platform) {
      case "gmail":
        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
          "_blank",
        );
        break;
      case "outlook":
        window.open(
          `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
          "_blank",
        );
        break;
      case "whatsapp":
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`,
          "_blank",
        );
        break;
      default:
        break;
    }
  };

  const handleDeleteInterview = async () => {
    if (!interview?.interview_id) {
      toast.error("Missing interview id. Please refresh and try again.");
      return;
    }
    setIsDeleting(true);
    try {
      const { error: resultDeleteError } = await supabase
        .from("interview_results")
        .delete()
        .eq("interview_id", interview.interview_id);
      if (resultDeleteError) throw resultDeleteError;

      let deleteQuery = supabase
        .from("interviews")
        .delete()
        .eq("interview_id", interview.interview_id);
      if (user?.email || interview?.userEmail) {
        deleteQuery = deleteQuery.eq(
          "userEmail",
          user?.email || interview.userEmail,
        );
      }
      const { error: interviewDeleteError } = await deleteQuery;
      if (interviewDeleteError) throw interviewDeleteError;

      toast.success("Interview deleted successfully.");
      onDelete?.();
    } catch (error) {
      console.error("Failed to delete interview:", error);
      toast.error("Failed to delete interview. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.1)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_-8px_rgba(79,70,229,0.18)] hover:border-indigo-200/70">
      <InterviewCandidateList
        interviewId={interview?.interview_id}
        ownerEmail={user?.email || interview?.userEmail}
        interviewTitle={interviewTitle}
        initialCandidateEmails={candidateEmails}
        onCandidatesChange={setCandidateEmails}
      />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3 pr-14">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 transition-transform duration-300 group-hover:scale-105">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h4
              className="truncate text-[15px] font-semibold text-blue-600 leading-snug"
              title={interviewTitle}
            >
              {interviewTitle}
            </h4>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="h-3 w-3" />
              Created&nbsp;{createdAtLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatPill
            icon={Users}
            value={responseCount}
            label="Responses"
            iconColor="text-indigo-500"
            bgFrom="from-indigo-50"
            bgTo="to-white"
          />
          <StatPill
            icon={List}
            value={questionCount || "—"}
            label="Questions"
            iconColor="text-violet-500"
            bgFrom="from-violet-50"
            bgTo="to-white"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5">
          <CheckSquare className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <span className="flex flex-wrap items-center gap-x-1 text-[11px] text-slate-500">
            <span>
              Expires&nbsp;
              <span className="font-semibold text-slate-700">{expiresAt}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              <span className="font-semibold text-slate-700">
                {candidateEmails.length}
              </span>{" "}
              allowed candidate{candidateEmails.length === 1 ? "" : "s"}
            </span>
          </span>
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer text-xs h-9"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Share Interview</DialogTitle>
                <DialogDescription>
                  Choose how you want to send this interview invitation.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Interview link
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      readOnly
                      value={interviewUrl}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                    />
                    <Button
                      type="button"
                      onClick={onCopyLink}
                      className="shrink-0 rounded-xl gap-1.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {SHARE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => shareVia(option.key)}
                        className={`group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-xs font-semibold text-slate-600 transition-all duration-200 cursor-pointer ${option.classes}`}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                          <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                className="rounded-xl border-red-100 text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer text-xs h-9"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this interview?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the interview link and all saved
                  responses for{" "}
                  <span className="font-semibold text-slate-700">
                    {interviewTitle}
                  </span>
                  .
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteInterview}
                  className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Interview
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export default InterviewCard;
