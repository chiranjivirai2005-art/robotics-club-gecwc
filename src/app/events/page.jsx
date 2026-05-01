"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
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

  const today = new Date();
  const upcomingEvents = events.filter((event) => new Date(event.date) >= today);
  const pastEvents = events.filter((event) => new Date(event.date) < today);

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <p className="eyebrow">Club Events</p>
          <h1 className="section-title max-w-3xl">
            Workshops, demos, reviews, and competitions that keep the club in motion.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Browse upcoming opportunities to participate and revisit the events
            that shaped the club’s recent momentum.
          </p>
        </section>

        {loading && <p className="text-center text-slate-400">Loading events...</p>}

        {!loading && events.length === 0 && (
          <div className="content-card text-center">
            <h2 className="text-2xl text-white">No events available right now</h2>
            <p className="mt-3 text-slate-300">
              New workshops and sessions will appear here once they’re published.
            </p>
          </div>
        )}

        {!loading && upcomingEvents.length > 0 && (
          <section className="mb-12">
            <p className="eyebrow mb-4">Upcoming</p>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {!loading && pastEvents.length > 0 && (
          <section>
            <p className="eyebrow mb-4">Past Events</p>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, isPast = false }) {
  return (
    <div className={`content-card overflow-hidden p-0 ${isPast ? "opacity-80" : ""}`}>
      <div className="relative h-56 w-full">
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
          <p className="mt-3 line-clamp-3 leading-7 text-slate-300">
            {event.description}
          </p>
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

        {event.registrationLink && !isPast && (
          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-admin mt-6"
          >
            Register Now
          </a>
        )}

        {isPast && (
          <span className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-slate-300">
            Completed
          </span>
        )}
      </div>
    </div>
  );
}
