import React from "react";
import { Phone, Video, Coins, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/app/provider";

function CreateOptions() {
  const { user } = useUser();
  const hasCredits = (user?.credits || 0) > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="relative group">
        <Link href={hasCredits ? "/recruiter/dashboard/create-interview" : "#"}>
          <div
            className={`h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ${hasCredits ? "cursor-pointer hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1" : "cursor-not-allowed"}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Video className="h-8 w-8" strokeWidth={1.5} />
              </div>
              {!hasCredits && (
                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full shadow-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    NO CREDITS
                  </span>
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Create New Interview
            </h2>
            <p className="text-gray-500 text-sm mb-6 grow leading-relaxed">
              Generate an AI-driven interview and instantly schedule it with
              your candidates.
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100/50">
                <Coins className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  Cost: 1 Credit
                </span>
              </div>
              {hasCredits && (
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              )}
            </div>
          </div>
        </Link>
      </div>

      <div className="relative h-full flex flex-col bg-linear-to-br from-gray-50 to-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="absolute top-6 right-6">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
            Coming Soon
          </span>
        </div>

        <div className="flex items-start mb-4">
          <div className="p-3 bg-gray-100 text-gray-400 rounded-xl">
            <Phone className="h-8 w-8" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-400 mb-2">
          Phone Screening Call
        </h2>
        <p className="text-gray-400 text-sm mb-6 grow leading-relaxed">
          Schedule automated phone screening calls with candidates directly to
          their mobile devices.
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 opacity-50">
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-indigo-300 rounded-full animate-pulse"></div>
          </div>
          <p className="text-[10px] text-center mt-3 font-bold text-gray-400 uppercase tracking-widest">
            In Development
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreateOptions;
