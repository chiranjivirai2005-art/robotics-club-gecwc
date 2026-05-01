"use client";

import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function DeleteItemButton({
  itemId,
  collectionName,
  publicId,
  label = "Delete",
}) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmDelete) return;

    try {
      // Delete image from Cloudinary
      if (publicId) {
        await fetch("/api/delete-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_id: publicId }),
        });
      }

      // Delete Firestore document
      await deleteDoc(doc(db, collectionName, itemId));

      router.refresh();
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Deletion error:", error);
      alert("Failed to delete item.");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white px-3 py-1 rounded mt-2"
    >
      {label}
    </button>
  );
}