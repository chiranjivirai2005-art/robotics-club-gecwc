"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Trophy, Users, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import AnimatedCounter from "@/components/AnimatedCounter";
import Reveal from "@/components/Reveal";
import { db } from "@/lib/firebase";

const fallbackMetrics = [
  { value: "25+", label: "Active builders" },
  { value: "12+", label: "Events and workshops" },
  { value: "100%", label: "Hands-on learning" },
];

const highlights = [
  {
    title: "Build Real Systems",
    description:
      "Prototype bots, control loops, and autonomous workflows through hands-on engineering.",
  },
  {
    title: "Compete With Confidence",
    description:
      "Prepare for technical contests, demos, and challenge rounds with collaborative practice.",
  },
  {
    title: "Grow As A Team",
    description:
      "Learn in public, mentor juniors, and build a culture around curiosity and execution.",
  },
];

const pathways = [
  {
    icon: CalendarDays,
    title: "Events That Create Momentum",
    text: "Hack sessions, demo days, club meetups, and guided workshops that keep members shipping.",
  },
  {
    icon: Trophy,
    title: "Achievements With Substance",
    text: "A place to document progress, celebrate technical wins, and turn experiments into outcomes.",
  },
  {
    icon: Users,
    title: "A Strong Member Network",
    text: "Students collaborate across batches, share practical knowledge, and build lasting technical confidence.",
  },
];

