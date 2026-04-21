"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Work", href: "/work" },
  { name: "Calendar", href: "/calendar" },
  { name: "Gallery", href: "/gallery" },
  { name: "Achievements", href: "/achievements" },
  { name: "Team", href: "/team" },
];

function LinkBadge({ count }) {
  if (!count) return null;

  return <span className="ml-2 h-2.5 w-2.5 rounded-full bg-red-400" />;
}

function NavLink({ href, label, pathname }) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-accent text-slate-950"
          : "text-slate-200 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, loading } = useAuth();
  const [alerts, setAlerts] = useState({
    coordinator: 0,
    faculty: 0,
    adminUsers: 0,
    adminFeedback: 0,
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const tasks = [];

        if (role === "coordinator" || role === "admin") {
          tasks.push(
            getCountFromServer(
              query(
                collection(db, "event_submissions"),
                where("status", "==", "pending_coordinator")
              )
            ).then((snap) => ({ key: "coordinator", value: snap.data().count }))
          );
        }

        if (role === "faculty" || role === "admin") {
          tasks.push(
            getCountFromServer(
              query(
                collection(db, "event_submissions"),
                where("status", "==", "pending_faculty")
              )
            ).then((snap) => ({ key: "faculty", value: snap.data().count }))
          );
        }

        if (role === "admin") {
          tasks.push(
            getCountFromServer(
              query(collection(db, "users"), where("status", "==", "pending"))
            ).then((snap) => ({ key: "adminUsers", value: snap.data().count }))
          );
          tasks.push(
            getCountFromServer(
              query(collection(db, "feedback"), where("resolved", "==", false))
            ).then((snap) => ({ key: "adminFeedback", value: snap.data().count }))
          );
        }

        const results = await Promise.all(tasks);
        setAlerts((prev) => {
          const next = { ...prev };
          results.forEach((item) => {
            next[item.key] = item.value;
          });
          return next;
        });
      } catch (error) {
        console.error("Failed to load navbar alerts:", error);
      }
    };

    if (!loading && user) {
      fetchAlerts();
    }
  }, [loading, role, user]);

  const authLinks = useMemo(() => {
    const links = [];

    if (!loading && !user) {
      links.push(
        { name: "Login", href: "/login", variant: "secondary" },
        { name: "Register", href: "/register", variant: "primary" }
      );
    }

    if (!loading && user) {
      links.push({ name: "Dashboard", href: "/dashboard", variant: "secondary" });

      if (role === "volunteer") {
        links.push({ name: "Volunteer Panel", href: "/volunteer", variant: "secondary" });
      }

      if (role === "coordinator") {
        links.push({ name: "Inventory", href: "/admin/inventory", variant: "secondary" });
        links.push({ name: "Attendance", href: "/admin/attendance", variant: "secondary" });
        links.push({
          name: "Coordinator Panel",
          href: "/coordinator",
          variant: "secondary",
          dot: alerts.coordinator,
        });
      }

      if (role === "faculty") {
        links.push({ name: "Inventory", href: "/admin/inventory", variant: "secondary" });
        links.push({ name: "Attendance", href: "/admin/attendance", variant: "secondary" });
        links.push({
          name: "Faculty Review",
          href: "/events/faculty-review",
          variant: "secondary",
          dot: alerts.faculty,
        });
      }

      if (role === "admin") {
        links.push({
          name: "Admin Panel",
          href: "/admin",
          variant: "primary",
          dot: alerts.adminUsers + alerts.adminFeedback,
        });
      }
    }

    return links;
  }, [alerts.adminFeedback, alerts.adminUsers, alerts.coordinator, alerts.faculty, loading, role, user]);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/club-logo.png"
              alt="Robotics Club Logo"
              width={44}
              height={44}
              className="rounded-xl border border-white/10 bg-slate-900/80 p-1"
              priority
            />
            <div>
              <span className="block text-base font-semibold uppercase tracking-[0.24em] text-accent">
                Robotics Club
              </span>
              <span className="block text-xs uppercase tracking-[0.22em] text-slate-400">
                GEC West Champaran
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  href={item.href}
                  label={item.name}
                  pathname={pathname}
                />
              ))}
            </div>

            {authLinks.length > 0 && (
              <div className="flex items-center gap-2">
                {authLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={
                      item.variant === "primary"
                        ? "inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_16px_40px_rgba(34,211,238,0.25)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
                        : "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-accent/60 hover:bg-white/10"
                    }
                  >
                    {item.name}
                    <LinkBadge count={item.dot} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm ${
                  isActive
                    ? "border-accent bg-accent text-slate-950"
                    : "border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {!loading &&
            authLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`inline-flex items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm ${
                  item.variant === "primary"
                    ? "border-accent bg-accent text-slate-950"
                    : "border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                {item.name}
                <LinkBadge count={item.dot} />
              </Link>
            ))}
        </div>
      </div>
    </nav>
  );
}
