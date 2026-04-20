import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Trophy, Users } from "lucide-react";

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

const metrics = [
  { value: "25+", label: "Active builders" },
  { value: "12+", label: "Events and workshops" },
  { value: "100%", label: "Hands-on learning" },
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
  return (
    <div className="tech-background">
      <section className="premium-grid relative overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="relative z-10">
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
              <Link href="/about" className="btn-secondary">
                Discover The Club
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="premium-stat">
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-400">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="premium-panel p-6 sm:p-8">
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
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="eyebrow">Why Students Join</p>
          <h2 className="section-title max-w-2xl">
            A club experience designed around progress, not just attendance.
          </h2>
          <p className="text-lg leading-8 text-slate-300">
            We’re building a sharper identity for the club: ambitious,
            collaborative, technically grounded, and visibly proud of the work
            we produce.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pathways.map((path) => {
            const Icon = path.icon;
            return (
              <div key={path.title} className="premium-card min-h-[240px]">
                <div className="mb-5 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-accent">
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl text-white">{path.title}</h3>
                <p className="mt-4 leading-7 text-slate-300">{path.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="premium-panel overflow-hidden">
          <div className="grid gap-8 p-8 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="eyebrow">Start Here</p>
              <h2 className="section-title max-w-xl">
                See what the club is building and where you can plug in.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Browse events, explore the gallery, meet the team, and get a
                feel for the systems-thinking culture we’re shaping.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/events" className="premium-link-card">
                <span>Upcoming events</span>
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
              <Link href="/team" className="premium-link-card">
                <span>Meet the team</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
