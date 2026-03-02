"use client";

import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-12 bg-white dark:bg-slate-950">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="http://localhost:3000/"
            className="transition-transform hover:scale-105"
          >
            <Image
              src={"/logo.png"}
              alt="logo"
              width={200}
              height={100}
              className="w-37.5"
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <LoginForm />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground tracking-wide">
          &copy; {new Date().getFullYear()} AIcruiter. All rights reserved.
        </p>
      </div>

      <div className="relative hidden lg:flex flex-col items-center justify-center bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 p-16 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-105 w-105 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-90 w-90 rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-125 rounded-full bg-indigo-500/10 blur-[140px]" />

        <div className="absolute top-16 left-20 w-1 h-1 rounded-full bg-indigo-400/60 animate-pulse animation-duration-[3s]" />
        <div className="absolute top-28 right-28 w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse animation-duration-[4s] [animation-delay:1s]" />
        <div className="absolute bottom-24 left-32 w-1 h-1 rounded-full bg-purple-400/50 animate-pulse animation-duration-[3.5s] [animation-delay:0.5s]" />
        <div className="absolute bottom-40 right-16 w-2 h-2 rounded-full bg-indigo-300/30 animate-pulse animation-duration-[5s] [animation-delay:2s]" />
        <div className="absolute top-1/2 left-10 w-1 h-1 rounded-full bg-white/25 animate-pulse animation-duration-[4s] [animation-delay:1.5s]" />

        <div className="relative z-10 max-w-lg text-center space-y-10">
          <div className="mx-auto inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-indigo-500/20 to-cyan-500/20 backdrop-blur-xl shadow-2xl shadow-indigo-500/20 ring-1 ring-white/10 transition-all hover:scale-110 hover:rotate-3 hover:shadow-indigo-500/30 duration-500 ease-out">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-indigo-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>

          <div className="space-y-4">
            <h2 className="text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
              Hire smarter,
              <br />
              <span className="bg-linear-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                faster, with AI
              </span>
            </h2>
            <div className="mx-auto h-1 w-16 rounded-full bg-linear-to-r from-indigo-500 to-cyan-500" />
          </div>

          <p className="text-slate-300/90 text-lg leading-relaxed max-w-sm mx-auto">
            Automate your recruitment pipeline with voice&#8209;powered AI
            interviews, instant scoring, and actionable insights.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Voice Interviews", color: "bg-emerald-400", delay: "" },
              {
                label: "Smart Scoring",
                color: "bg-blue-400",
                delay: "[animation-delay:0.3s]",
              },
              {
                label: "Deep Analytics",
                color: "bg-purple-400",
                delay: "[animation-delay:0.6s]",
              },
            ].map(({ label, color, delay }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white/6 backdrop-blur-md px-5 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/8 transition-colors hover:bg-white/10"
              >
                <span
                  className={`w-2 h-2 rounded-full ${color} animate-pulse ${delay}`}
                />
                {label}
              </span>
            ))}
          </div>

          <div className="flex justify-center gap-8 pt-4">
            {[
              { value: "10x", label: "Faster" },
              { value: "98%", label: "Accuracy" },
              { value: "24/7", label: "Available" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-8">
                <div className="text-center group cursor-default">
                  <p className="text-white text-2xl xl:text-3xl font-bold transition-colors group-hover:text-indigo-400">
                    {stat.value}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
                </div>
                {i < 2 && (
                  <div className="w-px h-10 bg-linear-to-b from-transparent via-slate-500 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
