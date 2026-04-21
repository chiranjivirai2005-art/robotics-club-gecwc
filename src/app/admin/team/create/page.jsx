"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { db } from "@/lib/firebase";

export default function CreateTeamMemberPage() {
  const router = useRouter();
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    try {
      await addDoc(collection(db, "teamMembers"), {
        name: formData.get("name"),
        position: formData.get("position"),
        email: formData.get("email"),
        linkedin: formData.get("linkedin"),
        imageURL: imageData?.url || "",
        public_id: imageData?.public_id || "",
        createdAt: serverTimestamp(),
      });

      alert("Team member added successfully!");
      router.push("/admin/team");
    } catch (error) {
      console.error("Error adding team member:", error);
      alert("Failed to add team member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-black">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-md dark:bg-gray-900">
        <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-black">
          Add Team Member
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="w-full rounded border p-2 text-black"
          />

          <input
            type="text"
            name="position"
            placeholder="Position (e.g., President)"
            required
            className="w-full rounded border p-2 text-black"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full rounded border p-2 text-black"
          />

          <input
            type="url"
            name="linkedin"
            placeholder="LinkedIn Profile URL"
            className="w-full rounded border p-2 text-black"
          />

          <div>
            <label className="mb-1 block font-medium">Profile Image</label>
            <CloudinaryUpload onUpload={setImageData} />
          </div>

          {imageData?.url && (
            <div className="relative h-40 w-40 overflow-hidden rounded-full border">
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
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700"
          >
            {loading ? "Adding..." : "Add Member"}
          </button>
        </form>
      </div>
    </div>
  );
}
