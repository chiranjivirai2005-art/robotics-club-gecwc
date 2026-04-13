"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function GalleryPage() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setImages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    };

    fetchImages();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <p className="eyebrow">Visual Archive</p>
          <h1 className="section-title max-w-3xl">
            A gallery of workshops, prototypes, people, and moments that define the club.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Explore the atmosphere behind the work and the people shaping the
            robotics culture on campus.
          </p>
        </section>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/55 shadow-[0_18px_45px_rgba(2,8,23,0.4)] ${
                index % 5 === 0 ? "sm:col-span-2" : ""
              }`}
            >
              <div className="relative h-64 w-full sm:h-72">
                <Image src={img.imageURL} alt={img.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-5">
                <h2 className="text-lg text-white">{img.title}</h2>
                {img.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                    {img.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
