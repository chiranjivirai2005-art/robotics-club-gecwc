import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { name: "About", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "Achievements", href: "/achievements" },
  { name: "Team", href: "/team" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-black/40">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-4">
              <Image
                src="/images/college-logo.png"
                alt="College Logo"
                width={56}
                height={56}
                className="rounded-2xl bg-white/95 p-2"
              />
              <Image
                src="/images/club-logo.png"
                alt="Club Logo"
                width={56}
                height={56}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-2"
              />
            </div>

            <p className="eyebrow">Robotics Club</p>
            <h3 className="mt-3 max-w-xl text-3xl text-white">
              Building a sharper, hands-on engineering culture at GEC West
              Champaran.
            </h3>
            <p className="mt-4 max-w-2xl text-slate-300">
              A student community focused on robotics, systems thinking,
              practical experimentation, and collaborative technical growth.
            </p>
          </div>

          <div className="premium-card">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
              Explore
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {footerLinks.map((link) => (
                <Link key={link.name} href={link.href} className="footer-pill">
                  {link.name}
                </Link>
              ))}
            </div>
            <p className="mt-8 text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Robotics Club, GEC West
              Champaran. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
