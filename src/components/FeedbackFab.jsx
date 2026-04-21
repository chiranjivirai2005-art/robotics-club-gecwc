"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function FeedbackFab() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return (
    <Link
      href="/feedback"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-slate-950/90 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100 shadow-[0_18px_45px_rgba(2,8,23,0.45)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-slate-900"
    >
      <MessageSquareText size={18} />
      Feedback
    </Link>
  );
}
