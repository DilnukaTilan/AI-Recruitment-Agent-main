"use client";

import {
  File as FileIcon,
  ArrowRight,
  PlayCircle,
  Loader2,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/services/supabaseClient";

function CreateOptions() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    if (!code.trim()) {
      toast.error("Please enter an interview code.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("Interviews")
      .select("interview_id")
      .eq("interview_id", code.trim())
      .single();

    setLoading(false);

    if (error || !data) {
      toast.error("Invalid interview code. Please try again.");
      return;
    }

    toast.success("Redirecting to your interview...");
    router.push(`/interview/${code.trim()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-50">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <PlayCircle className="h-8 w-8" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2 transition-colors">
          Join Interview
        </h2>
        <p className="text-gray-500 text-sm mb-5 leading-relaxed grow">
          Enter your unique code or link from your recruiter to begin your AI
          interview session.
        </p>

        <div className="mt-auto space-y-4">
          <div className="relative">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code (UUID)"
              className="bg-gray-50/50 border-gray-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-sm py-5 pl-4 transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
          </div>
          <Button
            onClick={handleStart}
            disabled={loading}
            className="w-full transition-all shadow-md hover:shadow-lg group/btn cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Start Interview
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      <Link href={"/candidate/upload-cv"} className="block h-full outline-none">
        <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <FileIcon className="h-8 w-8" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
            Upload your CV
          </h2>
          <p className="text-gray-500 text-sm mb-6 grow leading-relaxed">
            Upload your latest resume to automatically populate your profile and
            improve AI interview accuracy.
          </p>

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-indigo-600 pb-2">
            <span className="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0 duration-300">
              Upload now
            </span>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default CreateOptions;
