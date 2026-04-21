"use client";

import { useState } from "react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const formatDate = (value) => {
  if (!value) return "Not returned";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  return "Not available";
};

export default function UsageTable({ records, onReturned }) {
  const [returningId, setReturningId] = useState("");

  const returnItem = async (usageId) => {
    setReturningId(usageId);

    try {
      await runTransaction(db, async (transaction) => {
        const usageRef = doc(db, "inventoryUsage", usageId);
        const usageSnap = await transaction.get(usageRef);

        if (!usageSnap.exists()) {
          throw new Error("Usage record not found.");
        }

        const usage = usageSnap.data();
        if (usage.status === "returned") {
          throw new Error("This item is already returned.");
        }

        const quantity = Number(usage.quantity) || 0;
        const itemRef = doc(db, "inventory", usage.itemId);
        const itemSnap = await transaction.get(itemRef);

        if (!itemSnap.exists()) {
          throw new Error("Linked inventory item not found.");
        }

        const item = itemSnap.data();
        const currentInUse = Number(item.inUse) || 0;
        const consumed = Number(item.consumed) || 0;
        const totalQuantity = Number(item.totalQuantity) || 0;
        const nextInUse = currentInUse - quantity;
        const nextRemaining = totalQuantity - (consumed + nextInUse);

        if (nextInUse < 0 || consumed + nextInUse > totalQuantity) {
          throw new Error("Inventory counts are inconsistent for this return.");
        }

        transaction.update(usageRef, {
          status: "returned",
          returnedAt: serverTimestamp(),
        });

        transaction.update(itemRef, {
          inUse: nextInUse,
          remaining: nextRemaining,
          updatedAt: serverTimestamp(),
        });
      });

      onReturned?.();
    } catch (error) {
      console.error("Error returning inventory item:", error);
      alert(error.message || "Failed to return item.");
    } finally {
      setReturningId("");
    }
  };

  if (records.length === 0) {
    return <div className="content-card text-center text-slate-300">No usage records found.</div>;
  }

  return (
    <div className="content-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Item</th>
              <th className="px-5 py-4">Quantity</th>
              <th className="px-5 py-4">Taken By</th>
              <th className="px-5 py-4">Location</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Issued At</th>
              <th className="px-5 py-4">Returned At</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {records.map((record) => (
              <tr key={record.id} className="bg-slate-950/20">
                <td className="px-5 py-4 font-semibold text-white">{record.itemName}</td>
                <td className="px-5 py-4">{record.quantity}</td>
                <td className="px-5 py-4">{record.takenBy}</td>
                <td className="px-5 py-4">{record.location}</td>
                <td className="px-5 py-4">
                  <span
                    className={
                      record.status === "returned"
                        ? "rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-emerald-100"
                        : "rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-amber-100"
                    }
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-5 py-4">{formatDate(record.issuedAt)}</td>
                <td className="px-5 py-4">{formatDate(record.returnedAt)}</td>
                <td className="px-5 py-4 text-right">
                  {record.status === "in-use" ? (
                    <button
                      type="button"
                      onClick={() => returnItem(record.id)}
                      disabled={returningId === record.id}
                      className="btn-admin disabled:opacity-60"
                    >
                      {returningId === record.id ? "Returning..." : "Return"}
                    </button>
                  ) : (
                    <span className="text-slate-500">Complete</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
