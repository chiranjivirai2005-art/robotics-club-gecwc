"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import InventoryForm from "@/components/InventoryForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditInventoryItemPage() {
  const params = useParams();

  return (
    <ProtectedRoute
      allowedRoles={["admin", "coordinator", "faculty"]}
      redirectTo="/"
      unauthenticatedRedirectTo="/"
    >
      <div className="page-shell">
        <div className="page-wrap">
          <section className="page-hero">
            <p className="eyebrow">Inventory</p>
            <h1 className="section-title">Edit inventory item</h1>
            <Link href="/admin/inventory" className="btn-secondary">
              Back to Inventory
            </Link>
          </section>

          <InventoryForm itemId={params.id} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
