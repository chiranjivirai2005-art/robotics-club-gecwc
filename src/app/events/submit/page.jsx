"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function SubmitEvent() {
  const { user, role, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [posterData, setPosterData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Please log in to submit an event.");
      return;
    }

    const title = e.target.title.value;
    const description = e.target.description.value;
    const location = e.target.location.value;
    const date = e.target.date.value;

    try {
      await addDoc(collection(db, "event_submissions"), {
        title,
        description,
        location,
        date: new Date(date).toISOString(),
        posterURL: posterData?.url || "",
        posterPublicId: posterData?.public_id || "",
        createdBy: user.uid,
        createdByName: user.email,
        createdByRole: role || "member",
        status: "pending_coordinator",
        coordinatorApprovedBy: "",
        facultyApprovedBy: "",
        createdAt: serverTimestamp(),
      });

      setMessage("Event submitted successfully and sent to coordinator review.");
      setPosterData(null);
      e.target.reset();
    } catch (error) {
      console.error("Error submitting event:", error);
      setMessage("Failed to submit event.");
    }
  };

  if (loading) return <p className="mt-10 text-center">Loading...</p>;

  return (
    <div className="auth-shell">
      <form onSubmit={handleSubmit} className="auth-card max-w-2xl">
        <p className="eyebrow">Submit Event</p>
        <h1 className="mt-3 text-4xl text-white">Propose a new club activity</h1>
        <p className="mt-4 leading-7 text-slate-300">
          Add the event brief, upload the poster, and send it through the volunteer to coordinator to faculty approval chain.
        </p>

        {message && (
          <p className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
            {message}
          </p>
        )}

        <div className="mt-8 space-y-4">
          <input name="title" placeholder="Event Title" required className="field" />
          <textarea
            name="description"
            placeholder="Event Description"
            required
            className="field min-h-32"
          />
          <input name="location" placeholder="Venue / Location" className="field" />
          <input type="datetime-local" name="date" required className="field" />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-sm uppercase tracking-[0.16em] text-slate-300">
              Event Poster
            </p>
            <CloudinaryUpload onUpload={setPosterData} />
            {posterData?.url && (
              <p className="mt-3 text-sm text-cyan-100">Poster uploaded successfully.</p>
            )}
          </div>
        </div>

        <button className="btn-primary mt-8 w-full">Submit Event</button>
      </form>
    </div>
  );
}
