"use client";

export default function LowStockTable({ items }) {
  return (
    <div className="content-card overflow-hidden p-0">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="eyebrow">Low Stock Alert</p>
        <h2 className="mt-2 text-2xl text-white">Items below 5 remaining</h2>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-8 text-slate-300">No low stock items.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Remaining</th>
                <th className="px-5 py-4">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              {items.map((item) => (
                <tr key={item.id} className="bg-slate-950/20">
                  <td className="px-5 py-4 font-semibold text-white">{item.name}</td>
                  <td className="px-5 py-4 text-red-100">{item.remaining ?? 0}</td>
                  <td className="px-5 py-4 capitalize">{item.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
