"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      const q = query(collection(db, "achievements"), orderBy("date", "desc"));
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
          <p className="eyebrow">Achievements</p>
          <h1 className="section-title max-w-3xl">
            Milestones that reflect the club’s discipline, progress, and technical ambition.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Every achievement here represents time spent learning, building,
            refining, and showing up as a team.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((item) => (
            <div key={item.id} className="content-card overflow-hidden p-0">
              <div className="relative h-56 w-full">
                <Image src={item.imageURL} alt={item.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl text-white">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-300">{item.description}</p>
                <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
                  <CalendarDays size={16} className="text-accent" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
