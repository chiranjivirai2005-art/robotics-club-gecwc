"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarDays, MapPin } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: new Date(doc.data().date),
      }));
      setEvents(data);
    };

    fetchEvents();
  }, []);

  const eventsOnSelectedDate = events.filter(
    (event) => event.date.toDateString() === date.toDateString()
  );

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <p className="eyebrow">Calendar</p>
          <h1 className="section-title max-w-3xl">
            A cleaner way to track what the club is hosting and when it happens.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Use the event calendar to scan activity and drill into what is scheduled for a selected day.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="content-card">
            <Calendar onChange={setDate} value={date} />
          </div>

          <div className="content-card">
            <p className="eyebrow">Selected Date</p>
            <h2 className="mt-3 text-3xl text-white">{date.toDateString()}</h2>

            {eventsOnSelectedDate.length === 0 ? (
              <p className="mt-6 text-slate-300">No events on this date.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {eventsOnSelectedDate.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-xl text-white">{event.title}</h3>
                    <p className="mt-3 leading-7 text-slate-300">{event.description}</p>
                    <div className="mt-4 space-y-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-accent" />
                        <span>{event.date.toLocaleString()}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-accent" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
