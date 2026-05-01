"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

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

const isSessionActive = (session) => {
  const expiresAt = toDate(session?.expiresAt);
  return expiresAt ? expiresAt.getTime() >= Date.now() : true;
};

export default function AttendanceMarkPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);

    try {
      const snapshot = await getDoc(doc(db, "attendanceSessions", sessionId));
      if (!snapshot.exists()) {
        setStatus("Attendance session not found.");
        return;
      }
      setSession({ id: snapshot.id, ...snapshot.data() });
    } catch (error) {
      console.error("Error loading attendance session:", error);
      setStatus("Failed to load attendance session.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }

    if (!authLoading && user) {
      loadSession();
    }
  }, [authLoading, loadSession, router, user]);

  const markAttendance = async () => {
    if (!user || !session) return;
    setSaving(true);
    setStatus("");

    try {
      if (!isSessionActive(session)) {
        setStatus("This attendance QR has closed.");
        return;
      }

      const recordRef = doc(db, "attendanceRecords", `${sessionId}_${user.uid}`);
      const existingRecord = await getDoc(recordRef);

      if (existingRecord.exists()) {
        setStatus("Attendance is already marked for this session.");
        return;
      }

      await setDoc(recordRef, {
        sessionId,
        userId: user.uid,
        name: user.displayName || user.email || "Student",
        email: user.email || "",
        date: session.date || new Date().toISOString(),
        timestamp: serverTimestamp(),
      });
      setStatus("Attendance marked successfully.");
    } catch (error) {
      console.error("Error marking attendance:", error);
      setStatus("Failed to mark attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <p className="eyebrow">Attendance</p>
          <h1 className="section-title max-w-3xl">
            {session?.eventName || "Mark attendance"}
          </h1>
          {session && (
            <div className="space-y-1 text-slate-300">
              <p>{formatDate(session.date)}</p>
              <p className="text-sm">QR closes at {formatDate(session.expiresAt)}</p>
            </div>
          )}
        </section>

        <div className="content-card mx-auto max-w-xl text-center">
          {authLoading || loading ? (
            <p className="text-slate-300">Loading attendance session...</p>
          ) : session ? (
            <>
              <p className="text-slate-300">
                Signed in as <span className="text-white">{user?.email}</span>
              </p>
              {!isSessionActive(session) && (
                <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  This attendance QR is closed. Ask a faculty admin or coordinator to start a new session.
                </p>
              )}
              <button
                type="button"
                onClick={markAttendance}
                disabled={saving || !isSessionActive(session)}
                className="btn-admin mt-6 disabled:opacity-60"
              >
                {saving ? "Marking..." : "Mark Attendance"}
              </button>
            </>
          ) : (
            <Link href="/" className="btn-secondary">
              Go Home
            </Link>
          )}

          {status && <p className="mt-5 text-slate-200">{status}</p>}
        </div>
      </div>
    </div>
  );
}
