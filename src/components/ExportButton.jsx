"use client";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebase";

const formatTimestamp = (value) => {
  if (!value) return "";
  if (typeof value.toDate === "function") return value.toDate().toLocaleString();
  return "";
};

export default function ExportButton() {
  const exportInventory = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, "inventory"), orderBy("createdAt", "desc")));
      const rows = snapshot.docs.map((item) => {
        const data = item.data();
        return {
          Name: data.name || "",
          Category: data.category || "",
          Total: data.totalQuantity ?? 0,
          "In Use": data.inUse ?? 0,
          Consumed: data.consumed ?? 0,
          Remaining: data.remaining ?? 0,
          Created: formatTimestamp(data.createdAt),
          Updated: formatTimestamp(data.updatedAt),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
      XLSX.writeFile(workbook, `inventory-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("Error exporting inventory:", error);
      alert("Failed to export inventory.");
    }
  };

  return (
    <button type="button" onClick={exportInventory} className="btn-admin">
      Export
    </button>
  );
}
