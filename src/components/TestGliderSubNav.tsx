/**
 * Universal TestGlider 7-Category Tab Navigation Bar
 * Persistent across /dashboard, /test, /practice, /history, /lessons, /shadowing, /dictation.
 * Automatically highlights the active tab based on the current TanStack Router pathname.
 */

import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calendar,
  Briefcase,
  Puzzle,
  ClipboardList,
  PlaySquare,
  Mic,
  AudioLines,
} from "lucide-react";

export interface NavTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  pattern: RegExp;
}

const TABS: NavTabItem[] = [
  {
    id: "study-center",
    label: "Study Center",
    icon: Calendar,
    to: "/dashboard",
    pattern: /^\/dashboard/,
  },
  {
    id: "mock-tests",
    label: "Mock Tests",
    icon: Briefcase,
    to: "/test",
    pattern: /^\/test/,
  },
  {
    id: "practice-questions",
    label: "Practice Questions",
    icon: Puzzle,
    to: "/practice",
    pattern: /^\/practice/,
  },
  {
    id: "test-records",
    label: "Test Records",
    icon: ClipboardList,
    to: "/history",
    pattern: /^\/history/,
  },
  {
    id: "lessons",
    label: "Lessons",
    icon: PlaySquare,
    to: "/lessons",
    pattern: /^\/lessons/,
  },
  {
    id: "shadowing",
    label: "Shadowing",
    icon: Mic,
    to: "/shadowing",
    pattern: /^\/shadowing/,
  },
  {
    id: "dictation",
    label: "Dictation",
    icon: AudioLines,
    to: "/dictation",
    pattern: /^\/dictation/,
  },
];

export function TestGliderSubNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="border-b border-slate-200 bg-white shadow-xs select-none">
      <div className="mx-auto flex max-w-6xl items-center justify-start gap-8 px-6 py-3 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.pattern.test(pathname);

          return (
            <Link
              key={tab.id}
              to={tab.to}
              className={`flex flex-col items-center gap-1.5 transition-all text-xs font-semibold py-1 px-3 shrink-0 ${
                isActive ? "text-[#1d4ed8]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`flex size-11 items-center justify-center rounded-2xl transition-all ${
                  isActive
                    ? "bg-[#eaf1fb] text-[#1d4ed8] shadow-xs"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
              >
                <Icon className="size-5" />
              </div>
              <span className={isActive ? "font-bold" : "font-semibold"}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
