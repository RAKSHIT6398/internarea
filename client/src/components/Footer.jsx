import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  ArrowUp,
  MapPin,
  Phone,
  ShieldCheck,
  Zap,
  Heart,
  Check,
} from "lucide-react";

const LOGO = "/fav.png";

/* ════════ BRAND ICONS (inline SVG) ════════ */
const GithubIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...p}>
    <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.82 1.1.82 2.22 0 1.61-.02 2.9-.02 3.3 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
  </svg>
);

const LinkedinIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...p}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const TwitterIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...p}>
    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z" />
  </svg>
);

const InstagramIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...p}>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.39C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.39 2.12.66.67 1.33 1.09 2.12 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.39.67-.66 1.09-1.33 1.39-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.39-2.12C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z" />
    <path d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
    <circle cx="18.41" cy="5.59" r="1.44" />
  </svg>
);

/* ════════ DATA ════════ */
const SOCIALS = [
  {
    name: "GitHub",
    href: "https://github.com/yourhandle",
    Icon: GithubIcon,
    hover: "hover:bg-white hover:text-black",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/yourhandle",
    Icon: LinkedinIcon,
    hover: "hover:bg-[#0A66C2] hover:text-white",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/yourhandle",
    Icon: TwitterIcon,
    hover: "hover:bg-white hover:text-black",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/yourhandle",
    Icon: InstagramIcon,
    hover:
      "hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white",
  },
];

