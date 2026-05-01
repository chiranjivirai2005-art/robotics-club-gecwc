"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { db } from "@/lib/firebase";

export default function CreateAchievementPage() {
  const router = useRouter();
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    try {
      await addDoc(collection(db, "achievements"), {
        title: formData.get("title"),
        description: formData.get("description"),
        date: formData.get("date"),
        imageURL: imageData?.url || "",
        public_id: imageData?.public_id || "",
        createdAt: serverTimestamp(),
      });

      alert("Achievement added successfully!");
      router.push("/admin/achievements");
    } catch (error) {
      console.error("Error adding achievement:", error);
      alert("Failed to add achievement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-black">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-md dark:bg-gray-900">
        <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">
          Add Achievement
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Achievement Title"
            required
            className="w-full rounded border p-2 text-black"
          />

          <textarea
            name="description"
            placeholder="Description"
            rows="4"
            className="w-full rounded border p-2 text-black"
          />

          <input
            type="date"
            name="date"
            required
            className="w-full rounded border p-2 text-black"
          />

          <CloudinaryUpload onUpload={setImageData} />

          {imageData?.url && (
            <div className="relative h-48 w-full overflow-hidden rounded">
              <Image
                src={imageData.url}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !imageData}
            className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            {loading ? "Adding..." : "Add Achievement"}
          </button>
        </form>
      </div>
    </div>
  );
}
