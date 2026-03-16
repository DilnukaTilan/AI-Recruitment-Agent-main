"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Coins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/app/provider";

export default function BillingSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchAndSetUser } = useUser();
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (fetchAndSetUser) fetchAndSetUser();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/recruiter/dashboard");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen rounded-3xl flex items-center justify-center p-6 bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Payment Successful!
          </h1>
          <p className="text-gray-500 text-sm">
            Your credits have been added to your account. You can now create AI
            interviews.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 border border-blue-100 py-3 px-4">
          <Coins className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">
            Credits added to your account
          </span>
        </div>

        <Button
          onClick={() => router.push("/recruiter/dashboard")}
          className="w-full group relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-600 hover:to-blue-500 hover:shadow-2xl hover:shadow-indigo-500/40 cursor-pointer"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Button>

        <p className="text-xs text-gray-400">
          Redirecting automatically in {countdown}s…
        </p>
      </div>
    </div>
  );
}
