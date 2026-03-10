"use client";

import React from "react";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, ArrowRight, AlertCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

function CreditsDisplay() {
  const { user } = useUser();
  const router = useRouter();

  const handleBuyCredits = () => {
    router.push("/recruiter/billing");
  };

  const credits = user?.credits || 0;
  const isLowCredits = credits <= 2;

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-blue-50/70 shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <Coins className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Available Credits
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                    {credits}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    interviews
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 lg:px-8 max-w-2xl">
              {isLowCredits ? (
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 border border-amber-100">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800">
                      {credits === 0
                        ? "Out of credits"
                        : "Running low on credits"}
                    </h4>
                    <p className="mt-1 text-sm text-amber-700">
                      {credits === 0
                        ? "You've run out of interview credits. Please top up to continue creating interviews."
                        : `You only have ${credits} credit${credits === 1 ? "" : "s"} left. Top up soon to avoid interruption.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl bg-blue-50/50 p-4 border border-blue-100/50">
                  <Zap className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">
                      Ready to recruit
                    </h4>
                    <p className="mt-1 text-sm text-blue-700">
                      Each new interview costs 1 credit. You have enough credits
                      for <strong>{credits}</strong> more interview
                      {credits === 1 ? "" : "s"}.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-center">
              <Button
                onClick={handleBuyCredits}
                size="lg"
                className="group relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:from-indigo-600 hover:to-blue-500 hover:shadow-2xl hover:shadow-indigo-500/40 cursor-pointer"
              >
                <div className="absolute inset-0 bg-linear-to-t from-black/10 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                  Buy Credits
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditsDisplay;
