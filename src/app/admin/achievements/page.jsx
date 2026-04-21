"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import DeleteItemButton from "@/components/DeleteItemButton";
import { db } from "@/lib/firebase";

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      const q = query(collection(db, "achievements"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setAchievements(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };

    fetchAchievements();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Admin Achievements</p>
              <h1 className="section-title">Manage milestones</h1>
            </div>
            <Link href="/admin/achievements/create" className="btn-admin">
              + Add Achievement
            </Link>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((item) => (
            <div key={item.id} className="content-card overflow-hidden p-0">
              <div className="relative h-52 w-full">
                <Image src={item.imageURL} alt={item.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <h2 className="text-xl text-white">{item.title}</h2>
                <p className="mt-2 leading-7 text-slate-300">{item.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                  <CalendarDays size={16} className="text-accent" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div className="mt-5 flex justify-end">
                  <DeleteItemButton
                    itemId={item.id}
                    collectionName="achievements"
                    publicId={item.public_id}
                    label="Delete"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
