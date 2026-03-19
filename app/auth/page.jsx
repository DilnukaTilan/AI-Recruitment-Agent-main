"use client";

import React from "react";
import { supabase } from "@/services/supabaseClient";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Clock,
  BarChart2,
  Zap,
} from "lucide-react";

export default function Login() {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `http://localhost:3000`,
      },
    });
    if (error) console.error(error.message);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-125 h-125 bg-blue-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-150 h-150 bg-indigo-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="flex flex-1 flex-col lg:flex-row relative z-10">
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-16 md:px-14 lg:px-20 xl:px-28 space-y-10">
          <div className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-linear-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm ring-1 ring-blue-200/50 transition-transform group-hover:scale-105">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              AIcruiter Pro
            </h1>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
            Transform Your{" "}
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Hiring Process
            </span>{" "}
            with AI
          </h2>

          <p className="text-gray-500 max-w-lg text-lg leading-relaxed">
            Our intelligent platform leverages cutting-edge artificial
            intelligence to help you find, evaluate, and hire top talent faster
            than ever before.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {[
              {
                icon: <ShieldCheck className="h-5 w-5 text-blue-500" />,
                title: "Bias-Free Screening",
                desc: "Reduce unconscious bias in hiring",
                ring: "ring-blue-100",
              },
              {
                icon: <Clock className="h-5 w-5 text-indigo-500" />,
                title: "Time Savings",
                desc: "80% faster candidate screening",
                ring: "ring-indigo-100",
              },
              {
                icon: <BarChart2 className="h-5 w-5 text-purple-500" />,
                title: "Data Insights",
                desc: "Actionable hiring analytics",
                ring: "ring-purple-100",
              },
              {
                icon: <Zap className="h-5 w-5 text-amber-500" />,
                title: "Smart Matching",
                desc: "AI-powered candidate-job fit",
                ring: "ring-amber-100",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-start space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm ring-1 ${item.ring} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default`}
              >
                <div className="mt-0.5 shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 lg:px-14 lg:py-24 relative">
          <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 lg:rounded-l-[3rem] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
            <div className="absolute top-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          </div>

          <div className="w-full max-w-md relative z-10">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/20 overflow-hidden ring-1 ring-white/20">
              <div className="p-10 md:p-12 text-center">
                <div className="flex justify-center mb-4">
                  <Image
                    src="/logo.png"
                    alt="logo"
                    width={400}
                    height={100}
                    className="w-45"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                  Welcome to AIcruiter
                </h2>
                <p className="text-gray-500 mb-9 text-sm leading-relaxed">
                  Sign in with your Google account to get started
                </p>

                <Button
                  onClick={signInWithGoogle}
                  className="w-full py-3.5 px-5 inline-flex justify-center items-center gap-3 rounded-2xl font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 cursor-pointer text-sm"
                >
                  <Image
                    src="/googleicon.svg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  Continue with Google
                </Button>
              </div>
              <div className="px-8 py-4 bg-gray-50/80 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                  By continuing, you agree to our{" "}
                  <a
                    href="#"
                    className="font-medium text-gray-600 hover:text-blue-600 transition-colors underline decoration-gray-300 hover:decoration-blue-400 underline-offset-2"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="font-medium text-gray-600 hover:text-blue-600 transition-colors underline decoration-gray-300 hover:decoration-blue-400 underline-offset-2"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
