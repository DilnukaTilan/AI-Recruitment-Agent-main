import {
  BriefcaseBusinessIcon,
  Code2Icon,
  User2Icon,
  Component,
  Puzzle,
  Calendar,
  LayoutDashboard,
  List,
  WalletCards,
  Video,
} from "lucide-react";

export const SideBarRecruiter = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/recruiter/dashboard",
  },
  {
    name: "Scheduled Interviews",
    icon: Calendar,
    path: "/recruiter/scheduled-interviews",
  },
  {
    name: "All Interviews",
    icon: List,
    path: "/recruiter/all-interviews",
  },
  {
    name: "Profile",
    icon: User2Icon,
    path: "/recruiter/profile",
  },
  {
    name: "Billing",
    icon: WalletCards,
    path: "/recruiter/billing",
  },
];

export const SideBarCandidate = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/candidate/dashboard",
  },
  {
    name: "Interviews",
    icon: Video,
    path: "/candidate/interviews",
  },
  {
    name: "Profile",
    icon: User2Icon,
    path: "/candidate/profile",
  },
];

export const InterviewType = [
  {
    name: "Technical",
    icon: Code2Icon,
  },
  {
    name: "Behavioral",
    icon: User2Icon,
  },
  {
    name: "Experience",
    icon: BriefcaseBusinessIcon,
  },
  {
    name: "Problem-Solving",
    icon: Puzzle,
  },
  {
    name: "Leadership",
    icon: Component,
  },
];

export const QUESTIONS_PROMPT = `You are an expert technical interviewer.

Based on the following inputs, generate a well-structured list of high-quality interview questions. Include candidate introduction, salary negotiation, and closing questions alongside role-specific questions.

**Inputs:**
- Job Title: {{jobPosition}}
- Job Description: {{jobDescription}}
- Interview Duration: {{duration}}
- Interview Type: {{type}}

**Your Task:**
1. Analyze the job description to identify key responsibilities, required skills, and expected experience.
2. Generate a list of interview questions appropriate for the given interview duration.
3. Adjust the number and depth of questions so they fit within the interview duration.
4. Ensure the questions match the tone and structure of a real-life {{type}} interview.

**Question Types to Include (as applicable):**
These question types are mandatory (1 question each):
- Introduction: Candidate self-introduction covering education background, work experience, and current/previous companies.
- Location: Candidate's home and preferred working location.
- Motivation: "Why should we hire you?" and similar motivation questions.
- Salary: Present salary and salary expectations.

Based on the types outlined in Task 4 ({{type}}), include ONLY the matching question types ({{type}}) from the list below. Do not include other types.
- Technical: Role-specific technical questions.
- Behavioral: Situational and behavioral questions.
- Experience: Questions about past experience relevant to the role.
- Problem-Solving: Analytical and problem-solving questions.
- Leadership: Leadership and team management questions.

**Response Format:**
Return ONLY a valid JSON object in the following format (no additional text or markdown):
{
  "interviewQuestions": [
    {
      "question": "Your question text here",
      "type": "Introduction | Location | Motivation | Salary | Technical | Behavioral | Experience | Problem-Solving | Leadership"
    }
  ]
}

The goal is to create a structured, relevant, and time-optimized interview plan for a {{jobPosition}} role.`;

export const FEEDBACK_PROMPT = `{{conversation}}

Based on the above interview conversation between the assistant and the user, provide detailed feedback on the user's interview performance.

**Your Task:**
1. Rate the candidate out of 10 in each of the following categories: Technical Skills, Communication, Problem Solving, Experience, Behavioral, and Analysis.
2. Write a concise summary of the interview in exactly 3 lines.
3. Provide a clear hire recommendation (e.g., "Strongly Recommended", "Recommended", "Not Recommended") along with a one-line justification. Be very strict in your assessment.

**Response Format:**
Return ONLY a valid JSON object in the following format (no additional text or markdown):
{
  "feedback": {
    "rating": {
      "TechnicalSkills": 0,
      "Communication": 0,
      "ProblemSolving": 0,
      "Experience": 0,
      "Behavioral": 0,
      "Analysis": 0
    },
    "summary": "Three-line summary of the interview.",
    "recommendation": "Strongly Recommended | Recommended | Not Recommended",
    "recommendationMessage": "One-line justification for the recommendation."
  }
}`;
