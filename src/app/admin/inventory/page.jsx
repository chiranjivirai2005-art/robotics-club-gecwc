"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, ChartBar, ClipboardList, PlusCircle } from "lucide-react";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import ExportButton from "@/components/ExportButton";
import InventoryTable from "@/components/InventoryTable";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/lib/firebase";

const allowedRoles = ["admin", "coordinator", "faculty"];

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const snapshot = await getDocs(query(collection(db, "inventory"), orderBy("createdAt", "desc")));
      setItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to load inventory items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const deleteItem = async (itemId) => {
    const shouldDelete = confirm("Delete this inventory item?");
    if (!shouldDelete) return;

    setDeletingId(itemId);
    try {
      await deleteDoc(doc(db, "inventory", itemId));
      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      alert("Failed to delete inventory item.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      redirectTo="/"
      unauthenticatedRedirectTo="/"
    >
      <div className="page-shell">
        <div className="page-wrap">
          <section className="page-hero">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-accent">
                  <Boxes size={28} />
                </div>
                <p className="eyebrow">Inventory</p>
                <h1 className="section-title">Manage lab stock</h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/inventory/dashboard" className="btn-admin">
                  <ChartBar size={16} />
                  Dashboard
                </Link>
                <Link href="/admin/inventory/usage" className="btn-admin">
                  <ClipboardList size={16} />
                  Usage
                </Link>
                <Link href="/admin/inventory/new" className="btn-admin">
                  <PlusCircle size={16} />
                  Add Item
                </Link>
                <ExportButton />
              </div>
            </div>
          </section>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="content-card text-center text-slate-300">Loading inventory...</div>
          ) : (
            <InventoryTable items={items} onDelete={deleteItem} deletingId={deletingId} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
