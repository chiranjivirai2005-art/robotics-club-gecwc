"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

export default function NewWorkPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [imageData, setImageData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submitWork = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(event.target);

    try {
      if (!user) throw new Error("You must be logged in.");

      await addDoc(collection(db, "studentWorks"), {
        title: String(formData.get("title") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        imageURL: imageData?.url || "",
        publicId: imageData?.public_id || "",
        authorId: user.uid,
        authorName: user.displayName || user.email || "Student",
        authorEmail: user.email || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/work");
    } catch (err) {
      console.error("Error uploading student work:", err);
      setError(err.message || "Failed to upload work.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute
      allowedRoles={["admin", "faculty", "coordinator", "volunteer", "member"]}
      redirectTo="/"
    >
      <div className="page-shell">
        <div className="page-wrap">
          <section className="page-hero">
            <p className="eyebrow">Student Work</p>
            <h1 className="section-title">Upload your work</h1>
          </section>

          <form onSubmit={submitWork} className="content-card mx-auto max-w-3xl space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}
            <input name="title" placeholder="Project title" className="field" required />
            <textarea name="description" placeholder="What did you build?" rows="5" className="field" required />
            <CloudinaryUpload onUpload={setImageData} />
            {imageData?.url && (
              <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10">
                <Image src={imageData.url} alt="Work preview" fill className="object-cover" />
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-admin disabled:opacity-60">
              {saving ? "Uploading..." : "Publish Work"}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
