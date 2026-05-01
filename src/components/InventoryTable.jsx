"use client";

import Link from "next/link";

export default function InventoryTable({ items, onDelete, deletingId }) {
  if (items.length === 0) {
    return <div className="content-card text-center text-slate-300">No inventory items found.</div>;
  }

  return (
    <div className="content-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">In Use</th>
              <th className="px-5 py-4">Consumed</th>
              <th className="px-5 py-4">Remaining</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {items.map((item) => (
              <tr key={item.id} className="bg-slate-950/20">
                <td className="px-5 py-4 font-semibold text-white">{item.name}</td>
                <td className="px-5 py-4 capitalize">{item.category}</td>
                <td className="px-5 py-4">{item.totalQuantity}</td>
                <td className="px-5 py-4">{item.inUse}</td>
                <td className="px-5 py-4">{item.consumed}</td>
                <td className="px-5 py-4">{item.remaining}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link href={`/admin/inventory/edit/${item.id}`} className="btn-admin">
                      Edit
                    </Link>
                    <Link href={`/admin/inventory/usage?itemId=${item.id}`} className="btn-admin">
                      Issue Item
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-100 transition hover:bg-red-400/20 disabled:opacity-60"
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
