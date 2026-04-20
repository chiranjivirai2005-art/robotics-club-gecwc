"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquareText,
  PlusCircle,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    events: 0,
    team: 0,
    gallery: 0,
    achievements: 0,
    pendingUsers: 0,
    openFeedback: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          eventsSnap,
          teamSnap,
          gallerySnap,
          achievementsSnap,
          usersSnap,
          feedbackSnap,
        ] = await Promise.all([
          getCountFromServer(collection(db, "events")),
          getCountFromServer(collection(db, "teamMembers")),
          getCountFromServer(collection(db, "gallery")),
          getCountFromServer(collection(db, "achievements")),
          getCountFromServer(query(collection(db, "users"), where("status", "==", "pending"))),
          getCountFromServer(query(collection(db, "feedback"), where("resolved", "==", false))),
        ]);

        setStats({
          events: eventsSnap.data().count,
          team: teamSnap.data().count,
          gallery: gallerySnap.data().count,
          achievements: achievementsSnap.data().count,
          pendingUsers: usersSnap.data().count,
          openFeedback: feedbackSnap.data().count,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  const dashboardLinks = [
    { title: "Manage Events", description: "View and delete events", href: "/admin/events", icon: CalendarDays },
    { title: "Add Event", description: "Create a new event", href: "/admin/events/create", icon: PlusCircle },
    { title: "Manage Team", description: "View and delete team members", href: "/admin/team", icon: Users },
    { title: "Add Team Member", description: "Add a new member", href: "/admin/team/create", icon: PlusCircle },
    { title: "Manage Gallery", description: "Upload and delete gallery images", href: "/admin/gallery", icon: ImageIcon },
    { title: "Add Gallery Image", description: "Upload a new gallery image", href: "/admin/gallery/create", icon: PlusCircle },
    { title: "Manage Achievements", description: "View and delete achievements", href: "/admin/achievements", icon: Trophy },
    { title: "Add Achievement", description: "Create a new achievement", href: "/admin/achievements/create", icon: PlusCircle },
    { title: "User Approvals", description: "Approve or reject pending registrations", href: "/admin/users", icon: UserCheck, dot: stats.pendingUsers },
    { title: "Feedback Inbox", description: "Review feedback sent by users", href: "/admin/feedback", icon: MessageSquareText, dot: stats.openFeedback },
  ];

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-accent">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <p className="eyebrow">Admin</p>
              <h1 className="text-4xl text-white">Club control center</h1>
            </div>
          </div>
        </section>

        <div className="mb-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard title="Events" value={stats.events} />
          <StatCard title="Team Members" value={stats.team} />
          <StatCard title="Gallery" value={stats.gallery} />
          <StatCard title="Achievements" value={stats.achievements} />
          <StatCard title="Pending Users" value={stats.pendingUsers} />
          <StatCard title="Open Feedback" value={stats.openFeedback} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {dashboardLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="content-card transition hover:-translate-y-1">
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-accent">
                    <Icon size={24} />
                  </div>
                  {!!item.dot && <span className="h-3 w-3 rounded-full bg-red-400" />}
                </div>
                <h2 className="text-2xl text-white">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-300">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="content-card text-center">
      <p className="text-4xl text-white">{value}</p>
      <p className="mt-3 text-sm uppercase tracking-[0.18em] text-slate-400">{title}</p>
    </div>
  );
}
