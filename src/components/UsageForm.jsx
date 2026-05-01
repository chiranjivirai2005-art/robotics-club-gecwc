"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UsageForm({
  items,
  selectedItemId = "",
  sessionId = "",
  attendeeOptions = [],
  title = "Record usage",
  eyebrow = "Issue Item",
  submitLabel = "Issue Item",
  onIssued,
}) {
  const [form, setForm] = useState({
    itemId: selectedItemId,
    quantity: "1",
    takenBy: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedItemId) {
      setForm((current) => ({ ...current, itemId: selectedItemId }));
    }
  }, [selectedItemId]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === form.itemId),
    [form.itemId, items]
  );

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const quantity = Number(form.quantity);
      if (!form.itemId) throw new Error("Select an inventory item.");
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }
      if (!form.takenBy.trim()) throw new Error("Taken by is required.");
      if (!form.location.trim()) throw new Error("Location is required.");

      await runTransaction(db, async (transaction) => {
        const itemRef = doc(db, "inventory", form.itemId);
        const itemSnap = await transaction.get(itemRef);

        if (!itemSnap.exists()) {
          throw new Error("Selected inventory item no longer exists.");
        }

        const item = itemSnap.data();
        const totalQuantity = Number(item.totalQuantity) || 0;
        const currentInUse = Number(item.inUse) || 0;
        const consumed = Number(item.consumed) || 0;
        const nextInUse = currentInUse + quantity;
        const nextRemaining = totalQuantity - (consumed + nextInUse);

        if (consumed + nextInUse > totalQuantity || nextRemaining < 0) {
          throw new Error("Not enough remaining quantity to issue this item.");
        }

        const usageRef = doc(collection(db, "inventoryUsage"));
        const usagePayload = {
          itemId: form.itemId,
          itemName: item.name || selectedItem?.name || "Inventory item",
          quantity,
          takenBy: form.takenBy.trim(),
          location: form.location.trim(),
          status: "in-use",
          issuedAt: serverTimestamp(),
          returnedAt: null,
        };

        if (sessionId) {
          usagePayload.sessionId = sessionId;
        }

        transaction.set(usageRef, usagePayload);

        transaction.update(itemRef, {
          inUse: nextInUse,
          remaining: nextRemaining,
          updatedAt: serverTimestamp(),
        });
      });

      setForm({
        itemId: selectedItemId || "",
        quantity: "1",
        takenBy: "",
        location: "",
      });
      onIssued?.();
    } catch (err) {
      console.error("Error issuing inventory item:", err);
      setError(err.message || "Failed to issue item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="content-card space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-2 text-2xl text-white">{title}</h2>
        </div>
        {selectedItem && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right text-sm text-slate-300">
            <p>Remaining</p>
            <p className="text-2xl text-white">{selectedItem.remaining}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
            Item
          </label>
          <select name="itemId" value={form.itemId} onChange={updateField} className="field" required>
            <option value="">Select item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.remaining} remaining)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            min="1"
            step="1"
            value={form.quantity}
            onChange={updateField}
            className="field"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
            Taken By
          </label>
          <input
            type="text"
            name="takenBy"
            list={attendeeOptions.length > 0 ? "attendee-options" : undefined}
            value={form.takenBy}
            onChange={updateField}
            className="field"
            required
          />
          {attendeeOptions.length > 0 && (
            <datalist id="attendee-options">
              {attendeeOptions.map((attendee) => (
                <option key={attendee.id || attendee.email || attendee.name} value={attendee.name || attendee.email} />
              ))}
            </datalist>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={updateField}
            className="field"
            required
          />
        </div>
      </div>

      <button type="submit" disabled={saving || items.length === 0} className="btn-admin disabled:opacity-60">
        {saving ? "Issuing..." : submitLabel}
      </button>
    </form>
  );
}
