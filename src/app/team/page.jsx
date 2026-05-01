"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link2, Mail } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TeamPage() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const q = query(collection(db, "teamMembers"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      setMembers(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };

    fetchMembers();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <p className="eyebrow">Team</p>
          <h1 className="section-title max-w-3xl">
            Meet the people shaping the Robotics Club’s direction, energy, and execution.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            A cross-batch group of builders, organizers, and technical learners
            working together to grow a stronger robotics culture on campus.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <div key={member.id} className="content-card text-center">
              <div className="relative mx-auto mb-5 h-36 w-36 overflow-hidden rounded-full border border-white/10">
                <Image
                  src={member.imageURL || "/images/club-logo.png"}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-2xl text-white">{member.name}</h2>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-accent">
                {member.position}
              </p>

              <div className="mt-6 flex justify-center gap-3">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    aria-label={`${member.name} email`}
                    className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 hover:border-accent/40 hover:text-accent"
                  >
                    <Mail size={18} />
                  </a>
                )}
                {[member.instagram, member.linkedin, member.github]
                  .filter(Boolean)
                  .map((link) => (
                    <a
                      key={link}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} profile`}
                      className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 hover:border-accent/40 hover:text-accent"
                    >
                      <Link2 size={18} />
                    </a>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
