"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const categories = ["consumable", "non-consumable", "semi-consumable"];

const emptyForm = {
  name: "",
  category: "consumable",
  totalQuantity: "",
  inUse: "0",
  consumed: "0",
};

export default function InventoryForm({ itemId }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(Boolean(itemId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const remaining = useMemo(() => {
    const totalQuantity = Number(form.totalQuantity) || 0;
    const inUse = Number(form.inUse) || 0;
    const consumed = Number(form.consumed) || 0;
    return totalQuantity - (consumed + inUse);
  }, [form.consumed, form.inUse, form.totalQuantity]);

  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      try {
        const snapshot = await getDoc(doc(db, "inventory", itemId));
        if (!snapshot.exists()) {
          setError("Inventory item not found.");
          return;
        }

        const data = snapshot.data();
        setForm({
          name: data.name || "",
          category: data.category || "consumable",
          totalQuantity: String(data.totalQuantity ?? ""),
          inUse: String(data.inUse ?? 0),
          consumed: String(data.consumed ?? 0),
        });
      } catch (err) {
        console.error("Error loading inventory item:", err);
        setError("Failed to load inventory item.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const readQuantities = () => {
    const totalQuantity = Number(form.totalQuantity);
    const inUse = Number(form.inUse);
    const consumed = Number(form.consumed);

    if (![totalQuantity, inUse, consumed].every(Number.isFinite)) {
      throw new Error("Quantities must be valid numbers.");
    }

    if ([totalQuantity, inUse, consumed].some((value) => value < 0)) {
      throw new Error("Quantities cannot be negative.");
    }

    if (consumed + inUse > totalQuantity) {
      throw new Error("Consumed plus in-use quantity cannot exceed total quantity.");
    }

    return {
      totalQuantity,
      inUse,
      consumed,
      remaining: totalQuantity - (consumed + inUse),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const quantities = readQuantities();
      const payload = {
        name: form.name.trim(),
        category: form.category,
        ...quantities,
        updatedAt: serverTimestamp(),
      };

      if (!payload.name) {
        throw new Error("Item name is required.");
      }

      if (itemId) {
        await updateDoc(doc(db, "inventory", itemId), payload);
      } else {
        await addDoc(collection(db, "inventory"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      router.push("/admin/inventory");
    } catch (err) {
      console.error("Error saving inventory item:", err);
      setError(err.message || "Failed to save inventory item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="content-card text-slate-300">Loading inventory item...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="content-card mx-auto max-w-3xl space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
          Item Name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={updateField}
          className="field"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
          Category
        </label>
        <select name="category" value={form.category} onChange={updateField} className="field">
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <QuantityField
          label="Total"
          name="totalQuantity"
          value={form.totalQuantity}
          onChange={updateField}
        />
        <QuantityField label="In Use" name="inUse" value={form.inUse} onChange={updateField} />
        <QuantityField
          label="Consumed"
          name="consumed"
          value={form.consumed}
          onChange={updateField}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
        <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Remaining</p>
        <p className={remaining < 0 ? "mt-1 text-3xl text-red-200" : "mt-1 text-3xl text-white"}>
          {remaining}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="btn-admin disabled:opacity-60">
          {saving ? "Saving..." : itemId ? "Update Item" : "Add Item"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/inventory")}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function QuantityField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
        {label}
      </label>
      <input
        type="number"
        name={name}
        min="0"
        step="1"
        value={value}
        onChange={onChange}
        className="field"
        required
      />
    </div>
  );
}
