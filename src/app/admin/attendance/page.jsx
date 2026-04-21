"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, QrCode } from "lucide-react";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import DashboardCard from "@/components/DashboardCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/lib/firebase";

const allowedRoles = ["admin", "coordinator", "faculty"];

const formatDate = (value) => {
  if (!value) return "Not available";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  return new Date(value).toLocaleString();
};

export default function AdminAttendancePage() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ eventName: "", date: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(
        query(collection(db, "attendanceSessions"), orderBy("createdAt", "desc"))
      );
      setSessions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    } catch (err) {
      console.error("Error fetching attendance sessions:", err);
      setError("Failed to load attendance sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const latestSession = sessions[0];
  const latestQrUrl = useMemo(() => {
    if (!origin || !latestSession) return "";
    const attendanceUrl = `${origin}/attendance/${latestSession.id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(attendanceUrl)}`;
  }, [latestSession, origin]);

  const createSession = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.eventName.trim()) throw new Error("Event name is required.");

      await addDoc(collection(db, "attendanceSessions"), {
        eventName: form.eventName.trim(),
        date: form.date || new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      setForm({ eventName: "", date: "" });
      fetchSessions();
    } catch (err) {
      console.error("Error creating attendance session:", err);
      setError(err.message || "Failed to create attendance session.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={allowedRoles} redirectTo="/" unauthenticatedRedirectTo="/">
      <div className="page-shell">
        <div className="page-wrap">
          <section className="page-hero">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-accent">
                  <QrCode size={28} />
                </div>
                <p className="eyebrow">Attendance</p>
                <h1 className="section-title">Generate QR attendance sessions</h1>
              </div>
              <Link href="/admin/inventory" className="btn-secondary">
                Inventory
              </Link>
            </div>
          </section>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <form onSubmit={createSession} className="content-card space-y-5">
              <div>
                <p className="eyebrow">New Session</p>
                <h2 className="mt-2 text-2xl text-white">Create attendance QR</h2>
              </div>
              <input
                type="text"
                value={form.eventName}
                onChange={(event) => setForm((current) => ({ ...current, eventName: event.target.value }))}
                placeholder="Event or session name"
                className="field"
                required
              />
              <input
                type="datetime-local"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="field"
              />
              <button type="submit" disabled={saving} className="btn-admin disabled:opacity-60">
                {saving ? "Creating..." : "Generate QR"}
              </button>
            </form>

            <DashboardCard
              title="Sessions"
              value={sessions.length}
              helper="Attendance sessions created"
              icon={CalendarDays}
            />
          </div>

          {latestQrUrl && (
            <section className="content-card mb-8">
              <p className="eyebrow">Latest QR</p>
              <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-center">
                <div className="rounded-2xl bg-white p-4">
                  <Image src={latestQrUrl} alt="Attendance QR code" width={220} height={220} unoptimized />
                </div>
                <div>
                  <h2 className="text-2xl text-white">{latestSession.eventName}</h2>
                  <p className="mt-2 text-slate-300">{formatDate(latestSession.date)}</p>
                  <Link href={`/admin/attendance/${latestSession.id}/usage`} className="btn-admin mt-5">
                    Session Usage
                  </Link>
                </div>
              </div>
            </section>
          )}

          {loading ? (
            <div className="content-card text-center text-slate-300">Loading sessions...</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sessions.map((session) => {
                const attendanceUrl = `${origin}/attendance/${session.id}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(attendanceUrl)}`;

                return (
                  <div key={session.id} className="content-card">
                    <div className="flex gap-4">
                      <div className="rounded-2xl bg-white p-3">
                        <Image src={qrUrl} alt={`${session.eventName} QR code`} width={120} height={120} unoptimized />
                      </div>
                      <div>
                        <h2 className="text-xl text-white">{session.eventName}</h2>
                        <p className="mt-2 text-sm text-slate-300">{formatDate(session.date)}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link href={`/attendance/${session.id}`} className="btn-admin">
                            Mark Link
                          </Link>
                          <Link href={`/admin/attendance/${session.id}/usage`} className="btn-admin">
                            Usage
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
