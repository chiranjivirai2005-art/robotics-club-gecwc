"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

export default function EditWorkPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [work, setWork] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWork = async () => {
      try {
        const snapshot = await getDoc(doc(db, "studentWorks", id));
        if (!snapshot.exists()) {
          setError("Work post not found.");
          return;
        }

        const data = { id: snapshot.id, ...snapshot.data() };
        if (user && data.authorId !== user.uid) {
          setError("You can only edit your own work.");
          return;
        }
        setWork(data);
      } catch (err) {
        console.error("Error loading work post:", err);
        setError("Failed to load work post.");
      } finally {
        setLoading(false);
      }
    };

    if (user) loadWork();
  }, [id, user]);

  const saveWork = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(event.target);

    try {
      await updateDoc(doc(db, "studentWorks", id), {
        title: String(formData.get("title") || "").trim(),
        description: String(formData.get("description") || "").trim(),
        imageURL: imageData?.url || work.imageURL || "",
        publicId: imageData?.public_id || work.publicId || "",
        updatedAt: serverTimestamp(),
      });
      router.push("/work");
    } catch (err) {
      console.error("Error updating work post:", err);
      setError("Failed to update work post.");
    } finally {
      setSaving(false);
    }
  };

  const removeWork = async () => {
    if (!confirm("Delete this work post?")) return;

    try {
      await deleteDoc(doc(db, "studentWorks", id));
      router.push("/work");
    } catch (err) {
      console.error("Error deleting work post:", err);
      setError("Failed to delete work post.");
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
            <h1 className="section-title">Edit your work</h1>
          </section>

          {loading ? (
            <div className="content-card text-center text-slate-300">Loading work post...</div>
          ) : error ? (
            <div className="content-card text-center text-red-100">{error}</div>
          ) : (
            <form onSubmit={saveWork} className="content-card mx-auto max-w-3xl space-y-5">
              <input name="title" defaultValue={work.title} className="field" required />
              <textarea name="description" defaultValue={work.description} rows="5" className="field" required />
              <CloudinaryUpload onUpload={setImageData} />
              {(imageData?.url || work.imageURL) && (
                <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10">
                  <Image src={imageData?.url || work.imageURL} alt="Work preview" fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className="btn-admin disabled:opacity-60">
                  {saving ? "Saving..." : "Save Work"}
                </button>
                <button
                  type="button"
                  onClick={removeWork}
                  className="rounded-full border border-red-400/20 bg-red-400/10 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-red-100"
                >
                  Delete
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
