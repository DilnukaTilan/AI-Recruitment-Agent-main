"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  List,
  Mail,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useMemo } from "react";
import { toast } from "sonner";
import { UserDetailContext } from "@/context/UserDetailContext";
import Image from "next/image";

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

const InterviewLink = ({ interview_id, formData, questionList }) => {
  const router = useRouter();
  const { user } = useContext(UserDetailContext);

  const hostUrl =
    process.env.NEXT_PUBLIC_HOST_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");
  const baseUrl = hostUrl.replace(/\/$/, "");
  const url = `${baseUrl}/${interview_id}`;

  const expiresAt = useMemo(() => {
    const createdAt = formData?.created_at
      ? new Date(formData.created_at)
      : new Date();
    const futureDate = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    return futureDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [formData?.created_at]);

  const questionCount = useMemo(() => {
    if (Array.isArray(questionList?.interviewQuestions)) {
      return questionList.interviewQuestions.length;
    }
    if (Array.isArray(formData?.questList)) {
      return formData.questList.length;
    }
    return 10;
  }, [questionList?.interviewQuestions, formData?.questList]);

  const interviewTitle = formData?.jobPosition?.trim() || "Requested";

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Interview link copied!");
    } catch {
      toast.error("Failed to copy link. Please copy it manually.");
    }
  };

  const getEmailContent = () => {
    const senderName = user?.name ? `${user.name} (Recruiter)` : "Recruiter";
    const companyName = user?.companyName || "";

    const subject = `Invitation to Interview for the ${interviewTitle} Position | ${companyName}`;
    const body = `Dear Candidate,\n\nWe are pleased to invite you to interview for the ${interviewTitle} position. This interview is designed to assess your skills and provide an opportunity to demonstrate your abilities.\n\nYou can access the interview using the following link:\n${url}\n\nPlease ensure you complete the interview before the deadline (${expiresAt}). If you have any questions or require assistance, please do not hesitate to contact us.\n\nWe look forward to your responses.\n\nBest regards,\n${senderName} \n${companyName}`;

    return { subject, body };
  };

  const shareVia = (platform) => {
    const senderName = user?.name ? `${user.name} (Recruiter)` : "Recruiter";
    const companyName = user?.companyName || "";

    const whatsappMessage = `Dear Candidate,\n\nYou are invited to participate in the interview process for the ${interviewTitle} position.\n\nPlease use the link below to access your interview:\n${url}\n\nKindly complete it on or before ${expiresAt}.\n\nIf you need any assistance, please feel free to reach out.\n\nBest regards,\n${senderName} \n${companyName}`;

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

  return (
    <div className="space-y-6 w-full">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Image
          src={"/tick.svg"}
          alt="success_icon"
          width={200}
          height={300}
          className="size-[75px]"
        />
        <div className="space-y-1.5 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
            Your AI Interview is Ready!
          </h2>
          <p className="text-sm text-slate-500">
            Share the link below with candidates to kick off the interview
            process.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30">
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Interview Link
              </h3>
            </div>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Valid for 30 days
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <input
              readOnly
              value={url}
              className="flex-1 truncate rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none"
            />
            <Button
              onClick={onCopyLink}
              className="shrink-0 rounded-xl gap-2 bg-linear-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md shadow-blue-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 cursor-pointer"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </div>

          <div className="border-t border-slate-100" />

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200">
                <Clock className="h-3 w-3 text-slate-500" />
              </span>
              {formData?.duration || "30 min"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200">
                <List className="h-3 w-3 text-slate-500" />
              </span>
              {questionCount} Questions
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200">
                <Calendar className="h-3 w-3 text-slate-500" />
              </span>
              Valid till {expiresAt}
            </span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30">
              <Mail className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Share via</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => shareVia("gmail")}
              className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-600 text-xs font-semibold hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all duration-200 cursor-pointer"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                <GmailIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              </span>
              Gmail
            </button>

            <button
              onClick={() => shareVia("outlook")}
              className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-600 text-xs font-semibold hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 cursor-pointer"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                <OutlookIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              </span>
              Outlook
            </button>

            <button
              onClick={() => shareVia("whatsapp")}
              className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-600 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 cursor-pointer"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                <WhatsAppIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              </span>
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/recruiter/dashboard")}
          className="group rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 gap-2 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1.5" />
          Back to Dashboard
        </Button>
        <Button
          onClick={() => window.location.reload()}
          className="rounded-xl gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewLink;
