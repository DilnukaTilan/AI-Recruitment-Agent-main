"use client";

import React from "react";
import CreditsDisplay from "./_components/CreditsDisplay";

function Dashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col gap-1 border-b pb-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
          Dashboard
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your recruitment process and track recent interviews.
        </p>
      </div>

      <div className="space-y-8">
        <CreditsDisplay />
      </div>
    </div>
  );
}

export default Dashboard;
