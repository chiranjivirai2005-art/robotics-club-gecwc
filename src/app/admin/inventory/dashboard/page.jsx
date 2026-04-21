"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, ChartBar, PackageCheck, PackageOpen } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import DashboardCard from "@/components/DashboardCard";
import LowStockTable from "@/components/LowStockTable";
import ProtectedRoute from "@/components/ProtectedRoute";
import UsageInsights from "@/components/UsageInsights";
import { db } from "@/lib/firebase";

const allowedRoles = ["admin", "coordinator", "faculty"];
const categories = ["consumable", "non-consumable", "semi-consumable"];

export default function InventoryDashboardPage() {
  const [inventory, setInventory] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const [inventorySnapshot, usageSnapshot] = await Promise.all([
          getDocs(query(collection(db, "inventory"), orderBy("name", "asc"))),
          getDocs(query(collection(db, "inventoryUsage"), orderBy("issuedAt", "desc"))),
        ]);

        setInventory(inventorySnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setUsage(usageSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (err) {
        console.error("Error fetching inventory dashboard data:", err);
        setError("Failed to load inventory analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const analytics = useMemo(() => {
    const totals = inventory.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + 1,
        totalQuantity: acc.totalQuantity + (Number(item.totalQuantity) || 0),
        totalInUse: acc.totalInUse + (Number(item.inUse) || 0),
        totalConsumed: acc.totalConsumed + (Number(item.consumed) || 0),
      }),
      {
        totalItems: 0,
        totalQuantity: 0,
        totalInUse: 0,
        totalConsumed: 0,
      }
    );

    const lowStockItems = inventory
      .filter((item) => (Number(item.remaining) || 0) < 5)
      .sort((a, b) => (Number(a.remaining) || 0) - (Number(b.remaining) || 0));

    const categoryCounts = categories.map((category) => ({
      category,
      count: inventory.reduce(
        (count, item) => count + (item.category === category ? 1 : 0),
        0
      ),
    }));

    const usageByItem = usage.reduce((acc, record) => {
      const itemId = record.itemId || "unknown";
      const current = acc[itemId] || {
        itemId,
        itemName: record.itemName || "Unknown item",
        count: 0,
      };

      return {
        ...acc,
        [itemId]: {
          ...current,
          itemName: record.itemName || current.itemName,
          count: current.count + 1,
        },
      };
    }, {});

    const mostUsedItems = Object.values(usageByItem)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      ...totals,
      lowStockItems,
      categoryCounts,
      mostUsedItems,
      recentActivity: usage.slice(0, 5),
    };
  }, [inventory, usage]);

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
                  <ChartBar size={28} />
                </div>
                <p className="eyebrow">Inventory Analytics</p>
                <h1 className="section-title">Dashboard and usage insights</h1>
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

          {loading ? (
            <div className="content-card text-center text-slate-300">Loading analytics...</div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard
                  title="Total Items"
                  value={analytics.totalItems}
                  helper="Inventory documents tracked"
                  icon={Boxes}
                />
                <DashboardCard
                  title="Total Quantity"
                  value={analytics.totalQuantity}
                  helper="Combined stock capacity"
                  icon={PackageOpen}
                />
                <DashboardCard
                  title="Total In Use"
                  value={analytics.totalInUse}
                  helper="Currently issued items"
                  icon={PackageCheck}
                />
                <DashboardCard
                  title="Total Consumed"
                  value={analytics.totalConsumed}
                  helper="Marked as consumed"
                  icon={ChartBar}
                />
              </div>

              <LowStockTable items={analytics.lowStockItems} />

              <UsageInsights
                categoryCounts={analytics.categoryCounts}
                mostUsedItems={analytics.mostUsedItems}
                recentActivity={analytics.recentActivity}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
