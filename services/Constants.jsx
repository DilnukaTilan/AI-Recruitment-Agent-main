import {
  BriefcaseBusinessIcon,
  Code2Icon,
  User2Icon,
  Component,
  Puzzle,
  Calendar,
  LayoutDashboard,
  List,
  Settings,
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
    name: "Scheduled Interview",
    icon: Calendar,
    path: "/recruiter/scheduled-interview",
  },
  {
    name: "All Interview",
    icon: List,
    path: "/recruiter/all-interview",
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
  {
    name: "Settings",
    icon: Settings,
    path: "/recruiter/settings",
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
  {
    name: "Settings",
    icon: Settings,
    path: "/candidate/settings",
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
    name: "Problem Solving",
    icon: Puzzle,
  },
  {
    name: "Leadership",
    icon: Component,
  },
];
