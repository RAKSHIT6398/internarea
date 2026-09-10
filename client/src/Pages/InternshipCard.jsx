import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, IndianRupee, CalendarDays, Users, ArrowUpRight, Building2,
  ChevronRight, CheckCircle2, Clock, Crown, Bookmark, Zap, Flame,
} from "lucide-react";
import ApplyModal from "../components/ApplyModal";

const GRADS = [
  "from-indigo-500 to-purple-600", "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600", "from-sky-500 to-blue-600", "from-fuchsia-500 to-pink-600",
];

const InternshipCard = ({
  internship, user, userSubscription, hasPremiumResume,
  totalAppliedCount = 0, alreadyApplied = false, onApplied, compact = false,
}) => {
  const navigate = useNavigate();
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(alreadyApplied || internship?.alreadyApplied);
  const [saved, setSaved] = useState(() =>
    JSON.parse(localStorage.getItem("savedJobs") || "[]").includes(internship?._id)
  );

  if (!internship) return null;

  const grad = GRADS[(internship.companyName?.length || 3) % GRADS.length];
  const logoTxt = (internship.companyName || internship.company || "C")[0].toUpperCase();
  const daysLeft = internship.deadline
    ? Math.ceil((new Date(internship.deadline) - new Date()) / 86400000) : null;
  const expired = daysLeft !== null && daysLeft <= 0;
  const detailUrl = `/internships/${internship._id}`;

  const toggleSave = (e) => {
    e.stopPropagation();
    const list = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    const next = saved ? list.filter((i) => i !== internship._id) : [...list, internship._id];
    localStorage.setItem("savedJobs", JSON.stringify(next));
    setSaved(!saved);
  };

  return (
    <>
      <article
        onClick={() => navigate(detailUrl)}
        className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/30"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-600/0 blur-3xl transition-all duration-500 group-hover:bg-indigo-600/20" />

        <div className="relative mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {internship.isActivelyHiring !== false && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400">
                <ArrowUpRight size={12} /> Actively Hiring
              </span>
            )}
            {internship.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-400">
                <Flame size={9} /> Featured
              </span>
            )}
          </div>
          <button
            onClick={toggleSave}
            className={`rounded-lg p-1.5 transition ${saved ? "bg-indigo-500/20 text-indigo-400" : "text-gray-600 hover:bg-gray-800 hover:text-gray-300"}`}
          >
            <Bookmark size={14} className={saved ? "fill-indigo-400" : ""} />
          </button>
        </div>

        <div className="relative mb-4 flex items-start gap-3">
          {internship.companyLogo ? (
            <img
              src={internship.companyLogo}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-1"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-lg font-black text-white shadow-lg`}>
              {logoTxt}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-bold text-white transition group-hover:text-indigo-300">{internship.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
              <Building2 size={11} /> {internship.companyName || internship.company}
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-y-2.5 gap-x-3 border-y border-gray-800/70 py-3.5 text-xs">
          {[
            { i: MapPin, l: "Location", v: internship.location, c: "text-gray-300" },
            { i: IndianRupee, l: "Stipend", v: internship.stipend, c: "text-emerald-400" },
            { i: CalendarDays, l: "Duration", v: internship.duration || "Flexible", c: "text-gray-300" },
            { i: Users, l: "Openings", v: `${internship.openings || 1} Vacancies`, c: "text-gray-300" },
          ].map((m) => (
            <div key={m.l} className="flex items-start gap-2">
              <m.i size={13} className="mt-0.5 shrink-0 text-gray-600" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600">{m.l}</p>
                <p className={`truncate text-[11px] font-semibold ${m.c}`}>{m.v || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-3.5 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-gray-800/80 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
            {internship.workMode || "On-site"}
          </span>
          {internship.isPartTime && (
            <span className="rounded-md bg-gray-800/80 px-2 py-0.5 text-[10px] font-semibold text-gray-400">Part-time</span>
          )}
          {internship.requiresPremiumResume && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
              <Crown size={9} /> Premium
            </span>
          )}
          {(internship.skills || []).slice(0, 2).map((s) => (
            <span key={s} className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">{s}</span>
          ))}
        </div>

        {!compact && internship.aboutInternship && (
          <p className="relative mt-3 line-clamp-2 text-[11px] leading-relaxed text-gray-500">{internship.aboutInternship}</p>
        )}

        <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-gray-800 pt-3.5">
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${
            expired ? "bg-rose-500/10 text-rose-400"
            : daysLeft <= 3 ? "bg-amber-500/10 text-amber-400" : "bg-gray-800/60 text-gray-500"
          }`}>
            <Clock size={10} /> {expired ? "Closed" : daysLeft !== null ? `${daysLeft}d left` : "Open"}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(detailUrl); }}
              className="flex items-center gap-0.5 rounded-lg border border-gray-700 px-2.5 py-2 text-[10px] font-semibold text-gray-300 transition hover:border-indigo-500 hover:text-white"
            >
              Details <ChevronRight size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (!applied && !expired) setShowApply(true); }}
              disabled={applied || expired}
              className={`inline-flex items-center gap-1 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-wider transition active:scale-95 ${
                applied ? "cursor-default bg-emerald-600/90 text-white"
                : expired ? "cursor-not-allowed bg-gray-800 text-gray-600"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30 hover:opacity-90"
              }`}
            >
              {applied ? <><CheckCircle2 size={11} /> Applied</> : expired ? "Closed" : <><Zap size={11} /> Apply</>}
            </button>
          </div>
        </div>
      </article>

      <ApplyModal
        open={showApply}
        onClose={() => setShowApply(false)}
        internship={internship}
        hasPremiumResume={hasPremiumResume}
        user={user}
        onSuccess={(data) => {
          setApplied(true);
          onApplied?.(internship._id, data);
        }}
      />
    </>
  );
};

export default InternshipCard;