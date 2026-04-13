"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, FileStack, ShieldAlert } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function CoordinatorPanel() {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (!loading && role !== "coordinator") {
      router.push("/dashboard");
    }
  }, [loading, role, router]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const snapshot = await getDocs(collection(db, "event_submissions"));
      setSubmissions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchSubmissions();
  }, []);

  const stats = useMemo(
    () => ({
      total: submissions.length,
      pendingCoordinator: submissions.filter((item) => item.status === "pending_coordinator").length,
      pendingFaculty: submissions.filter((item) => item.status === "pending_faculty").length,
      approved: submissions.filter((item) => item.status === "approved").length,
    }),
    [submissions]
  );

  const pendingItems = submissions.filter((item) => item.status === "pending_coordinator");

  if (loading) return <p className="mt-10 text-center">Loading...</p>;

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Coordinator Panel</p>
              <h1 className="section-title max-w-3xl">
                Manage the volunteer-to-faculty event approval pipeline.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Review volunteer proposals, maintain poster quality, and move only validated submissions to the faculty stage.
              </p>
            </div>
            <Link href="/events/review" className="btn-primary">
              Open Review Queue
            </Link>
          </div>
        </section>

        <div className="mb-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={FileStack} label="Total Proposals" value={stats.total} />
          <StatCard icon={Clock3} label="Pending Review" value={stats.pendingCoordinator} />
          <StatCard icon={ShieldAlert} label="Sent To Faculty" value={stats.pendingFaculty} />
          <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="content-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Immediate Queue</p>
                <h2 className="mt-3 text-2xl text-white">Pending coordinator review</h2>
              </div>
              <Link href="/events/review" className="btn-admin">
                Review Now
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {pendingItems.length === 0 ? (
                <p className="text-slate-300">No items are currently waiting for coordinator review.</p>
              ) : (
                pendingItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-xl text-white">{item.title}</h3>
                    <p className="mt-2 line-clamp-2 text-slate-300">{item.description}</p>
                    <p className="mt-3 text-sm text-slate-400">Submitted by: {item.createdByName}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="content-card">
            <p className="eyebrow">Hierarchy</p>
            <h2 className="mt-3 text-2xl text-white">Approval flow</h2>
            <div className="mt-6 space-y-3 text-slate-300">
              <p>1. Volunteer creates event proposal and uploads poster</p>
              <p>2. Coordinator checks clarity, poster quality, and readiness</p>
              <p>3. Faculty coordinator approves the final event publishing decision</p>
              <p>4. Approved events move into club communication and execution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="content-card text-center">
      <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-accent">
        <Icon size={22} />
      </div>
      <p className="text-4xl text-white">{value}</p>
      <p className="mt-3 text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
    </div>
  );
}
