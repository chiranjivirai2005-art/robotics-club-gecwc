"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminFeedbackPage() {
  const [feedbackItems, setFeedbackItems] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const snapshot = await getDocs(
        query(collection(db, "feedback"), orderBy("createdAt", "desc"))
      );
      setFeedbackItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    };

    fetchFeedback();
  }, []);

  const markResolved = async (id) => {
    await updateDoc(doc(db, "feedback", id), { resolved: true });
    setFeedbackItems((current) =>
      current.map((item) => (item.id === id ? { ...item, resolved: true } : item))
    );
  };

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <p className="eyebrow">Feedback Inbox</p>
          <h1 className="section-title">Review feedback sent by users</h1>
        </section>

        <div className="space-y-5">
          {feedbackItems.length === 0 ? (
            <div className="content-card text-slate-300">No feedback submitted yet.</div>
          ) : (
            feedbackItems.map((item) => (
              <div key={item.id} className="content-card">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl text-white">{item.userEmail}</h2>
                  <span
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.16em] ${
                      item.resolved
                        ? "border-green-400/20 bg-green-400/10 text-green-100"
                        : "border-yellow-400/20 bg-yellow-400/10 text-yellow-100"
                    }`}
                  >
                    {item.resolved ? "Resolved" : "Open"}
                  </span>
                </div>
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-slate-400">
                  Role: {item.role}
                </p>
                <p className="mt-4 leading-7 text-slate-300">{item.message}</p>
                {!item.resolved && (
                  <button onClick={() => markResolved(item.id)} className="btn-admin mt-6">
                    Mark Resolved
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
