import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import InternshipCard from "./InternshipCard";
// ---- Swiper ----
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectCreative } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-creative";
import { QUICK_FILTERS } from "../constants/categories";
// ---- Icons ----
import {
  Briefcase, Sparkles, FileText, CheckCircle, ArrowRight, Lock, UserCheck,
  Search, MapPin, HelpCircle, ChevronDown, Star, ShieldCheck, Zap, Award,
  Flame, Crown, Send, FileCheck2, Timer, SlidersHorizontal, X, Inbox,
  Loader2, Building2, IndianRupee, CalendarDays, ArrowUpRight, ChevronRight,
  CheckCircle2, Quote, Headphones, Mail, Globe,  Rocket, Gem, Medal, Wallet, BadgeCheck, TrendingUp, LayoutGrid, Table2, Minus,
} from "lucide-react";
/* ══════════════════════════════════════════════════════════════
   ⚙️  CONFIG  (Vite → import.meta.env)
══════════════════════════════════════════════════════════════ */
const ENV = import.meta.env ?? {};

const API = ENV.VITE_API_URL || "http://localhost:5000";
const RAZORPAY_KEY = ENV.VITE_RAZORPAY_KEY || "rzp_test_T1UOgsBKCf986s";
const PAGE_SIZE = 6;
/* ══════════════════════════════════════════════════════════════
   🔗  SOCIAL ICONS (inline SVG — lucide brand icons removed)
══════════════════════════════════════════════════════════════ */
const SOCIALS = [
  {
    name: "GitHub",
    href: "https://github.com",
    path: "M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z",
  },
  {
    name: "X (Twitter)",
    href: "https://twitter.com",
    path: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93Zm-1.3 19.5h2.04L6.5 3.24H4.31L17.6 20.65Z",
  },
];

