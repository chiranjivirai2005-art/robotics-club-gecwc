"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, FileImage, Send, ShieldCheck, XCircle } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const statusMeta = {
  pending_coordinator: {
    label: "Pending Coordinator Review",
    className: "border-yellow-400/20 bg-yellow-400/10 text-yellow-100",
  },
  pending_faculty: {
    label: "Pending Faculty Approval",
    className: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  },
  approved: {
    label: "Approved",
    className: "border-green-400/20 bg-green-400/10 text-green-100",
  },
  rejected: {
    label: "Rejected",
    className: "border-red-400/20 bg-red-400/10 text-red-100",
  },
};

export default function VolunteerPanel() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (!loading && role !== "volunteer") {
      router.push("/dashboard");
    }
  }, [loading, role, router]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;

      const q = query(
        collection(db, "event_submissions"),
        where("createdBy", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
      setSubmissions(data);
    };

    fetchSubmissions();
  }, [user]);

  const stats = useMemo(
    () => ({
      total: submissions.length,
      pending: submissions.filter((item) =>
        ["pending_coordinator", "pending_faculty"].includes(item.status)
      ).length,
      approved: submissions.filter((item) => item.status === "approved").length,
      rejected: submissions.filter((item) => item.status === "rejected").length,
    }),
    [submissions]
  );

  if (loading) return <p className="mt-10 text-center">Loading...</p>;

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Volunteer Panel</p>
              <h1 className="section-title max-w-3xl">
                Submit event posters and track them through the approval chain.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Your proposals move progressively from coordinator review to faculty approval,
                keeping the hierarchy visible at every step.
              </p>
            </div>
            <Link href="/events/submit" className="btn-primary">
              <Send size={18} />
              New Submission
            </Link>
          </div>
        </section>

        <div className="mb-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={FileImage} label="Total Submissions" value={stats.total} />
          <StatCard icon={Clock3} label="In Review" value={stats.pending} />
          <StatCard icon={ShieldCheck} label="Approved" value={stats.approved} />
          <StatCard icon={XCircle} label="Rejected" value={stats.rejected} />
        </div>

        <div className="space-y-5">
          {submissions.length === 0 ? (
            <div className="content-card text-slate-300">
              No event proposals yet. Start by submitting your first poster and event brief.
            </div>
          ) : (
            submissions.map((submission) => {
              const statusInfo = statusMeta[submission.status] || {
                label: submission.status,
                className: "border-white/10 bg-white/5 text-slate-200",
              };

              return (
                <div key={submission.id} className="content-card">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl text-white">{submission.title}</h2>
                        <span className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.16em] ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="mt-3 leading-7 text-slate-300">{submission.description}</p>
                      <div className="mt-4 space-y-1 text-sm text-slate-400">
                        <p>Event Date: {new Date(submission.date).toLocaleString()}</p>
                        {submission.location && <p>Location: {submission.location}</p>}
                        {submission.posterURL && (
                          <a
                            href={submission.posterURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent"
                          >
                            View Poster
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="min-w-[220px] rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                      <p className="font-semibold text-white">Approval Progress</p>
                      <p className="mt-3">1. Volunteer submission</p>
                      <p className={submission.status !== "pending_coordinator" ? "text-cyan-100" : ""}>
                        2. Coordinator review
                      </p>
                      <p className={["pending_faculty", "approved", "rejected"].includes(submission.status) ? "text-cyan-100" : ""}>
                        3. Faculty approval
                      </p>
                      <p className={submission.status === "approved" ? "text-green-100" : ""}>
                        4. Final publishing
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
