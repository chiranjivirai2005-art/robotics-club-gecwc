"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, PackageCheck, Users } from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import DashboardCard from "@/components/DashboardCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import SessionUsageTable from "@/components/SessionUsageTable";
import UsageForm from "@/components/UsageForm";
import { db } from "@/lib/firebase";

const allowedRoles = ["admin", "coordinator", "faculty"];

const formatDate = (value) => {
  if (!value) return "Not available";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  return String(value);
};

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  return new Date(value).getTime() || 0;
};

export default function AttendanceSessionUsagePage() {
  const params = useParams();
  const sessionId = params.sessionId;
  const [session, setSession] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [usageRecords, setUsageRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessionUsageData = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    setError("");

    try {
      const sessionRef = doc(db, "attendanceSessions", sessionId);
      const [sessionSnap, attendanceSnap, inventorySnap, usageSnap] = await Promise.all([
        getDoc(sessionRef),
        getDocs(query(collection(db, "attendanceRecords"), where("sessionId", "==", sessionId))),
        getDocs(query(collection(db, "inventory"), orderBy("name", "asc"))),
        getDocs(query(collection(db, "inventoryUsage"), where("sessionId", "==", sessionId))),
      ]);

      if (!sessionSnap.exists()) {
        setSession(null);
        setError("Attendance session not found.");
        return;
      }

      const sessionUsage = usageSnap.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => toMillis(b.issuedAt) - toMillis(a.issuedAt));

      setSession({ id: sessionSnap.id, ...sessionSnap.data() });
      setAttendees(attendanceSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
      setInventory(inventorySnap.docs.map((item) => ({ id: item.id, ...item.data() })));
      setUsageRecords(sessionUsage);
    } catch (err) {
      console.error("Error loading attendance session usage:", err);
      setError("Failed to load attendance session usage.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionUsageData();
  }, [fetchSessionUsageData]);

  const analytics = useMemo(() => {
    const totalItemsUsed = usageRecords.reduce(
      (total, record) => total + (Number(record.quantity) || 0),
      0
    );
    const totalAttendees = attendees.length;

    return {
      totalAttendees,
      totalItemsUsed,
      itemsPerPerson:
        totalAttendees > 0 ? (totalItemsUsed / totalAttendees).toFixed(2) : "0.00",
    };
  }, [attendees.length, usageRecords]);

  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      redirectTo="/"
      unauthenticatedRedirectTo="/"
    >
      <div className="page-shell">
        <div className="page-wrap">
          <section className="page-hero">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-accent">
                  <PackageCheck size={28} />
                </div>
                <p className="eyebrow">Attendance Inventory</p>
                <h1 className="section-title">
                  {session?.eventName || "Session usage"}
                </h1>
                {session && (
                  <p className="text-slate-300">
                    Session Date: {formatDate(session.date)}
                  </p>
                )}
              </div>
              <Link href="/admin/inventory" className="btn-secondary">
                Back to Inventory
              </Link>
            </div>
          </section>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="content-card text-center text-slate-300">Loading session usage...</div>
          ) : session ? (
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                <DashboardCard
                  title="Total Attendees"
                  value={analytics.totalAttendees}
                  helper="People marked present"
                  icon={Users}
                />
                <DashboardCard
                  title="Total Items Used"
                  value={analytics.totalItemsUsed}
                  helper="Quantity issued for this session"
                  icon={PackageCheck}
                />
                <DashboardCard
                  title="Items Per Person"
                  value={analytics.itemsPerPerson}
                  helper="Usage divided by attendees"
                  icon={CalendarDays}
                />
              </div>

              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
                <UsageForm
                  items={inventory}
                  sessionId={sessionId}
                  attendeeOptions={attendees}
                  eyebrow="Session Inventory"
                  title="Link usage to this session"
                  submitLabel="Link Usage"
                  onIssued={fetchSessionUsageData}
                />

                <section className="content-card">
                  <p className="eyebrow">Attendees</p>
                  <h2 className="mt-2 text-2xl text-white">
                    Present members ({attendees.length})
                  </h2>
                  <div className="mt-6 max-h-[440px] space-y-3 overflow-y-auto pr-1">
                    {attendees.length === 0 ? (
                      <p className="text-slate-300">No attendance records for this session.</p>
                    ) : (
                      attendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                        >
                          <p className="font-semibold text-white">
                            {attendee.name || attendee.email || "Unnamed attendee"}
                          </p>
                          {attendee.email && (
                            <p className="mt-1 text-sm text-slate-400">{attendee.email}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              <SessionUsageTable records={usageRecords} />
            </div>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
