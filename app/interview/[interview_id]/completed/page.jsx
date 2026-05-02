"use client";

import { Check, Clock, Mail, Shield, ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const InterviewCompleted = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <style>{`
        @keyframes successPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.65); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .success-pop { animation: successPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .ring-pulse { animation: ringPulse 2s ease-out infinite; }
        .fade-slide-up { animation: fadeSlideUp 0.5s ease-out forwards; }
        .fade-slide-up-1 { animation: fadeSlideUp 0.5s 0.1s ease-out both; }
        .fade-slide-up-2 { animation: fadeSlideUp 0.5s 0.2s ease-out both; }
        .fade-slide-up-3 { animation: fadeSlideUp 0.5s 0.3s ease-out both; }
        .fade-slide-up-4 { animation: fadeSlideUp 0.5s 0.4s ease-out both; }
        .fade-slide-up-5 { animation: fadeSlideUp 0.5s 0.5s ease-out both; }
      `}</style>

      <div className="max-w-lg w-full space-y-4">
        <div className="fade-slide-up">
          <button
            onClick={() => router.push("/candidate/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to Dashboard
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_-15px_rgba(15,23,42,0.2)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500" />

          <div className="relative z-10 px-8 pt-10 pb-8 text-center">
            <div className="fade-slide-up-1 relative mx-auto flex items-center justify-center h-24 w-24 mb-7">
              <div className="absolute inset-0 rounded-full bg-green-100 ring-pulse" />
              <div
                className="absolute inset-0 rounded-full bg-green-100 ring-pulse"
                style={{ animationDelay: "0.6s" }}
              />
              <div className="relative flex items-center justify-center h-full w-full rounded-full bg-linear-to-br from-green-500 to-emerald-400 shadow-lg shadow-green-500/30 success-pop">
                <Check className="h-11 w-11 text-white stroke-[2.5]" />
              </div>
            </div>

            <div className="fade-slide-up-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-4">
                <Sparkles className="h-3 w-3" />
                Interview Complete
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-3">
                Submitted{" "}
                <span className="bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Successfully
                </span>
              </h1>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                Thank you for completing your interview with{" "}
                <span className="font-semibold text-slate-700">AIcruiter</span>.
                We truly appreciate your thoughtful responses.
              </p>
            </div>

            <div className="fade-slide-up-3 space-y-3 mb-7 text-left">
              <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 hover:bg-blue-50/50 hover:border-blue-100 transition-colors duration-200">
                <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/25">
                  <Shield className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-0.5">
                    Secure Processing
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your responses are encrypted and stored with
                    enterprise-grade security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 hover:bg-violet-50/50 hover:border-violet-100 transition-colors duration-200">
                <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-purple-600 shadow-sm shadow-violet-500/25">
                  <Clock className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-0.5">
                    Review Timeline
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Our team will review your responses within{" "}
                    <span className="font-semibold text-violet-700">
                      3 business days
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 hover:bg-green-50/50 hover:border-green-100 transition-colors duration-200">
                <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-green-500 to-emerald-500 shadow-sm shadow-green-500/25">
                  <Mail className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-0.5">
                    Next Steps
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Expect an email update — check your spam folder if you
                    don&apos;t see it within the expected timeline.
                  </p>
                </div>
              </div>
            </div>

            <div className="fade-slide-up-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                You&apos;ve completed all steps — this window can now be closed.
              </p>
              <p className="text-xs text-slate-400 mt-1.5">
                Any further questions? Contact{" "}
                <a
                  href="mailto:support@email.com"
                  className="text-blue-600 font-medium hover:underline"
                >
                  support@email.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCompleted;
