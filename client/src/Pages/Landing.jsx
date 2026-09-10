import { Link, Navigate } from "react-router-dom";
import { Briefcase, FileText, Users, Crown, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function Landing() {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/home" replace />;   // logged-in → dashboard

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      {/* NAV */}
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-extrabold">intern<span className="text-indigo-400">Area</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/internships" className="hidden rounded-xl px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white sm:block">
            Browse Internships
          </Link>
          <Link to="/login" className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-200 hover:border-zinc-500">
            Login
          </Link>
          <Link to="/register" className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold shadow-lg shadow-indigo-900/40">
            Sign up free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-300">
          <Sparkles size={12} /> India's Career Platform
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Make your dream career a{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            reality
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
         Verified internships, ATS-friendly resumes, and a professional network — everything you need, all in one place.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/internships" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3.5 text-sm font-black shadow-xl shadow-indigo-900/40 transition hover:opacity-90">
            Explore Internships <ArrowRight size={16} />
          </Link>
          <Link to="/register" className="rounded-2xl border border-zinc-700 px-7 py-3.5 text-sm font-bold text-zinc-200 transition hover:border-zinc-500">
            Create free account
          </Link>
        </div>
        <p className="mt-4 text-[11px] text-zinc-600">No credit card required · Free plan includes 1 application/month</p>
      </section>

      {/* FEATURES */}
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {[
          { icon: Briefcase, t: "Verified Internships", d: "Hand-picked opportunities with stipend transparency.", to: "/internships" },
          { icon: FileText, t: "ATS Resume Builder", d: "Recruiter-approved templates. Instant PDF at ₹50.", to: "/resume" },
          { icon: Users, t: "Professional Network", d: "Connect, share posts, and grow together.", to: "/register" },
          { icon: Crown, t: "Career Plans", d: "Apply more with Bronze, Silver & Gold tiers.", to: "/pricing" },
        ].map((f) => (
          <Link key={f.t} to={f.to}
            className="group rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-indigo-500/40">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400 transition group-hover:scale-110">
              <f.icon size={20} />
            </div>
            <h3 className="text-sm font-black">{f.t}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{f.d}</p>
          </Link>
        ))}
      </section>

      {/* SOCIAL PROOF / CTA */}
      <section className="border-t border-zinc-800/60 bg-zinc-900/20 py-16 text-center">
        <h2 className="text-2xl font-black sm:text-3xl">Ready to start? 🚀</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
          Join thousands of students building their careers on internArea.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] text-zinc-400">
          {["Free forever plan", "Verified companies", "Instant apply"].map((x) => (
            <span key={x} className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
              <CheckCircle2 size={11} className="text-emerald-400" /> {x}
            </span>
          ))}
        </div>
        <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-sm font-black shadow-xl shadow-indigo-900/40 transition hover:opacity-90">
          Get Started — It's Free <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}