"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function FacultyReview() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!loading && !["admin", "faculty"].includes(role)) {
      router.push("/dashboard");
    }
  }, [role, loading, router]);

  useEffect(() => {
    const fetchEvents = async () => {
      const q = query(
        collection(db, "event_submissions"),
        where("status", "==", "pending_faculty")
      );
      const snapshot = await getDocs(q);
      setEvents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    };

    fetchEvents();
  }, []);

  const approveEvent = async (event) => {
    await addDoc(collection(db, "events"), {
      title: event.title,
      description: event.description || "",
      date: event.date,
      location: event.location || "",
      imageURL: event.posterURL || "",
      public_id: event.posterPublicId || "",
      createdAt: serverTimestamp(),
      sourceSubmissionId: event.id,
      submittedBy: event.createdBy || "",
      submittedByName: event.createdByName || "",
      publishedBy: user.uid,
    });

    await updateDoc(doc(db, "event_submissions", event.id), {
      status: "approved",
      facultyApprovedBy: user.uid,
      facultyApprovedAt: serverTimestamp(),
    });

    setEvents((current) => current.filter((item) => item.id !== event.id));
  };

  const rejectEvent = async (id) => {
    await updateDoc(doc(db, "event_submissions", id), {
      status: "rejected",
      facultyApprovedBy: user.uid,
      facultyApprovedAt: serverTimestamp(),
    });
    setEvents((current) => current.filter((event) => event.id !== id));
  };

  if (loading) return <p className="mt-10 text-center">Loading...</p>;

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <p className="eyebrow">Faculty Review</p>
          <h1 className="section-title">Finalize coordinator-cleared event submissions</h1>
        </section>

        {events.length === 0 ? (
          <div className="content-card text-slate-300">No events pending faculty approval.</div>
        ) : (
          <div className="space-y-5">
            {events.map((event) => (
              <div key={event.id} className="content-card">
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
                    {event.posterURL ? (
                      <Image src={event.posterURL} alt={event.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        No poster uploaded
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl text-white">{event.title}</h2>
                    <p className="mt-3 leading-7 text-slate-300">{event.description}</p>
                    <div className="mt-4 space-y-1 text-sm text-slate-400">
                      <p>Date: {new Date(event.date).toLocaleString()}</p>
                      {event.location && <p>Location: {event.location}</p>}
                      <p>Submitted by: {event.createdByName}</p>
                      <p>Coordinator reviewed: {event.coordinatorApprovedBy ? "Yes" : "No"}</p>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button onClick={() => approveEvent(event)} className="btn-admin">
                        Approve And Publish
                      </button>
                      <button
                        onClick={() => rejectEvent(event.id)}
                        className="rounded-full border border-red-400/20 bg-red-400/10 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
