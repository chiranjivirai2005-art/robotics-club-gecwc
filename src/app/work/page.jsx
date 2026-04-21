"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

const formatDate = (value) => {
  if (!value) return "";
  if (typeof value.toDate === "function") return value.toDate().toLocaleDateString();
  return "";
};

export default function WorkFeedPage() {
  const { user } = useAuth();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, "studentWorks"), orderBy("createdAt", "desc"))
        );
        setWorks(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (error) {
        console.error("Error loading student work feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Student Work</p>
              <h1 className="section-title max-w-3xl">
                A public feed of projects, builds, and club work.
              </h1>
            </div>
            {user ? (
              <Link href="/work/new" className="btn-admin">
                Upload Work
              </Link>
            ) : (
              <Link href="/login" className="btn-secondary">
                Login to Upload
              </Link>
            )}
          </div>
        </section>

        {loading ? (
          <div className="content-card text-center text-slate-300">Loading work feed...</div>
        ) : works.length === 0 ? (
          <div className="content-card text-center text-slate-300">No student work posted yet.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {works.map((work) => (
              <article key={work.id} className="content-card overflow-hidden p-0">
                {(work.mediaURL || work.imageURL) && (
  <div className="relative h-64 w-full">
    {work.mediaType === "video" ? (
      <video
        src={work.mediaURL}
        controls
        className="h-full w-full object-cover"
      />
    ) : (
      <Image
        src={work.mediaURL || work.imageURL}
        alt={work.title}
        fill
        className="object-cover"
      />
    )}
  </div>
)}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl text-white">{work.title}</h2>
                      <p className="mt-2 text-sm text-slate-400">
                        {work.authorName || work.authorEmail || "Student"} {formatDate(work.createdAt)}
                      </p>
                    </div>
                    {user?.uid === work.authorId && (
                      <Link href={`/work/edit/${work.id}`} className="btn-admin">
                        <Pencil size={16} />
                        Edit
                      </Link>
                    )}
                  </div>
                  <p className="mt-4 leading-7 text-slate-300">{work.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
