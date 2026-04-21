"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import DeleteItemButton from "@/components/DeleteItemButton";
import { db } from "@/lib/firebase";

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setEvents(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Admin Events</p>
              <h1 className="section-title">Manage published events</h1>
            </div>
            <Link href="/admin/events/create" className="btn-admin">
              + Create Event
            </Link>
          </div>
        </section>

        {loading && <p className="text-center text-slate-400">Loading events...</p>}

        {!loading && events.length === 0 && (
          <div className="content-card text-center text-slate-300">No events found.</div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="content-card overflow-hidden p-0">
              <div className="relative h-52 w-full">
                {event.imageURL ? (
                  <Image src={event.imageURL} alt={event.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-900 text-slate-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-2xl text-white">{event.title}</h2>
                {event.description && (
                  <p className="mt-3 line-clamp-3 leading-7 text-slate-300">{event.description}</p>
                )}
                <div className="mt-5 space-y-2 text-sm text-slate-300">
                  {event.date && (
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-accent" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-accent" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <DeleteItemButton
                    itemId={event.id}
                    collectionName="events"
                    publicId={event.public_id}
                    label="Delete Event"
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