const SocialIcon = ({ path, name, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    title={name}
    className="rounded-lg border border-gray-800 p-2 text-gray-500 transition hover:-translate-y-0.5 hover:border-indigo-500 hover:text-indigo-400"
  >
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
      <path d={path} />
    </svg>
  </a>
);
/* ══════════════════════════════════════════════════════════════
   📦  STATIC DATA
══════════════════════════════════════════════════════════════ */
const heroSlides = [
  {
    id: 1,
    tag: "New Batch Live",
    title: "Start Your Career Journey",
    subtitle: "3,000+ verified internships from India's fastest growing startups & MNCs.",
    cta: "Explore Internships",
    href: "#internships",
    gradient: "from-indigo-600 via-violet-600 to-fuchsia-600",
  },
  {
    id: 2,
    tag: "Pro Feature",
    title: "Build an ATS-Friendly Resume",
    subtitle: "Recruiter-approved layout, live canvas preview & instant PDF download at just ₹50.",
    cta: "Create Resume",
    href: "/resume",
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
  },
  {
    id: 3,
    tag: "Limited Offer",
    title: "Unlimited Applications with Gold",
    subtitle: "Unlock unlimited apply counts, priority invoices and 24/7 support.",
    cta: "View Plans",
    href: "#pricing",
    gradient: "from-amber-500 via-orange-600 to-rose-600",
  },
];

const categories = [
  "All", "Big Brands", "Work From Home", "Part-time", "MBA",
  "Engineering", "Media", "Design", "Data Science",
];

const trustedCompanies = [
  "Google", "Microsoft", "Amazon", "Flipkart", "Razorpay", "Zomato",
  "Swiggy", "Adobe", "Meta", "Paytm", "Zoho", "CRED",
];

const plans = [
  {
    name: "Free", price: 0, limit: 1, applications: "1 Internship / Month",
    tagline: "Just exploring? Start here.",
    icon: Medal,
    color: "from-gray-700 to-gray-900",
    accent: "text-gray-300",
    ring: "shadow-gray-500/10",
    glow: "99,102,241",
    features: ["Access to Job Board", "Standard Support", "1 Application Count"],
  },
  {
    name: "Bronze", price: 100, limit: 3, applications: "3 Internships / Month",
    tagline: "Best for first-time applicants.",
    icon: Award,
    color: "from-amber-600 to-amber-800",
    accent: "text-amber-300",
    ring: "shadow-amber-500/20",
    glow: "245,158,11",
    save: "₹33/application",
    features: ["Premium Resume Lock", "3 Application Counts", "Email Invoice"],
  },
  {
    name: "Silver", price: 300, limit: 5, applications: "5 Internships / Month",
    tagline: "Most students pick this.",
    icon: Gem,
    popular: true,
    color: "from-slate-400 to-slate-700",
    accent: "text-slate-200",
    ring: "shadow-indigo-500/30",
    glow: "168,85,247",
    save: "Priority queue",
    features: ["Premium Resume Lock", "5 Application Counts", "Priority Email Invoice", "Faster Recruiter Visibility"],
  },
  {
    name: "Gold", price: 1000, limit: Infinity, applications: "Unlimited Internships",
    tagline: "Serious about landing fast.",
    icon: Crown,
    color: "from-yellow-400 via-amber-500 to-amber-600",
    accent: "text-yellow-300",
    ring: "shadow-yellow-500/25",
    glow: "234,179,8",
    save: "Best value",
    features: ["Premium Resume Lock", "Unlimited Counts", "Instant VIP Invoice", "24/7 Priority Support"],
  },
];
/* ── Countdown digit boxes ── */
const CountdownBoxes = ({ value, tone = "rose" }) => {
  const parts = String(value || "00:00:00").split(":");
  const labels = ["HRS", "MIN", "SEC"];
  const toneMap = {
    rose:    "border-rose-500/30 bg-rose-500/10 text-rose-200",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  };
  return (
    <div className="flex items-center gap-1.5">
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <div className={`flex min-w-[46px] flex-col items-center rounded-lg border px-2 py-1.5 ${toneMap[tone]}`}>
            <span key={p} className="cs-tick font-mono text-base font-black leading-none">{p}</span>
            <span className="mt-0.5 text-[8px] font-bold tracking-widest opacity-60">{labels[i]}</span>
          </div>
          {i < 2 && <span className="pb-3 text-sm font-black opacity-40">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── Compare table cell ── */
const CompareCell = ({ v }) => {
  if (v === true)  return <CheckCircle2 size={16} className="mx-auto text-emerald-400" />;
  if (v === false) return <Minus size={16} className="mx-auto text-gray-700" />;
  return <span className="text-xs font-semibold text-gray-300">{v}</span>;
};
/* Comparison table ke rows */
const compareRows = [
  { label: "Monthly Applications", values: ["1", "3", "5", "Unlimited"] },
  { label: "Access to Job Board",  values: [true, true, true, true] },
  { label: "Premium Resume Lock",  values: [false, true, true, true] },
  { label: "Email Invoice",        values: [false, true, true, true] },
  { label: "Priority Invoice",     values: [false, false, true, true] },
  { label: "Recruiter Visibility", values: ["Normal", "Normal", "High", "Highest"] },
  { label: "Support",              values: ["Standard", "Standard", "Priority", "24/7 VIP"] },
];

const howItWorks = [
  { step: "01", title: "Create Your Profile", desc: "Sign up with Google and complete your student profile in under 2 minutes." },
  { step: "02", title: "Build Premium Resume", desc: "Generate an ATS-optimized resume with our live canvas engine for just ₹50." },
  { step: "03", title: "Apply & Get Hired", desc: "1-click apply to verified openings and track every application status live." },
];

const featureList = [
  { icon: Zap, color: "text-indigo-400", title: "1-Click Apply", desc: "No complex forms. Setup your premium resume once and apply to multiple verified openings instantly." },
  { icon: ShieldCheck, color: "text-emerald-400", title: "100% Verified Listings", desc: "Say goodbye to spam. Every company on CareerSphere is strictly vetted by our operations crew." },
  { icon: Award, color: "text-purple-400", title: "ATS Optimization", desc: "Our layout blueprints ensure your tech-stack is highlighted exactly how parsers prefer it." },
  { icon: Headphones, color: "text-amber-400", title: "Human Support", desc: "Stuck at payment or resume? Real humans reply within hours, not bots with canned replies." },
];

const testimonials = [
  { name: "Aarav Mehta", role: "SDE Intern @ Razorpay", stars: 5, text: "The ATS Resume Engine is a lifesaver. Upgraded to Silver, built my resume, and got shortlisted within a week!" },
  { name: "Ananya Sharma", role: "UI/UX Intern @ Flipkart", stars: 5, text: "Amazing platform. The 10–11 AM payment window is unique, but the support team helped me upgrade seamlessly." },
  { name: "Rohit Verma", role: "Data Analyst Intern @ Zomato", stars: 5, text: "Zero spam listings. Every company I applied to actually replied. Worth every rupee of the Gold plan." },
  { name: "Sneha Iyer", role: "Marketing Intern @ Swiggy", stars: 4, text: "Category filters made it super easy to find WFH part-time roles that matched my college timetable." },
];


/* ══════════════════════════════════════════════════════════════
   🧮  HELPERS
══════════════════════════════════════════════════════════════ */
const pad = (n) => String(n).padStart(2, "0");

const getISTParts = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
  return { h: ist.getHours(), m: ist.getMinutes(), s: ist.getSeconds() };
};

const BIG_BRANDS = ["google", "microsoft", "amazon", "meta", "adobe", "flipkart", "razorpay", "zomato", "swiggy", "paytm", "tcs", "infosys", "wipro"];

const textOf = (job) =>
  [job.title, job.company, job.location, job.category, job.type,
   Array.isArray(job.skills) ? job.skills.join(" ") : job.skills]
    .filter(Boolean).join(" ").toLowerCase();

const matchesSearch = (job, q) => (!q.trim() ? true : textOf(job).includes(q.trim().toLowerCase()));

const matchesCategory = (job, cat) => {
  if (!cat || cat === "All") return true;
  const t = textOf(job);
  switch (cat) {
    case "Big Brands":      return BIG_BRANDS.some((b) => (job.company || "").toLowerCase().includes(b));
    case "Work From Home":  return /remote|work from home|wfh|virtual/.test(t);
    case "Part-time":       return /part.?time|flexible/.test(t);
    case "MBA":             return /mba|business|finance|hr|operations|marketing/.test(t);
    case "Engineering":     return /engineer|developer|software|sde|backend|frontend|full.?stack/.test(t);
    case "Media":           return /media|content|video|social|journal|editor/.test(t);
    case "Design":          return /design|ui|ux|graphic|figma|creative/.test(t);
    case "Data Science":    return /data|analyst|ml|machine learning|ai|python|analytics/.test(t);
    default:                return t.includes(cat.toLowerCase());
  }
};

const stipendValue = (job) => Number(String(job.stipend ?? job.salary ?? "0").replace(/[^\d]/g, "") || 0);

const sortInternships = (list, sortBy) => {
  const arr = [...list];
  if (sortBy === "stipend") return arr.sort((a, b) => stipendValue(b) - stipendValue(a));
  if (sortBy === "oldest")  return arr.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

const PLAN_LIMIT = { free: 1, bronze: 3, silver: 5, gold: Infinity };
const CARD_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
];

/* ══════════════════════════════════════════════════════════════
   🎨  GLOBAL STYLES (injected, no index.css edit needed)
══════════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
        /* ── PRICING FX ───────────────────────────── */
    @keyframes cs-aurora {
      0%,100% { transform: translate3d(0,0,0) scale(1); }
      33%     { transform: translate3d(40px,-30px,0) scale(1.15); }
      66%     { transform: translate3d(-30px,25px,0) scale(.92); }
    }
    .cs-aurora { animation: cs-aurora 14s ease-in-out infinite; }

    @keyframes cs-gradient-move {
      0%,100% { background-position: 0% 50%; }
      50%     { background-position: 100% 50%; }
    }
    .cs-glow-border { position: relative; }
    .cs-glow-border::before {
      content:''; position:absolute; inset:-1.5px; border-radius: inherit; padding:1.5px;
      background: linear-gradient(135deg,#818cf8,#c084fc,#f472b6,#fbbf24,#818cf8);
      background-size: 300% 300%;
      animation: cs-gradient-move 6s ease infinite;
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude;
      pointer-events:none;
    }

    .cs-spot { position: relative; }
    .cs-spot::after {
      content:''; position:absolute; inset:0; border-radius:inherit; opacity:0;
      transition: opacity .35s; pointer-events:none;
      background: radial-gradient(420px circle at var(--mx,50%) var(--my,50%),
                  rgba(var(--glow,99,102,241), .16), transparent 62%);
    }
    .cs-spot:hover::after { opacity:1; }

    .cs-shine { position:relative; overflow:hidden; }
    .cs-shine::after {
      content:''; position:absolute; top:0; left:-160%; width:55%; height:100%;
      background: linear-gradient(120deg, transparent, rgba(255,255,255,.38), transparent);
      transform: skewX(-22deg); animation: cs-shine 3.4s ease-in-out infinite;
    }
    @keyframes cs-shine { 0%{left:-160%} 55%{left:170%} 100%{left:170%} }

    @keyframes cs-pop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
    .cs-pop { animation: cs-pop .35s cubic-bezier(.34,1.56,.64,1) both; }

    @keyframes cs-tick { 0%{transform:translateY(-40%);opacity:0} 100%{transform:translateY(0);opacity:1} }
    .cs-tick { animation: cs-tick .35s ease both; }

    .cs-grid-bg {
      background-image:
        linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
      background-size: 46px 46px;
      mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%);
    }
    html { scroll-behavior: smooth; }
    @keyframes cs-marquee { from { transform: translateX(0);} to { transform: translateX(-50%);} }
    .cs-marquee { animation: cs-marquee 28s linear infinite; }
    .cs-marquee:hover { animation-play-state: paused; }
    .cs-noscroll::-webkit-scrollbar { display: none; }
    .cs-noscroll { -ms-overflow-style: none; scrollbar-width: none; }

    .cs-hero .swiper-pagination-bullet { background: rgba(255,255,255,.5); opacity:1; width:8px; height:8px; transition:.3s; }
    .cs-hero .swiper-pagination-bullet-active { background:#fff; width:26px; border-radius:9999px; }
    .cs-hero .swiper-button-next, .cs-hero .swiper-button-prev {
      color:#fff; background:rgba(0,0,0,.25); backdrop-filter:blur(6px);
      width:40px; height:40px; border-radius:9999px; transition:.25s;
    }
    .cs-hero .swiper-button-next:hover, .cs-hero .swiper-button-prev:hover { background:rgba(0,0,0,.55); }
    .cs-hero .swiper-button-next::after, .cs-hero .swiper-button-prev::after { font-size:15px; font-weight:800; }

    .cs-testi .swiper-pagination-bullet { background:#4b5563; opacity:1; }
    .cs-testi .swiper-pagination-bullet-active { background:#6366f1; width:22px; border-radius:9999px; }
    .cs-testi .swiper-slide { height:auto; }
  `}</style>
);

/* ══════════════════════════════════════════════════════════════
   🧩  SMALL UI PIECES  (module-level: re-render pe remount nahi honge)
══════════════════════════════════════════════════════════════ */
const SectionHeading = ({ eyebrow, title, subtitle, center }) => (
  <div className={`mb-8 ${center ? "mx-auto max-w-2xl text-center" : ""}`}>
    {eyebrow && (
      <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-300">
        {eyebrow}
      </span>
    )}
    <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">{title}</h2>
    {subtitle && <p className="mt-2 text-sm leading-relaxed text-gray-400">{subtitle}</p>}
  </div>
);

const CardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
    <div className="mb-4 flex items-center gap-3">
      <div className="h-12 w-12 rounded-xl bg-gray-800" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-gray-800" />
        <div className="h-2.5 w-1/2 rounded bg-gray-800/70" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-2.5 w-full rounded bg-gray-800/70" />
      <div className="h-2.5 w-5/6 rounded bg-gray-800/70" />
      <div className="h-2.5 w-2/3 rounded bg-gray-800/70" />
    </div>
    <div className="mt-5 h-10 w-full rounded-xl bg-gray-800" />
  </div>
);

/* ── Internship Card ──
   NOTE: agar tumhara apna InternshipCard use karna ho to
   upar import kar lo aur neeche <JobCard/> ki jagah use kar lena. */
const JobCard = ({ internship, userSubscription, hasPremiumResume, totalAppliedCount = 0, onApplied }) => {
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(!!internship.alreadyApplied);
  const [msg, setMsg] = useState("");

  
  const limit = PLAN_LIMIT[(userSubscription || "free").toLowerCase()] ?? 1;
  const limitReached = totalAppliedCount >= limit;
  const needsResume = !hasPremiumResume;

  const gradient = CARD_GRADIENTS[(internship.company?.length || 3) % CARD_GRADIENTS.length];
  const logo = (internship.company || "C").charAt(0).toUpperCase();

  const handleApply = async () => {
    if (applied || applying) return;
    if (needsResume) return navigate("/resume");
    if (limitReached) return setMsg("Monthly limit reached — upgrade your plan.");
    try {
      setApplying(true); setMsg("");
      const token = localStorage.getItem("token");
      // 🔧 apne backend route ke hisaab se adjust kar lena
      await axios.post(`${API}/api/internships/${internship._id}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplied(true); setMsg("Applied successfully 🎉");
      onApplied?.();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Apply failed. Try again.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/30">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-600/0 blur-3xl transition-all duration-500 group-hover:bg-indigo-600/20" />

      <div className="relative mb-4 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400">
        <ArrowUpRight size={13} /> Actively Hiring
      </div>

      <div className="relative mb-4 flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-lg font-black text-white shadow-lg`}>
          {logo}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-white transition group-hover:text-indigo-300">
            {internship.title}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
            <Building2 size={12} /> {internship.company}
          </p>
        </div>
      </div>

      <div className="relative space-y-2 text-xs text-gray-400">
        <p className="flex items-center gap-2"><MapPin size={13} className="text-gray-600" />{internship.location || "Remote"}</p>
        <p className="flex items-center gap-2"><IndianRupee size={13} className="text-gray-600" />{internship.stipend || internship.salary || "Not disclosed"}</p>
        <p className="flex items-center gap-2"><CalendarDays size={13} className="text-gray-600" />{internship.duration || "Flexible"}</p>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-gray-800/80 px-2 py-1 text-[10px] font-semibold text-gray-400">
          {internship.type || "Internship"}
        </span>
        {(Array.isArray(internship.skills) ? internship.skills : []).slice(0, 2).map((s) => (
          <span key={s} className="rounded-md bg-indigo-500/10 px-2 py-1 text-[10px] font-semibold text-indigo-300">{s}</span>
        ))}
      </div>

      {msg && (
        <p className={`relative mt-3 rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${applied ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
          {msg}
        </p>
      )}

      <div className="relative mt-5 flex items-center gap-2 border-t border-gray-800 pt-4">
        <button
          onClick={handleApply}
          disabled={applied || applying}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider transition active:scale-95 ${
            applied ? "cursor-default bg-emerald-600/90 text-white"
            : needsResume || limitReached ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
            : "bg-indigo-600 text-white hover:bg-indigo-500"
          }`}
        >
          {applying ? (<><span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />Applying</>)
            : applied ? (<><CheckCircle2 size={13} /> Applied</>)
            : needsResume ? (<><Lock size={12} /> Resume Required</>)
            : limitReached ? (<><Lock size={12} /> Limit Reached</>)
            : "Apply Now"}
        </button>

        <button
          onClick={() => navigate(`/internship/${internship._id}`)}
          className="flex items-center gap-1 rounded-xl border border-gray-700 px-3 py-2.5 text-[11px] font-semibold text-gray-300 transition hover:border-indigo-500 hover:text-white"
        >
          View details <ChevronRight size={13} />
        </button>
      </div>
    </article>
  );
};

/* ══════════════════════════════════════════════════════════════
   🏠  HOME
══════════════════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();

  // data
  
  const [internships, setInternships] = useState([]);
  const [user, setUser] = useState(null);
  const [hasPremiumResume, setHasPremiumResume] = useState(false);
  const [totalAppliedCount, setTotalAppliedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // payment window
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [countdown, setCountdown] = useState("00:00:00");

  // subscription
  const [subLoading, setSubLoading] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
 const [priceView, setPriceView] = useState("cards");
   
  const [dynamicCats, setDynamicCats] = useState([]);   // 🆕 DB se
  const [appliedIds, setAppliedIds] = useState([]);

  /* ── Fetch data ── */
  
   /* ── Fetch internships (category ke hisaab se) ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      /* query banao */
      const q = new URLSearchParams({ postType: "internship", limit: "6", sort: "latest" });
      const quick = QUICK_FILTERS.find((x) => x.label === activeCategory);
      if (quick?.param) q.set(quick.param, "true");
      else if (activeCategory !== "All") q.set("category", activeCategory);
      if (searchQuery.trim()) q.set("search", searchQuery.trim());

      const reqs = [
        axios.get(`${API}/api/internships?${q.toString()}`),
        axios.get(`${API}/api/internships/filters/meta?postType=internship`),
      ];
      if (token) {
        const h = { headers: { Authorization: `Bearer ${token}` } };
        reqs.push(axios.get(`${API}/api/user/profile`, h));
        reqs.push(axios.get(`${API}/api/application/my`, h));
      }

      const [resJobs, resMeta, resUser, resApps] = await Promise.allSettled(reqs);

      if (resJobs.status === "fulfilled") {
        setInternships(resJobs.value.data.internships || []);
      } else {
        setInternships([]);
      }

      if (resMeta.status === "fulfilled") {
        setDynamicCats(resMeta.value.data.meta?.categories || []);
      }

      if (resUser?.status === "fulfilled") {
        const d = resUser.value.data;
        setUser(d.user || null);
        setHasPremiumResume(!!d.resume);
        setTotalAppliedCount(d.user?.monthlyApplicationsCount ?? 0);
      }

      if (resApps?.status === "fulfilled") {
        setAppliedIds(
          (resApps.value.data.applications || []).map((a) => a.internshipId?._id || a.internshipId)
        );
      }
    } catch (e) {
      console.error("Home data error:", e);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  /* debounce */
  useEffect(() => {
    const t = setTimeout(fetchData, searchQuery ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchData]);
  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Payment window + live countdown (IST safe) ── */
  useEffect(() => {
    const tick = () => {
      const { h, m, s } = getISTParts();
      const open = h >= 10 && h < 11;
      setIsWindowOpen(open);

      const nowSecs = h * 3600 + m * 60 + s;
      const target = open ? 11 * 3600 : 10 * 3600;
      let diff = target - nowSecs;
      if (diff < 0) diff += 86400;
      setCountdown(`${pad(Math.floor(diff / 3600))}:${pad(Math.floor((diff % 3600) / 60))}:${pad(diff % 60)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Filter + sort ── */
  const filteredInternships = useMemo(() => {
    const list = internships.filter(
      (j) => matchesSearch(j, searchQuery) && matchesCategory(j, activeCategory)
    );
    return sortInternships(list, sortBy);
  }, [internships, searchQuery, activeCategory, sortBy]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [searchQuery, activeCategory, sortBy]);

  /* ── Razorpay subscription (same logic) ── */
  const handleSubscription = async (planName) => {
    if (planName === "Free") return;
    try {
      setSubLoading(planName);
      setStatusMessage("");
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        `${API}/api/subscriptions/create-order`,
        { plan: planName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: RAZORPAY_KEY,
        amount: data.order.amount,
        currency: "INR",
        name: "CareerSphere",
        description: `Upgrading to ${planName} Plan`,
        order_id: data.order.id,
        prefill: { name: user?.name || "", email: user?.email || "" },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${API}/api/subscriptions/verify-payment`,
              { plan: planName, razorpayResponse: response },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatusMessage(`🎉 Success! ${verifyRes.data.message}`);
            fetchData();
          } catch {
            setStatusMessage("❌ Payment verification failed!");
          }
        },
        modal: { ondismiss: () => setSubLoading(null) },
        theme: { color: "#4f46e5" },
      };
      new window.Razorpay(options).open();
    } catch {
      setStatusMessage("❌ Something went wrong with the subscription order!");
    } finally {
      setSubLoading(null);
    }
  };

  const goTo = (href) => {
    if (href.startsWith("#")) document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    else navigate(href);
  };

  /* ── Applications progress ── */
  const planObj = plans.find((p) => p.name.toLowerCase() === (user?.subscription || "free").toLowerCase()) || plans[0];
  const usedPct = planObj.limit === Infinity ? 100 : Math.min((totalAppliedCount / planObj.limit) * 100, 100);

  /* ── Loader ── */
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-500 border-b-purple-500" />
          <div className="absolute inset-3 animate-pulse rounded-full bg-indigo-500/20" />
        </div>
        <p className="mt-5 animate-pulse text-sm font-medium tracking-wide text-gray-400">
          Setting up your career cockpit...
        </p>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div id="top" className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black font-sans text-white selection:bg-indigo-500 selection:text-white">
      <GlobalStyles />

      {/* ═════════ 1. HERO CAROUSEL ═════════ */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Make your dream career a{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">reality</span>
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-gray-400">
            Trending on internArea <Flame size={15} className="text-orange-500" />
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectCreative]}
          loop speed={800}
          autoplay={{ delay: 4200, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          effect="creative"
          creativeEffect={{
            prev: { shadow: true, translate: ["-20%", 0, -1], opacity: 0.4 },
            next: { translate: ["100%", 0, 0] },
          }}
          className="cs-hero overflow-hidden rounded-3xl"
        >
          {heroSlides.map((s) => (
            <SwiperSlide key={s.id}>
              <div className={`relative flex h-[260px] items-center justify-center bg-gradient-to-br sm:h-[320px] md:h-[380px] ${s.gradient}`}>
                <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:18px_18px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                <div className="relative z-10 max-w-2xl px-6 text-center">
                  <span className="mb-4 inline-block rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur">
                    {s.tag}
                  </span>
                  <h2 className="text-2xl font-black leading-tight drop-shadow sm:text-4xl md:text-5xl">{s.title}</h2>
                  <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-white/85 sm:text-sm">{s.subtitle}</p>
                  <button
                    onClick={() => goTo(s.href)}
                    className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-900 shadow-xl transition hover:gap-3 hover:bg-gray-100 active:scale-95"
                  >
                    {s.cta} <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ═════════ 2. HERO + RESUME CTA ═════════ */}
      <section className="relative mt-10 overflow-hidden border-b border-gray-800/80">
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[120px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:justify-between lg:py-20">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
              <Sparkles size={13} /> Ultimate Career Hub
            </div>

            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Get Internships & Build <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ATS-Friendly Resumes
              </span>
            </h2>

            <p className="text-base leading-relaxed text-gray-400">
              Apply to verified high-growth tech internships, instantly structure your
              credentials using our premium tool, and fast-track your career.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { v: `${internships.length}+`, l: "Internships Open", c: "text-indigo-400" },
                { v: "₹50", l: "Per Premium CV", c: "text-emerald-400" },
                { v: user?.subscription || "Free", l: "Your Current Plan", c: "text-purple-400" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-3.5 backdrop-blur transition hover:-translate-y-0.5 hover:border-gray-700">
                  <p className={`text-xl font-black sm:text-2xl ${s.c}`}>{s.v}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> 100% Verified Companies</span>
              <span className="inline-flex items-center gap-1.5"><Zap size={14} className="text-indigo-400" /> 1-Click Apply</span>
            </div>
          </div>

          <div className="group relative w-full rounded-3xl border border-gray-700/70 bg-gradient-to-br from-gray-800/90 to-gray-900 p-7 shadow-2xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-indigo-500/50 lg:w-[380px]">
            <div className="absolute -right-2 -top-3 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black shadow-lg">
              Pro Feature
            </div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-600/20 text-indigo-400 transition group-hover:scale-110">
              <FileText size={22} />
            </div>
            <h3 className="mb-2 text-lg font-bold">Instant ATS Resume Engine</h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Generate a recruiter-approved modern resume layout with a live automated canvas preview.
            </p>
            <button
              onClick={() => navigate("/resume")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-bold shadow-lg shadow-indigo-600/25 transition hover:gap-3 hover:from-indigo-600 hover:to-purple-700 active:scale-95"
            >
              {hasPremiumResume ? "Update Your Resume" : "Create Premium Resume"} <ArrowRight size={16} />
            </button>
            {hasPremiumResume && (
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 py-1.5 text-[11px] font-semibold text-emerald-400">
                <UserCheck size={13} /> Live Resume Active in Profile
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═════════ 3. USER STATS STRIP ═════════ */}
      {user && (
        <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 backdrop-blur">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { icon: Crown, label: "Active Plan", value: user?.subscription || "Free", color: "text-amber-400" },
                { icon: Send, label: "Applications Used",
                  value: planObj.limit === Infinity ? `${totalAppliedCount} / ∞` : `${Math.min(totalAppliedCount, planObj.limit)} / ${planObj.limit}`,
                  color: "text-indigo-400" },
                { icon: FileCheck2, label: "Premium Resume", value: hasPremiumResume ? "Active" : "Not Created",
                  color: hasPremiumResume ? "text-emerald-400" : "text-rose-400" },
                { icon: Timer, label: isWindowOpen ? "Window closes in" : "Window opens in", value: countdown,
                  color: isWindowOpen ? "text-emerald-400" : "text-rose-400" },
              ].map((it) => (
                <div key={it.label} className="flex items-center gap-3 rounded-xl px-2 py-1.5">
                  <div className={`rounded-xl bg-gray-800/80 p-2.5 ${it.color}`}><it.icon size={17} /></div>
                  <div className="min-w-0">
                    <p className="truncate text-[10px] uppercase tracking-wider text-gray-500">{it.label}</p>
                    <p className={`truncate text-sm font-bold ${it.color}`}>{it.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700" style={{ width: `${usedPct}%` }} />
            </div>
          </div>
        </section>
      )}

      {/* ═════════ 4. SEARCH & SORT BAR ═════════ */}
      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
        <div className="sticky top-3 z-30 flex flex-col items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/80 p-3 shadow-xl backdrop-blur-xl md:flex-row">
          <div className="relative w-full flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={17} />
            <input
              type="text"
              placeholder="Search role, company, skill (e.g. React, Frontend, Remote)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 py-3 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:bg-gray-800 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-gray-800 bg-gray-950 py-3 pl-9 pr-8 text-xs font-medium text-gray-300 outline-none focus:border-indigo-500"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="stipend">Highest Stipend</option>
              </select>
            </div>

            <span className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-950 px-3 py-3 text-[11px] font-semibold text-gray-400">
              <MapPin size={13} className="text-indigo-400" /> {filteredInternships.length} Results
            </span>

            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); setSortBy("latest"); }}
              className="shrink-0 rounded-xl border border-gray-800 bg-gray-950 px-3 py-3 text-[11px] font-semibold text-gray-400 transition hover:border-rose-500/40 hover:text-rose-400"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

            {/* ═════════ 5. INTERNSHIPS + DYNAMIC CATEGORY CHIPS ═════════ */}
      <section id="internships" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-extrabold sm:text-3xl">
              <span className="rounded-xl bg-indigo-600/15 p-2 text-indigo-400"><Briefcase size={22} /></span>
              Latest Internships on CareerSphere
            </h2>
            <p className="mt-1.5 text-sm text-gray-400">Handpicked roles optimized for your active profile tier.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-800 bg-gray-900 px-4 py-1.5 text-[11px] font-semibold text-gray-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live Feed
            </span>
            <button
              onClick={() => navigate("/internships")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition hover:opacity-90 active:scale-95"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* ── DYNAMIC CHIPS ── */}
        <div className="cs-noscroll mb-8 flex items-center gap-2.5 overflow-x-auto pb-2">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Categories:
          </span>

          {/* quick filters */}
          {QUICK_FILTERS.map((q) => (
            <button
              key={q.key}
              onClick={() => setActiveCategory(q.label)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                activeCategory === q.label
                  ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "border-gray-800 bg-gray-900/70 text-gray-400 hover:border-indigo-500/50 hover:text-white"
              }`}
            >
              {q.label}
            </button>
          ))}

          {dynamicCats.length > 0 && <span className="h-5 w-px shrink-0 bg-gray-800" />}

          {/* DB se aayi real categories */}
          {dynamicCats.slice(0, 12).map((c) => (
            <button
              key={c.name}
              onClick={() => setActiveCategory(activeCategory === c.name ? "All" : c.name)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                activeCategory === c.name
                  ? "border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "border-gray-800 bg-gray-900/70 text-gray-400 hover:border-purple-500/50 hover:text-white"
              }`}
            >
              {c.name}
              <span className="ml-1.5 text-[9px] opacity-60">{c.count}</span>
            </button>
          ))}
        </div>

        {/* ── GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : internships.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-800 bg-gray-900/50 p-16 text-center">
            <Inbox className="mx-auto mb-4 text-gray-700" size={44} />
            <h4 className="text-base font-bold text-gray-300">
              {activeCategory === "All"
                ? "No internships posted yet"
                : `No internships in "${activeCategory}"`}
            </h4>
            <p className="mt-1 text-xs text-gray-500">
              {activeCategory === "All"
                ? "Admin ne abhi tak koi internship publish nahi ki."
                : "Doosri category try karo ya sab dekho."}
            </p>
            {activeCategory !== "All" && (
              <button
                onClick={() => setActiveCategory("All")}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider hover:bg-indigo-500"
              >
                Show All
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {internships.map((internship) => (
                <InternshipCard
                  key={internship._id}
                  internship={internship}
                  user={user}
                  userSubscription={user?.subscription}
                  hasPremiumResume={hasPremiumResume}
                  totalAppliedCount={totalAppliedCount}
                  alreadyApplied={appliedIds.includes(internship._id)}
                  onApplied={fetchData}
                />
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={() =>
                  navigate(
                    activeCategory === "All"
                      ? "/internships"
                      : `/internships?category=${encodeURIComponent(activeCategory)}`
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-7 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:border-indigo-500 hover:text-white active:scale-95"
              >
                Explore All Internships <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </section>

      {/* ═════════ 6. TRUSTED MARQUEE ═════════ */}
      <section className="border-y border-gray-800/70 bg-gray-900/30 py-7">
        <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
          Trusted by students hired at
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="cs-marquee flex w-max gap-14">
            {[...trustedCompanies, ...trustedCompanies].map((c, i) => (
              <span key={i} className="shrink-0 text-lg font-black tracking-tight text-gray-700 transition hover:text-gray-400">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ 7. HOW IT WORKS ═════════ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading center eyebrow="How it works" title="Three steps to your first offer"
          subtitle="Simple, fast and built for students who don't have time to waste." />
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent md:block" />
          {howItWorks.map((s) => (
            <div key={s.step} className="group relative rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-center backdrop-blur transition hover:-translate-y-1 hover:border-indigo-500/50">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gray-950 text-sm font-black text-indigo-400 transition group-hover:bg-indigo-600 group-hover:text-white">
                {s.step}
              </div>
              <h4 className="mb-2 text-base font-bold">{s.title}</h4>
              <p className="text-xs leading-relaxed text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════ 8. FEATURES ═════════ */}
      <section className="border-y border-gray-800 bg-gray-900/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading center eyebrow="Why CareerSphere" title="Supercharge your career journey"
            subtitle="Everything you need to break into the tech ecosystem instantly." />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureList.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-gray-800/80 bg-gray-900/60 p-6 transition duration-300 hover:-translate-y-1.5 hover:border-gray-700 hover:bg-gray-900">
                <f.icon className={`${f.color} mb-4 transition group-hover:scale-110`} size={28} />
                <h4 className="mb-2 text-base font-bold">{f.title}</h4>
                <p className="text-xs leading-relaxed text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* ═════════ 9. PRICING — PREMIUM EDITION ═════════ */}
      <section id="pricing" className="relative overflow-hidden py-20">
        {/* Aurora + grid background */}
        <div className="pointer-events-none absolute inset-0 cs-grid-bg" />
        <div className="cs-aurora pointer-events-none absolute -top-32 left-[12%] h-80 w-80 rounded-full bg-indigo-600/25 blur-[110px]" />
        <div className="cs-aurora pointer-events-none absolute top-40 right-[8%] h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[130px]" style={{ animationDelay: "-5s" }} />
        <div className="cs-aurora pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-500/10 blur-[120px]" style={{ animationDelay: "-9s" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">

          {/* ── Heading ── */}
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300 backdrop-blur">
              <Sparkles size={12} /> Pricing
            </span>

            <h2 className="text-3xl font-black leading-[1.15] tracking-tight sm:text-5xl">
              Upgrade Your{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Career Multiplier
                </span>
                <svg className="absolute -bottom-1.5 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="url(#pg)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="pg" x1="0" x2="200">
                      <stop stopColor="#818cf8" /><stop offset=".5" stopColor="#c084fc" /><stop offset="1" stopColor="#f472b6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-gray-400">
              Unlock premium application locks, priority recruiter visibility and clear
              every restriction instantaneously.
            </p>

            {/* Gateway status */}
            <div
              className={`mx-auto mt-8 flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl border p-4 backdrop-blur-xl sm:flex-row sm:justify-between ${
                isWindowOpen
                  ? "border-emerald-500/40 bg-emerald-500/[0.07] shadow-lg shadow-emerald-900/20"
                  : "border-rose-500/40 bg-rose-500/[0.07] shadow-lg shadow-rose-900/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`relative flex h-2.5 w-2.5 ${isWindowOpen ? "" : "opacity-80"}`}>
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isWindowOpen ? "bg-emerald-400" : "bg-rose-400"} opacity-75`} />
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isWindowOpen ? "bg-emerald-500" : "bg-rose-500"}`} />
                </span>
                <div className="text-left">
                  <p className={`text-xs font-black uppercase tracking-wider ${isWindowOpen ? "text-emerald-300" : "text-rose-300"}`}>
                    Gateway {isWindowOpen ? "Open" : "Closed"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {isWindowOpen ? "Closes in" : "Daily window 10–11 AM IST • Opens in"}
                  </p>
                </div>
              </div>
              <CountdownBoxes value={countdown} tone={isWindowOpen ? "emerald" : "rose"} />
            </div>

            {statusMessage && (
              <div className="cs-pop mx-auto mt-4 max-w-lg rounded-xl border border-emerald-500/50 bg-emerald-950/50 p-3.5 text-xs font-medium text-emerald-200 backdrop-blur">
                {statusMessage}
              </div>
            )}

            {/* View toggle */}
            <div className="mt-8 inline-flex rounded-xl border border-gray-800 bg-gray-900/70 p-1 backdrop-blur">
              {[
                { k: "cards", label: "Plan Cards", icon: LayoutGrid },
                { k: "compare", label: "Compare All", icon: Table2 },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setPriceView(t.k)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition ${
                    priceView === t.k
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <t.icon size={13} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── CARDS VIEW ── */}
          {priceView === "cards" ? (
            <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {plans.map((plan, idx) => {
                const isCurrentPlan =
                  user?.subscription?.toLowerCase() === plan.name.toLowerCase() ||
                  (plan.name === "Free" && !user?.subscription);
                const disabled =
                  plan.name === "Free" || subLoading === plan.name || !isWindowOpen || isCurrentPlan;
                const Icon = plan.icon;

                return (
                  <div
                    key={plan.name}
                    onMouseMove={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                      e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                    }}
                    style={{ "--glow": plan.glow, animationDelay: `${idx * 70}ms` }}
                    className={`cs-spot group relative flex flex-col rounded-[1.35rem] border bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl transition-all duration-300 ${
                      plan.popular ? "cs-glow-border lg:-mt-4 lg:mb-4 lg:scale-[1.045] z-10" : ""
                    } ${
                      isCurrentPlan
                        ? "border-indigo-500 shadow-2xl shadow-indigo-600/20"
                        : `border-gray-800 hover:-translate-y-2 hover:border-gray-700 hover:shadow-2xl ${plan.ring}`
                    }`}
                  >
                    {/* Ribbons */}
                    {isCurrentPlan && (
                      <span className="cs-pop absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-indigo-600/40">
                        ✓ Your Current Plan
                      </span>
                    )}
                    {plan.popular && !isCurrentPlan && (
                      <span className="cs-pop absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-black shadow-lg shadow-orange-500/40">
                        🔥 Most Popular
                      </span>
                    )}

                    {/* Header */}
                    <div className="relative overflow-hidden rounded-t-[1.35rem] p-6 pb-5">
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-[0.16] ${plan.color}`} />
                      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/[0.06] blur-2xl" />

                      <div className="relative">
                        <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition duration-300 group-hover:scale-110 group-hover:rotate-6 ${plan.color}`}>
                          <Icon size={19} className="text-white drop-shadow" />
                        </div>

                        <h3 className="text-base font-black uppercase tracking-wider text-white">{plan.name}</h3>
                        <p className="mt-0.5 text-[11px] text-gray-500">{plan.tagline}</p>

                        <div className="mt-4 flex items-end gap-1">
                          <span className="text-[15px] font-bold text-gray-400">₹</span>
                          <span className={`text-4xl font-black leading-none tracking-tight ${plan.accent}`}>
                            {plan.price}
                          </span>
                          <span className="pb-1 text-[11px] font-medium text-gray-500">/month</span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold text-white/85">
                            <Send size={10} /> {plan.applications}
                          </span>
                          {plan.save && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-300">
                              <TrendingUp size={10} /> {plan.save}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

                    {/* Features + CTA */}
                    <div className="flex flex-grow flex-col justify-between p-6 pt-5">
                      <ul className="mb-7 space-y-3">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[12px] leading-snug text-gray-300">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
                              <CheckCircle2 size={11} className="text-indigo-400" />
                            </span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleSubscription(plan.name)}
                        disabled={disabled}
                        className={`group/btn relative w-full overflow-hidden rounded-xl py-3.5 text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-300 ${
                          isCurrentPlan
                            ? "cursor-default bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                            : plan.name === "Free"
                            ? "cursor-not-allowed border border-gray-800 bg-gray-900 text-gray-600"
                            : !isWindowOpen
                            ? "cursor-not-allowed border border-gray-800 bg-gray-900/60 text-gray-600"
                            : `cs-shine bg-gradient-to-r text-white shadow-lg hover:shadow-xl active:scale-[.97] ${
                                plan.name === "Gold"
                                  ? "from-yellow-500 to-amber-600 shadow-amber-600/30"
                                  : plan.name === "Silver"
                                  ? "from-indigo-500 to-purple-600 shadow-indigo-600/30"
                                  : "from-amber-600 to-orange-700 shadow-amber-700/30"
                              }`
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-1.5">
                          {subLoading === plan.name ? (
                            <>
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Processing...
                            </>
                          ) : isCurrentPlan ? (
                            <><BadgeCheck size={13} /> Active Tier</>
                          ) : plan.name === "Free" ? (
                            "Default Access"
                          ) : !isWindowOpen ? (
                            <><Lock size={12} /> Locked</>
                          ) : (
                            <>
                              <Rocket size={13} /> Buy Upgrade
                              <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-1" />
                            </>
                          )}
                        </span>
                      </button>

                      {!isCurrentPlan && plan.name !== "Free" && (
                        <p className="mt-2.5 text-center text-[9.5px] text-gray-600">
                          One-time payment • Instant activation
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── COMPARE TABLE VIEW ── */
            <div className="cs-pop overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-950/60">
                      <th className="p-5 text-left text-[11px] font-black uppercase tracking-wider text-gray-500">
                        Features
                      </th>
                      {plans.map((p) => {
                        const cur =
                          user?.subscription?.toLowerCase() === p.name.toLowerCase() ||
                          (p.name === "Free" && !user?.subscription);
                        return (
                          <th key={p.name} className="p-5 text-center">
                            <div className={`mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${p.color}`}>
                              <p.icon size={15} className="text-white" />
                            </div>
                            <div className="text-sm font-black text-white">{p.name}</div>
                            <div className={`text-[11px] font-bold ${p.accent}`}>₹{p.price}</div>
                            {cur && (
                              <span className="mt-1 inline-block rounded-full bg-indigo-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-indigo-300">
                                Current
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((row, i) => (
                      <tr key={row.label} className={`border-b border-gray-800/60 transition hover:bg-indigo-500/[0.04] ${i % 2 ? "bg-gray-950/25" : ""}`}>
                        <td className="p-4 pl-5 text-xs font-semibold text-gray-300">{row.label}</td>
                        {row.values.map((v, j) => (
                          <td key={j} className="p-4 text-center">
                            <CompareCell v={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="p-5" />
                      {plans.map((p) => {
                        const cur =
                          user?.subscription?.toLowerCase() === p.name.toLowerCase() ||
                          (p.name === "Free" && !user?.subscription);
                        const dis = p.name === "Free" || subLoading === p.name || !isWindowOpen || cur;
                        return (
                          <td key={p.name} className="p-4 text-center">
                            <button
                              onClick={() => handleSubscription(p.name)}
                              disabled={dis}
                              className={`w-full rounded-lg px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition ${
                                cur ? "cursor-default bg-emerald-600 text-white"
                                : dis ? "cursor-not-allowed border border-gray-800 bg-gray-900 text-gray-600"
                                : "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95"
                              }`}
                            >
                              {subLoading === p.name ? "..." : cur ? "Active" : dis ? "Locked" : "Upgrade"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Trust strip ── */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: ShieldCheck, text: "256-bit Secure Payments", c: "text-emerald-400" },
              { icon: Wallet, text: "UPI • Cards • NetBanking", c: "text-indigo-400" },
              { icon: Zap, text: "Instant Plan Activation", c: "text-amber-400" },
              { icon: Headphones, text: "Human Support in Hours", c: "text-purple-400" },
            ].map((t) => (
              <div
                key={t.text}
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-2.5 text-[11px] font-semibold text-gray-400 backdrop-blur transition hover:-translate-y-0.5 hover:border-gray-700 hover:text-gray-200"
              >
                <t.icon size={14} className={t.c} /> {t.text}
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[11px] text-gray-600">
            Powered by <span className="font-bold text-gray-400">Razorpay</span> · GST invoice
            emailed automatically · Need help?{" "}
            <a href="mailto:support@careersphere.com" className="font-semibold text-indigo-400 hover:underline">
              support@careersphere.com
            </a>
          </p>
        </div>
      </section>

      {/* ═════════ 10. TESTIMONIALS ═════════ */}
      <section className="mx-auto max-w-7xl border-t border-gray-800 px-4 py-16 sm:px-6">
        <SectionHeading center eyebrow="Testimonials" title="Loved by thousands of students"
          subtitle="See how CareerSphere is changing early-career paths." />
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24} slidesPerView={1} loop
          autoplay={{ delay: 3800, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          className="cs-testi pb-12"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i} className="h-auto">
              <div className="relative h-full rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-indigo-500/40">
                <Quote className="absolute right-5 top-5 text-gray-800" size={34} />
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={15} className={s < t.stars ? "fill-amber-400 text-amber-400" : "text-gray-700"} />
                  ))}
                </div>
                <p className="mb-5 text-sm italic leading-relaxed text-gray-300">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-black">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">{t.name}</h5>
                    <p className="text-[11px] text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

     

  
    </div>
  );
};

export default Home;