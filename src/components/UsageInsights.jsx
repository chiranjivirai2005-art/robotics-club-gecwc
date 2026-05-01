"use client";

const formatDate = (value) => {
  if (!value) return "Not available";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  return "Not available";
};

export default function UsageInsights({ categoryCounts, mostUsedItems, recentActivity }) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="content-card">
        <p className="eyebrow">Categories</p>
        <h2 className="mt-2 text-2xl text-white">Distribution</h2>
        <div className="mt-6 space-y-4">
          {categoryCounts.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <span className="capitalize text-slate-200">{item.category}</span>
              <span className="text-2xl font-semibold text-white">{item.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-card">
        <p className="eyebrow">Usage</p>
        <h2 className="mt-2 text-2xl text-white">Most used items</h2>
        <div className="mt-6 space-y-3">
          {mostUsedItems.length === 0 ? (
            <p className="text-slate-300">No usage records yet.</p>
          ) : (
            mostUsedItems.map((item, index) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Rank {index + 1}
                  </p>
                  <p className="mt-1 font-semibold text-white">{item.itemName}</p>
                </div>
                <span className="text-2xl font-semibold text-accent">{item.count}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="content-card">
        <p className="eyebrow">Recent Activity</p>
        <h2 className="mt-2 text-2xl text-white">Latest issues</h2>
        <div className="mt-6 space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-slate-300">No recent activity.</p>
          ) : (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{activity.itemName}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {activity.takenBy} · {activity.location}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Qty {activity.quantity}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{formatDate(activity.issuedAt)}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
