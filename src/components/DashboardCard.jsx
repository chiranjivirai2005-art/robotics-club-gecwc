"use client";

export default function DashboardCard({ title, value, helper, icon: Icon }) {
  return (
    <div className="content-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-4xl font-bold text-white">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-accent">
            <Icon size={24} />
          </div>
        )}
      </div>
      {helper && <p className="mt-4 text-sm leading-6 text-slate-300">{helper}</p>}
    </div>
  );
}
