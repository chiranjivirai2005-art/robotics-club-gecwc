"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, QrCode } from "lucide-react";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import * as XLSX from "xlsx";
import DashboardCard from "@/components/DashboardCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

const allowedRoles = ["admin", "coordinator", "faculty"];
const SESSION_DURATION_HOURS = 8;

const formatDate = (value) => {
  if (!value) return "Not available";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  return new Date(value).toLocaleString();
};

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toInputDate = (date) => {
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const getDefaultForm = () => ({
  eventName: "",
  date: toInputDate(new Date()),
});

const isSessionActive = (session) => {
  const expiresAt = toDate(session?.expiresAt);
  return expiresAt ? expiresAt.getTime() >= Date.now() : true;
};

const getPeriodRange = (period) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "week") {
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);
  } else {
    start.setDate(1);
  }

  const end = new Date(start);
  if (period === "week") {
    end.setDate(end.getDate() + 7);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  return { start, end };
};

export default function AdminAttendancePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(getDefaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState("");
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
      const startsAt = form.date ? new Date(form.date) : new Date();
      if (Number.isNaN(startsAt.getTime())) throw new Error("Session date is invalid.");
      const expiresAt = new Date(startsAt.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

      await addDoc(collection(db, "attendanceSessions"), {
        eventName: form.eventName.trim(),
        date: startsAt.toISOString(),
        expiresAt: Timestamp.fromDate(expiresAt),
        durationHours: SESSION_DURATION_HOURS,
        createdBy: user?.uid || "",
        createdByEmail: user?.email || "",
        createdAt: serverTimestamp(),
      });

      setForm(getDefaultForm());
      fetchSessions();
    } catch (err) {
      console.error("Error creating attendance session:", err);
      setError(err.message || "Failed to create attendance session.");
    } finally {
      setSaving(false);
    }
  };

  const exportAttendance = async (period) => {
    setExporting(period);
    setError("");

    try {
      const { start, end } = getPeriodRange(period);
      const [sessionsSnap, recordsSnap] = await Promise.all([
        getDocs(query(collection(db, "attendanceSessions"), orderBy("createdAt", "desc"))),
        getDocs(
          query(
            collection(db, "attendanceRecords"),
            where("timestamp", ">=", Timestamp.fromDate(start)),
            where("timestamp", "<", Timestamp.fromDate(end)),
            orderBy("timestamp", "asc")
          )
        ),
      ]);

      const sessionsById = new Map(
        sessionsSnap.docs.map((item) => [item.id, { id: item.id, ...item.data() }])
      );
      const rows = recordsSnap.docs.map((item) => {
        const record = { id: item.id, ...item.data() };
        const session = sessionsById.get(record.sessionId);

        return {
          "Event Name": session?.eventName || "Unknown session",
          "Session Date": formatDate(session?.date || record.date),
          "Marked At": formatDate(record.timestamp),
          "Student Name": record.name || "",
          Email: record.email || "",
          "Session ID": record.sessionId || "",
          "Record ID": item.id,
        };
      });

      if (rows.length === 0) {
        setError(`No attendance records found for this ${period}.`);
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
      XLSX.writeFile(
        workbook,
        `attendance-${period}-${start.toISOString().slice(0, 10)}.xlsx`
      );
    } catch (err) {
      console.error("Error exporting attendance:", err);
      setError("Failed to export attendance.");
    } finally {
      setExporting("");
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
              <p className="text-sm text-slate-300">
                Each QR stays open for {SESSION_DURATION_HOURS} hours from the selected start time.
              </p>
              <button type="submit" disabled={saving} className="btn-admin disabled:opacity-60">
                {saving ? "Creating..." : "Generate QR"}
              </button>
            </form>

            <div className="space-y-6">
              <DashboardCard
                title="Sessions"
                value={sessions.length}
                helper="Attendance sessions created"
                icon={CalendarDays}
              />
              <section className="content-card">
                <p className="eyebrow">Excel Export</p>
                <h2 className="mt-2 text-2xl text-white">Download attendance</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Export records marked during the current week or current month.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => exportAttendance("week")}
                    disabled={Boolean(exporting)}
                    className="btn-admin disabled:opacity-60"
                  >
                    {exporting === "week" ? "Exporting..." : "This Week"}
                  </button>
                  <button
                    type="button"
                    onClick={() => exportAttendance("month")}
                    disabled={Boolean(exporting)}
                    className="btn-secondary disabled:opacity-60"
                  >
                    {exporting === "month" ? "Exporting..." : "This Month"}
                  </button>
                </div>
              </section>
            </div>
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
                  <p className="mt-1 text-sm text-slate-400">
                    Closes: {formatDate(latestSession.expiresAt)}
                  </p>
                  <p className={`mt-2 text-sm ${isSessionActive(latestSession) ? "text-cyan-100" : "text-red-100"}`}>
                    {isSessionActive(latestSession) ? "QR is active" : "QR is closed"}
                  </p>
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
                        <p className="mt-1 text-xs text-slate-400">Closes: {formatDate(session.expiresAt)}</p>
                        <p className={`mt-1 text-xs ${isSessionActive(session) ? "text-cyan-100" : "text-red-100"}`}>
                          {isSessionActive(session) ? "Active for marking" : "Closed"}
                        </p>
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
