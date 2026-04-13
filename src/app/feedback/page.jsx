"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

export default function FeedbackPage() {
  const { user, role, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    try {
      setSubmitting(true);
      setStatus("");

      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        userEmail: user.email,
        role: role || "unknown",
        message: message.trim(),
        resolved: false,
        createdAt: serverTimestamp(),
      });

      setMessage("");
      setStatus("Feedback sent successfully.");
    } catch (error) {
      console.error("Feedback submission failed:", error);
      setStatus("Failed to send feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="mt-10 text-center">Loading...</p>;

  return (
    <div className="auth-shell">
      <form onSubmit={handleSubmit} className="auth-card max-w-2xl">
        <p className="eyebrow">Feedback</p>
        <h1 className="mt-3 text-4xl text-white">Share a note with the admin team</h1>
        <p className="mt-4 leading-7 text-slate-300">
          Use this to report issues, suggest improvements, or describe workflow problems.
        </p>

        {status && (
          <p className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
            {status}
          </p>
        )}

        <div className="mt-8 space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell the admin team what needs attention..."
            required
            className="field min-h-40"
          />
        </div>

        <button disabled={submitting} className="btn-primary mt-8 w-full">
          {submitting ? "Sending..." : "Send Feedback"}
        </button>
      </form>
    </div>
  );
}