const COLUMNS = [
  {
    title: "Platform",
    links: [
      ["Internships", "/internships", "Hot"],
      ["Jobs", "/jobs", null],
      ["Resume Builder", "/resume", "AI"],
      ["Pricing", "/pricing", null],
      ["Community Feed", "/feed", null],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Us", "/about", null],
      ["Contact", "/contact", null],
      ["Blog", "/blog", null],
      ["Careers", "/careers", "Hiring"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy", null],
      ["Terms of Service", "/terms", null],
      ["Refund Policy", "/refund", null],
      ["Cookie Policy", "/cookies", null],
    ],
  },
];

const STATS = [
  { value: "50K+", label: "Students" },
  { value: "1.2K+", label: "Companies" },
  { value: "18K+", label: "Placements" },
  { value: "4.9★", label: "Rating" },
];

/* ════════ COMPONENT ════════ */
export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  const handleHash = (e, href) => {
    e.preventDefault();
    const [path, hash] = href.split("#");

    if (location.pathname === path) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(path);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  };

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden bg-[#080810] text-gray-400">
      {/* ─── Ambient glows ─── */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[120px]" />

      {/* ─── Grid pattern ─── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* ─── Top gradient line ─── */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* ═══════ CTA / NEWSLETTER ═══════ */}
        <div className="relative -mt-px mt-14 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-7 backdrop-blur-sm sm:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-md">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                <Zap size={11} className="fill-indigo-400 text-indigo-400" />
                Weekly Drop
              </div>

              <h3 className="text-xl font-black text-white sm:text-2xl">
                Get internships before they go public.
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-gray-400 sm:text-[13px]">
                Handpicked roles, resume tips & hiring alerts — every Monday. No
                spam, unsubscribe anytime.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="w-full lg:w-auto lg:min-w-[380px]"
            >
              <div className="group flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-1.5 transition focus-within:border-indigo-500/60 focus-within:ring-4 focus-within:ring-indigo-500/10">
                <Mail
                  size={15}
                  className="ml-2.5 shrink-0 text-gray-500 transition group-focus-within:text-indigo-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full bg-transparent py-2 text-sm text-white placeholder-gray-600 outline-none"
                />

                <button
                  type="submit"
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold transition-all active:scale-95 ${
                    subscribed
                      ? "bg-emerald-500 text-white"
                      : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40"
                  }`}
                >
                  {subscribed ? (
                    <>
                      <Check size={14} /> Done
                    </>
                  ) : (
                    <>
                      Subscribe <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>

              {subscribed && (
                <p className="mt-2 pl-1 text-[11px] font-medium text-emerald-400">
                  🎉 You're in! Check your inbox.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ═══════ STATS ═══════ */}
        {/* <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="group rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-4 text-center transition duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-indigo-500/[0.06]"
            >
              <div className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-xl font-black text-transparent transition group-hover:from-indigo-300 group-hover:to-violet-400 sm:text-2xl">
                {s.value}
              </div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {s.label}
              </div>
            </div>
          ))}
        </div> */}

        {/* ═══════ MAIN GRID ═══════ */}
        <div className="mt-14 grid grid-cols-2 gap-10 pb-12 md:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link to="/home" className="group mb-4 inline-flex items-center">
              <div className="overflow-hidden rounded-xl bg-white px-2 py-1 shadow-lg shadow-indigo-600/20 transition duration-300 group-hover:scale-[1.03]">
                <img
                  src={LOGO}
                  alt="internArea logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </Link>

            <p className="max-w-xs text-[12.5px] leading-relaxed text-gray-500">
              India's student-first internship platform with a built-in ATS
              resume engine. Verified companies only — zero spam, zero
              registration fees.
            </p>

            {/* Contact */}
            <div className="mt-5 space-y-2.5">
              <a
                href="mailto:support@internArea.com"
                className="flex items-center gap-2.5 text-xs text-gray-500 transition hover:text-indigo-400"
              >
                <Mail size={13} className="shrink-0" />
                support@internArea.com
              </a>

              <a
                href="tel:+919876543210"
                className="flex items-center gap-2.5 text-xs text-gray-500 transition hover:text-indigo-400"
              >
                <Phone size={13} className="shrink-0" />
                +91 98765 43210
              </a>

              <div className="flex items-center gap-2.5 text-xs text-gray-500">
                <MapPin size={13} className="shrink-0" />
                Indore, Madhya Pradesh · IN
              </div>
            </div>

            {/* Socials */}
            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map(({ name, href, Icon, hover }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={name}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lg ${hover}`}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <h5 className="mb-4 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.15em] text-white">
                <span className="h-3 w-[2px] rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                {c.title}
              </h5>

              <ul className="space-y-2.5">
                {c.links.map(([label, href, badge]) => (
                  <li key={label}>
                    {href.includes("#") ? (
                      <a
                        href={href}
                        onClick={(e) => handleHash(e, href)}
                        className="group inline-flex items-center gap-1.5 text-[12.5px] text-gray-500 transition hover:text-white"
                      >
                        <span className="relative">
                          {label}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-indigo-400 transition-all duration-300 group-hover:w-full" />
                        </span>
                        <ArrowRight
                          size={11}
                          className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </a>
                    ) : (
                      <Link
                        to={href}
                        className="group inline-flex items-center gap-1.5 text-[12.5px] text-gray-500 transition hover:text-white"
                      >
                        <span className="relative">
                          {label}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-indigo-400 transition-all duration-300 group-hover:w-full" />
                        </span>

                        {badge && (
                          <span className="rounded-full bg-indigo-500/15 px-1.5 py-px text-[8.5px] font-bold uppercase tracking-wide text-indigo-300">
                            {badge}
                          </span>
                        )}

                        <ArrowRight
                          size={11}
                          className="-translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Trust badge */}
          <div className="col-span-2 md:col-span-2">
            <h5 className="mb-4 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.15em] text-white">
              <span className="h-3 w-[2px] rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
              Trusted
            </h5>

            <div className="space-y-2.5">
              {[
                [ShieldCheck, "Verified Companies"],
                [Zap, "ATS-Ready Resumes"],
                [Heart, "Free for Students"],
              ].map(([Icon, text]) => (
                <div
                  key={text}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-[11px] text-gray-400 transition hover:border-emerald-500/30 hover:text-emerald-300"
                >
                  <Icon size={13} className="shrink-0 text-emerald-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ BOTTOM BAR ═══════ */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] py-6 sm:flex-row">
          <p className="text-[11.5px] text-gray-600">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-gray-500">internArea</span>. All
            rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[11.5px] text-gray-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              All systems operational
            </span>

            <button
              onClick={toTop}
              className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-gray-400 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300"
            >
              <ArrowUp
                size={12}
                className="transition-transform group-hover:-translate-y-0.5"
              />
              Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}