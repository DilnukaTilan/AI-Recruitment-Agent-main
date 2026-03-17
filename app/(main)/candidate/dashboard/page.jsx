"use client";

import React from "react";
import CreateOptions from "./_components/CreateOptions";

function DashboardCandidate() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Dashboard
        </h2>
        <p className="text-gray-500">
          Join AI-powered interviews and upload your CV to get started.
        </p>
      </div>

      <div className="space-y-8">
        <CreateOptions />
      </div>
    </div>
  );
}

export default DashboardCandidate;