export default function HomePage() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [studentWorks, setStudentWorks] = useState([]);
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [teamCount, setTeamCount] = useState(0);
  const [activeVisual, setActiveVisual] = useState(0);
  const [loadingLiveData, setLoadingLiveData] = useState(true);

  useEffect(() => {
    const fetchLiveHomepageData = async () => {
      try {
        const [gallerySnap, workSnap, eventsSnap, achievementsSnap, teamSnap] =
          await Promise.all([
            getDocs(query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(8))),
            getDocs(query(collection(db, "studentWorks"), orderBy("createdAt", "desc"), limit(6))),
            getDocs(query(collection(db, "events"), orderBy("date", "asc"), limit(6))),
            getDocs(query(collection(db, "achievements"), orderBy("date", "desc"), limit(4))),
            getDocs(collection(db, "teamMembers")),
          ]);

        setGalleryItems(gallerySnap.docs.map((item) => ({ id: item.id, ...item.data() })));
        setStudentWorks(workSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
        setEvents(eventsSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
        setAchievements(achievementsSnap.docs.map((item) => ({ id: item.id, ...item.data() })));
        setTeamCount(teamSnap.size);
      } catch (error) {
        console.error("Failed to load live homepage data:", error);
      } finally {
        setLoadingLiveData(false);
      }
    };

    fetchLiveHomepageData();
  }, []);

  const liveVisuals = useMemo(() => {
    const galleryVisuals = galleryItems
      .filter((item) => item.imageURL)
      .map((item) => ({
        id: `gallery-${item.id}`,
        title: item.title,
        subtitle: item.description || "From the club gallery",
        label: "Gallery",
        imageURL: item.imageURL,
        href: "/gallery",
      }));

    const workVisuals = studentWorks
      .filter((item) => item.imageURL)
      .map((item) => ({
        id: `work-${item.id}`,
        title: item.title,
        subtitle: item.description || "Student build shared with the club",
        label: "Student Work",
        imageURL: item.imageURL,
        href: "/work",
      }));

    const eventVisuals = events
      .filter((item) => item.imageURL)
      .map((item) => ({
        id: `event-${item.id}`,
        title: item.title,
        subtitle: item.location || "Upcoming club activity",
        label: "Event",
        imageURL: item.imageURL,
        href: "/events",
      }));

    return [...galleryVisuals, ...workVisuals, ...eventVisuals];
  }, [events, galleryItems, studentWorks]);

  useEffect(() => {
    if (liveVisuals.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveVisual((current) => (current + 1) % liveVisuals.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [liveVisuals.length]);

  useEffect(() => {
    if (activeVisual >= liveVisuals.length) {
      setActiveVisual(0);
    }
  }, [activeVisual, liveVisuals.length]);

  const featuredVisual = liveVisuals[activeVisual];

  const liveMetrics = [
    {
      value: teamCount || fallbackMetrics[0].value,
      label: teamCount ? "Team members" : fallbackMetrics[0].label,
    },
    {
      value: events.length || fallbackMetrics[1].value,
      label: events.length ? "Visible events" : fallbackMetrics[1].label,
    },
    {
      value: studentWorks.length || galleryItems.length || fallbackMetrics[2].value,
      label: studentWorks.length
        ? "Student builds"
        : galleryItems.length
          ? "Gallery moments"
          : fallbackMetrics[2].label,
    },
  ];

  const liveFeed = [
    ...studentWorks.map((item) => ({
      id: `work-${item.id}`,
      label: "Student Work",
      title: item.title,
      text: item.description,
      imageURL: item.imageURL,
      href: "/work",
    })),
    ...events.map((item) => ({
      id: `event-${item.id}`,
      label: "Event",
      title: item.title,
      text: item.location || item.description,
      imageURL: item.imageURL,
      href: "/events",
    })),
    ...achievements.map((item) => ({
      id: `achievement-${item.id}`,
      label: "Achievement",
      title: item.title,
      text: item.description,
      imageURL: item.imageURL,
      href: "/achievements",
    })),
  ].slice(0, 6);

  return (
    <div className="tech-background">
      <section className="premium-grid relative overflow-hidden">
        <AnimatePresence mode="wait">
          {featuredVisual?.imageURL && (
            <motion.div
              key={featuredVisual.id}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${featuredVisual.imageURL})` }}
              aria-hidden="true"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 0.45, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <Reveal className="relative z-10" y={18}>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_16px_rgba(34,211,238,0.9)]" />
              GEC West Champaran
            </div>

            <div className="mb-8 flex items-center gap-4">
              <Image
                src="/images/college-logo.png"
                alt="College Logo"
                width={88}
                height={88}
                className="rounded-2xl border border-white/10 bg-white/90 p-2 shadow-2xl"
                priority
              />
              <Image
                src="/images/club-logo.png"
                alt="Club Logo"
                width={88}
                height={88}
                className="rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-2 shadow-2xl"
                priority
              />
            </div>

            <h1 className="max-w-4xl text-5xl leading-[0.95] text-white sm:text-6xl xl:text-7xl">
              Robotics for students who want to build, test, and lead.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              The Robotics Club is a high-energy technical community where ideas
              become prototypes, workshops become confidence, and teamwork turns
              curiosity into real engineering.
            </p>

            <p className="mt-4 max-w-xl text-sm uppercase tracking-[0.22em] text-cyan-200/80">
              &ldquo;The best way to predict the future is to create it.&rdquo;
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/events" className="btn-primary">
                Explore Events
                <ArrowRight size={18} />
              </Link>
              <Link href="/work" className="btn-secondary">
                See Student Work
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {liveMetrics.map((metric) => (
                <div key={metric.label} className="premium-stat">
                  <p className="text-3xl font-bold text-white">
                    <AnimatedCounter value={metric.value} />
                  </p>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-400">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="relative z-10" delay={0.12} y={18}>
            <div className="premium-panel overflow-hidden p-0">
              {featuredVisual?.imageURL ? (
                <motion.div
                  key={featuredVisual.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <Link href={featuredVisual.href} className="group block">
                  <div className="relative h-72 w-full overflow-hidden">
                    <Image
                      src={featuredVisual.imageURL}
                      alt={featuredVisual.title || "Robotics Club highlight"}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                        Live {featuredVisual.label}
                      </p>
                      <h2 className="mt-3 text-2xl text-white">{featuredVisual.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-200">
                        {featuredVisual.subtitle}
                      </p>
                    </div>
                  </div>
                  </Link>
                </motion.div>
              ) : (
                <div className="p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">
                        Club Focus
                      </p>
                      <h2 className="mt-2 text-2xl text-white">What makes it premium</h2>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      2026 Intake
                    </div>
                  </div>

                  <div className="space-y-4">
                    {highlights.map((item, index) => (
                      <div key={item.title} className="premium-card">
                        <div className="flex items-start gap-4">
                          <div className="premium-badge">{`0${index + 1}`}</div>
                          <div>
                            <h3 className="text-lg text-white">{item.title}</h3>
                            <p className="mt-2 text-sm leading-7 text-slate-300">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {liveVisuals.length > 0 && (
                <div className="border-t border-white/10 bg-slate-950/55 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Rotating from gallery, events, and work feed
                    </p>
                    <div className="flex gap-2">
                      {liveVisuals.slice(0, 6).map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveVisual(index)}
                          className={`h-2.5 w-2.5 rounded-full transition ${
                            index === activeVisual ? "bg-accent" : "bg-white/25 hover:bg-white/50"
                          }`}
                          aria-label={`Show ${item.title}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <Reveal className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Live Club Feed</p>
            <h2 className="section-title max-w-2xl">
              Fresh work, events, and wins from the actual site.
            </h2>
            <p className="text-lg leading-8 text-slate-300">
              This section updates from the gallery, student work feed, events,
              and achievements collections as new content is added.
            </p>
          </div>
          <Link href="/work" className="btn-secondary">
            Open Feed
          </Link>
        </Reveal>

        {loadingLiveData ? (
          <div className="premium-panel p-8 text-center text-slate-300">Loading live club activity...</div>
        ) : liveFeed.length === 0 ? (
          <div className="premium-panel p-8 text-center text-slate-300">
            Add gallery images, events, achievements, or student work to populate this live feed.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {liveFeed.map((item, index) => (
              <Reveal key={item.id} delay={Math.min(index * 0.05, 0.2)}>
                <Link
                  href={item.href}
                  className="group block overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/55 shadow-[0_18px_45px_rgba(2,8,23,0.4)] transition hover:-translate-y-1 hover:border-cyan-300/30"
                >
                  <div className="relative h-52 bg-slate-900">
                    {item.imageURL ? (
                      <Image
                        src={item.imageURL}
                        alt={item.title || item.label}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-accent">
                        <Wrench size={36} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-100">
                      {item.label}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl text-white">{item.title || "Untitled update"}</h3>
                    {item.text && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{item.text}</p>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <Reveal className="mb-10 max-w-3xl">
          <p className="eyebrow">Why Students Join</p>
          <h2 className="section-title max-w-2xl">
            A club experience designed around progress, not just attendance.
          </h2>
          <p className="text-lg leading-8 text-slate-300">
            We are building a sharper identity for the club: ambitious,
            collaborative, technically grounded, and visibly proud of the work
            we produce.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {pathways.map((path, index) => {
            const Icon = path.icon;
            return (
              <Reveal key={path.title} delay={index * 0.08} className="premium-card min-h-[240px]">
                <div className="mb-5 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-accent">
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl text-white">{path.title}</h3>
                <p className="mt-4 leading-7 text-slate-300">{path.text}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <Reveal className="premium-panel overflow-hidden">
          <div className="grid gap-8 p-8 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow">Start Here</p>
              <h2 className="section-title max-w-xl">
                See what the club is building and where you can plug in.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Browse events, explore the gallery, meet the team, and get a
                feel for the systems-thinking culture we are shaping.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/events" className="premium-link-card">
                <span>Upcoming events</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/work" className="premium-link-card">
                <span>Student work</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/gallery" className="premium-link-card">
                <span>Project gallery</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/achievements" className="premium-link-card">
                <span>Club achievements</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
