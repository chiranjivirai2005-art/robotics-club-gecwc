"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import UsageForm from "@/components/UsageForm";
import UsageTable from "@/components/UsageTable";
import { db } from "@/lib/firebase";

export default function InventoryUsagePage() {
  return (
    <Suspense fallback={<div className="page-shell text-center text-slate-300">Loading usage...</div>}>
      <InventoryUsageContent />
    </Suspense>
  );
}

function InventoryUsageContent() {
  const searchParams = useSearchParams();
  const selectedItemId = searchParams.get("itemId") || "";
  const [items, setItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInventoryAndUsage = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [itemsSnapshot, usageSnapshot] = await Promise.all([
        getDocs(query(collection(db, "inventory"), orderBy("name", "asc"))),
        getDocs(query(collection(db, "inventoryUsage"), orderBy("issuedAt", "desc"))),
      ]);

      setItems(itemsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      setRecords(usageSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    } catch (err) {
      console.error("Error fetching inventory usage:", err);
      setError("Failed to load inventory usage.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryAndUsage();
  }, [fetchInventoryAndUsage]);

  return (
    <ProtectedRoute
      allowedRoles={["admin", "coordinator", "faculty"]}
      redirectTo="/"
      unauthenticatedRedirectTo="/"
    >
      <div className="page-shell">
        <div className="page-wrap">
          <section className="page-hero">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Inventory Usage</p>
                <h1 className="section-title">Issue and return items</h1>
              </div>
              <Link href="/admin/inventory" className="btn-secondary">
                Back to Inventory
              </Link>
            </div>
          </section>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="space-y-8">
            <UsageForm
              items={items}
              selectedItemId={selectedItemId}
              onIssued={fetchInventoryAndUsage}
            />

            {loading ? (
              <div className="content-card text-center text-slate-300">Loading usage records...</div>
            ) : (
              <UsageTable records={records} onReturned={fetchInventoryAndUsage} />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
