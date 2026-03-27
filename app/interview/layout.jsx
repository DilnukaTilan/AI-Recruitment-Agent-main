"use client";

import React, { useState } from "react";
import { InterviewDataContext } from "@/context/InterviewDataContext";

const InterviewLayout = ({ children }) => {
  const [interviewInfo, setInterviewInfo] = useState();

  return (
    <InterviewDataContext.Provider value={{ interviewInfo, setInterviewInfo }}>
      <div className="bg-secondary pb-6">{children}</div>
    </InterviewDataContext.Provider>
  );
};

export default InterviewLayout;
