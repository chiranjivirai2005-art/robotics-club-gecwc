"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { ArrowRight, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

const roleCopy = {
  admin: "You have access to club management tools and approvals.",
  faculty: "You can review coordinator-approved event submissions.",
  coordinator: "You can manage member-facing workflows and event reviews.",
  volunteer: "You can submit event proposals, posters, and track their approval progress.",
  member: "You can participate, submit activities, and stay connected.",
  pending: "Your account is awaiting approval before full access is granted.",
};

export default function Dashboard() {
  const { role, user } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  const roleLinks = {
    volunteer: [
      { href: "/volunteer", label: "Open volunteer panel" },
      { href: "/events/submit", label: "Submit an event proposal" },
    ],
    coordinator: [
      { href: "/coordinator", label: "Open coordinator panel" },
      { href: "/events/review", label: "Review pending proposals" },
      { href: "/admin/attendance", label: "Generate attendance QR" },
      { href: "/admin/inventory", label: "Manage inventory" },
    ],
    faculty: [
      { href: "/events/faculty-review", label: "Open faculty review panel" },
      { href: "/admin/attendance", label: "Generate attendance QR" },
      { href: "/admin/inventory", label: "Manage inventory" },
    ],
    admin: [
      { href: "/admin", label: "Open admin panel" },
    ],
    member: [{ href: "/work/new", label: "Upload your work" }],
  };

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h1 className="section-title max-w-3xl">
                Welcome back{user?.email ? `, ${user.email}` : ""}.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                {roleCopy[role] ||
                  "Your account is active. Explore the tools available to your role."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-red-200 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={18} />
              {loggingOut ? "Logging Out" : "Log Out"}
            </button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="content-card">
            <div className="mb-5 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-accent">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-2xl text-white">Current Role</h2>
            <p className="mt-4 text-sm uppercase tracking-[0.18em] text-accent">
              {role || "Unknown"}
            </p>
            {role === "pending" && (
              <p className="mt-4 leading-7 text-yellow-200">
                Your account is awaiting admin approval. Once approved, the
                relevant panels will become useful.
              </p>
            )}
          </div>

          <div className="content-card">
            <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200">
              <UserCircle2 size={24} />
            </div>
            <h2 className="text-2xl text-white">Next Actions</h2>
            <div className="mt-6 grid gap-3">
              {(roleLinks[role] || []).map((item) => (
                <Link key={item.href} href={item.href} className="premium-link-card">
                  <span>{item.label}</span>
                  <ArrowRight size={18} />
                </Link>
              ))}
              <Link href="/events" className="premium-link-card">
                <span>Browse club events</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/work" className="premium-link-card">
                <span>View student work feed</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/team" className="premium-link-card">
                <span>Meet the team</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
