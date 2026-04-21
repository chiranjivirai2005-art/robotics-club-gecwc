import Image from "next/image";
import Link from "next/link";
import { Cpu, Lightbulb, Rocket } from "lucide-react";

export const metadata = {
  title: "About | Robotics Club - GEC West Champaran",
  description:
    "Learn about the Robotics Club of Government Engineering College, West Champaran.",
};

const pillars = [
  {
    icon: Cpu,
    title: "Technical Depth",
    text: "We learn by building systems that combine electronics, software, control logic, and practical iteration.",
  },
  {
    icon: Lightbulb,
    title: "Creative Experimentation",
    text: "Ideas move from sketches to prototypes through workshops, open sessions, and collaborative problem solving.",
  },
  {
    icon: Rocket,
    title: "Visible Growth",
    text: "Members gain confidence through demos, competition exposure, peer mentorship, and real output.",
  },
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="eyebrow">About The Club</p>
              <h1 className="section-title max-w-2xl">
                A robotics community built around experimentation, teamwork, and
                engineering confidence.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                The Robotics Club of Government Engineering College, West
                Champaran brings together students who want to design, test, and
                improve intelligent systems through real collaborative work.
              </p>
              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-cyan-200/80">
                &ldquo;The best way to predict the future is to create it.&rdquo;
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="premium-card text-center">
                <Image
                  src="/images/college-logo.png"
                  alt="Government Engineering College West Champaran Logo"
                  width={120}
                  height={120}
                  className="mx-auto rounded-3xl bg-white p-3"
                />
                <p className="mt-4 text-sm uppercase tracking-[0.18em] text-slate-400">
                  Government Engineering College
                </p>
              </div>
              <div className="premium-card text-center">
                <Image
                  src="/images/club-logo.png"
                  alt="Robotics Club Logo"
                  width={120}
                  height={120}
                  className="mx-auto rounded-3xl border border-white/10 bg-slate-900 p-3"
                />
                <p className="mt-4 text-sm uppercase tracking-[0.18em] text-slate-400">
                  Robotics Club
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="content-card">
                <div className="mb-5 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-accent">
                  <Icon size={24} />
                </div>
                <h2 className="text-2xl text-white">{pillar.title}</h2>
                <p className="mt-4 leading-7 text-slate-300">{pillar.text}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="content-card">
            <p className="eyebrow">Who We Are</p>
            <p className="mt-4 leading-8 text-slate-300">
              The club serves as a platform for innovation, collaboration, and
              hands-on learning. We help students transform theory into working
              systems through workshops, build sessions, and project-based
              exploration.
            </p>
            <p className="mt-4 leading-8 text-slate-300">
              Our members actively participate in technical activities that
              strengthen creativity, teamwork, and engineering discipline while
              preparing for future opportunities in robotics and automation.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="content-card">
              <p className="eyebrow">Mission</p>
              <p className="mt-4 leading-8 text-slate-300">
                To cultivate innovation and technical expertise among students
                through robotics projects, workshops, and competitions.
              </p>
            </div>
            <div className="content-card">
              <p className="eyebrow">Vision</p>
              <p className="mt-4 leading-8 text-slate-300">
                To establish the club as a center of excellence that inspires
                students to build impactful, intelligent solutions.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="page-hero">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="eyebrow">Join The Journey</p>
                <h2 className="section-title max-w-2xl">
                  Explore the club’s events, people, and work in progress.
                </h2>
              </div>
              <Link href="/events" className="btn-primary">
                Explore Events
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
