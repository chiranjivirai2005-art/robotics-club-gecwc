"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import DeleteItemButton from "@/components/DeleteItemButton";
import { db } from "@/lib/firebase";

export default function AdminGalleryPage() {
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
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Admin Gallery</p>
              <h1 className="section-title">Manage visual assets</h1>
            </div>
            <Link href="/admin/gallery/create" className="btn-admin">
              + Add Image
            </Link>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="content-card overflow-hidden p-0">
              <div className="relative h-52 w-full">
                <Image src={img.imageURL} alt={img.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <h2 className="text-xl text-white">{img.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{img.description}</p>
                <div className="mt-5 flex justify-end">
                  <DeleteItemButton
                    itemId={img.id}
                    collectionName="gallery"
                    publicId={img.public_id}
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
