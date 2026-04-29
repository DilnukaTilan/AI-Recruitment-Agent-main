"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Sparkles,
  MessageSquareText,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function parseFeedbackPayload(candidate) {
  const rawPayload = candidate?.result?.conversation_transcript;

  if (!rawPayload) return { feedback: null, rawPayload: null };

  if (typeof rawPayload === "string") {
    try {
      const parsed = JSON.parse(rawPayload);
      return { feedback: parsed?.feedback || parsed, rawPayload: parsed };
    } catch {
      return { feedback: null, rawPayload };
    }
  }

  return {
    feedback: rawPayload?.feedback || rawPayload,
    rawPayload,
  };
}

function recommendationConfig(recommendation) {
  switch (recommendation) {
    case "Strongly Recommended":
      return {
        border: "border-emerald-300",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        glow: "shadow-emerald-500/15",
        gradient: "from-emerald-500 to-teal-500",
      };
    case "Recommended":
      return {
        border: "border-blue-300",
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-500",
        glow: "shadow-blue-500/15",
        gradient: "from-blue-500 to-indigo-500",
      };
    default:
      return {
        border: "border-rose-300",
        bg: "bg-rose-50",
        text: "text-rose-700",
        dot: "bg-rose-500",
        glow: "shadow-rose-500/15",
        gradient: "from-rose-500 to-pink-500",
      };
  }
}

function getScoreColor(score) {
  if (score >= 8) return { stroke: "#10b981", bg: "rgba(16,185,129,0.08)" };
  if (score >= 6) return { stroke: "#3b82f6", bg: "rgba(59,130,246,0.08)" };
  if (score >= 4) return { stroke: "#f59e0b", bg: "rgba(245,158,11,0.08)" };
  return { stroke: "#ef4444", bg: "rgba(239,68,68,0.08)" };
}

function ScoreRing({ score, label, delay = 0 }) {
  const numericScore = typeof score === "number" ? score : parseFloat(score);
  const displayScore = isNaN(numericScore) ? 0 : numericScore;
  const percentage = (displayScore / 10) * 100;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const colors = getScoreColor(displayScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + delay * 0.06, duration: 0.35 }}
      className="group flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-all duration-200 hover:border-slate-300 hover:shadow-md"
    >
      <div className="relative h-[76px] w-[76px]">
        <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90">
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-slate-100"
          />
          <motion.circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset:
                circumference - (percentage / 100) * circumference,
            }}
            transition={{
              delay: 0.3 + delay * 0.06,
              duration: 0.8,
              ease: "easeOut",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + delay * 0.06, duration: 0.3 }}
            className="text-lg font-bold text-slate-800"
          >
            {displayScore}
          </motion.span>
        </div>
      </div>
      <p className="max-w-[100px] text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 transition-colors group-hover:text-slate-600">
        {label}
      </p>
    </motion.div>
  );
}

function SectionCard({ icon: Icon, iconColor, title, delay = 0, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br ${iconColor} text-white shadow-sm`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      </div>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}

function CandidateFeedbackDialog({ candidate, interviewTitle }) {
  const { feedback, rawPayload } = parseFeedbackPayload(candidate);
  const ratings = Object.entries(feedback?.rating || {});
  const recConfig = recommendationConfig(feedback?.recommendation);
  const initials = (candidate?.name || candidate?.email || "C")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="group/btn relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:from-indigo-600 hover:to-blue-500 hover:shadow-2xl hover:shadow-indigo-500/40 cursor-pointer">
          <span className="relative flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View Report
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl shadow-slate-900/10">
        <div className="relative overflow-hidden border-b border-slate-100 bg-linear-to-br from-blue-50 via-white to-indigo-50 px-6 py-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-indigo-100/40 blur-2xl" />

          <DialogHeader className="relative z-10">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 shrink-0 rounded-full shadow-lg shadow-blue-500/25">
                {candidate?.picture ? (
                  <AvatarImage
                    src={candidate.picture}
                    alt={candidate?.name || candidate?.email || "Candidate"}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
                  {candidate?.name || "Candidate"} Report
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-slate-500">
                  {interviewTitle || "Interview"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.3 }}
            className="flex flex-wrap items-center gap-2.5"
          >
            {feedback?.recommendation && (
              <Badge
                variant="outline"
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm ${recConfig.border} ${recConfig.bg} ${recConfig.text} ${recConfig.glow}`}
              >
                <span
                  className={`mr-2 inline-block h-2 w-2 rounded-full ${recConfig.dot}`}
                />
                {feedback.recommendation}
              </Badge>
            )}

            {!feedback?.recommendation && (
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-500"
              >
                Recommendation unavailable
              </Badge>
            )}

            {candidate?.completedAt && (
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-500"
              >
                <Calendar className="mr-1.5 h-3 w-3" />
                {new Date(candidate.completedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Badge>
            )}
          </motion.div>

          {feedback?.summary && (
            <SectionCard
              icon={Sparkles}
              iconColor="from-amber-500 to-orange-500"
              title="Summary"
              delay={0.1}
            >
              <p className="text-sm leading-7 text-slate-600">
                {feedback.summary}
              </p>
            </SectionCard>
          )}

          {ratings.length > 0 && (
            <SectionCard
              icon={TrendingUp}
              iconColor="from-blue-600 to-indigo-600"
              title="Performance Ratings"
              delay={0.15}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ratings.map(([category, score], i) => (
                  <ScoreRing
                    key={category}
                    score={score}
                    label={category
                      .replace(/[\[\]'"]/g, "")
                      .replace(/_/g, " ")
                      .replace(/([A-Z])/g, " $1")
                      .trim()}
                    delay={i}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {feedback?.recommendationMessage && (
            <SectionCard
              icon={MessageSquareText}
              iconColor="from-violet-600 to-purple-600"
              title="Recommendation Note"
              delay={0.2}
            >
              <p className="text-sm leading-7 text-slate-600">
                {feedback.recommendationMessage}
              </p>
            </SectionCard>
          )}

          {!feedback && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-500">
                This completed interview does not have a structured report yet.
              </p>
            </motion.section>
          )}

          {!feedback && typeof rawPayload === "string" && (
            <SectionCard
              icon={FileText}
              iconColor="from-slate-600 to-slate-700"
              title="Raw Report Data"
              delay={0.15}
            >
              <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100 shadow-inner">
                {rawPayload}
              </pre>
            </SectionCard>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CandidateFeedbackDialog;
