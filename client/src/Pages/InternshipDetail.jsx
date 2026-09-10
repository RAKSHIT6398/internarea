import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, MapPin, IndianRupee, CalendarDays, Users, Clock, Building2,
  ExternalLink, Share2, Bookmark, CheckCircle2, Zap, ArrowUpRight, Crown,
  Briefcase, Gift, Info, ListChecks, AlertTriangle, Eye, Send, Globe, Flame,
} from "lucide-react";
import Swal from "sweetalert2";
import ApplyModal from "../components/ApplyModal";
import InternshipCard from "./InternshipCard";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API}${url.startsWith("/") ? url : `/${url}`}`;
};

const Section = ({ icon: Icon, title, children }) => (
  <section className="border-t border-gray-800 py-6">
    <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
      <Icon size={15} className="text-indigo-400" /> {title}
    </h3>
    {children}
  </section>
);

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);
  const [user, setUser] = useState(null);
  const [hasPremiumResume, setHasPremiumResume] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const { data: res } = await axios.get(`${API}/api/internships/${id}`);
        setData(res.internship);
        setSimilar(res.similar || []);
        
        // Safe localStorage check after data loads
        try {
          const savedList = JSON.parse(localStorage.getItem("savedJobs") || "[]");
          setSaved(savedList.includes(res.internship?._id));
        } catch {
          setSaved(false);
        }
      } catch {
        Swal.fire({
          icon: "error", title: "Not Found", text: "This internship/job does not exist.",
          background: "#0b1329", color: "#fff", confirmButtonColor: "#6366f1"
        }).then(() => navigate("/internships"));
      } finally {
        setLoading(false);
      }
    };

    const fetchUserStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [profileRes, checkRes] = await Promise.all([
          axios.get(`${API}/api/user/profile`, getAuthHeaders()),
          axios.get(`${API}/api/application/check/${id}`, getAuthHeaders())
        ]);
        setUser(profileRes.data.user);
        setHasPremiumResume(!!profileRes.data.resume);
        setApplied(!!checkRes.data.applied);
      } catch (err) {
        console.warn("Failed to fetch user status:", err);
      }
    };

    fetchDetails();
    fetchUserStatus();
  }, [id, navigate]);

  const toggleSave = () => {
    if (!data?._id) return;
    try {
      const list = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      const next = saved ? list.filter((i) => i !== data._id) : [...list, data._id];
      localStorage.setItem("savedJobs", JSON.stringify(next));
      setSaved(!saved);
    } catch (e) {
      console.error("Save toggle failed:", e);
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: data?.title || "Opportunity", url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      Swal.fire({ icon: "success", title: "Link copied!", timer: 1200, showConfirmButton: false, background: "#0b1329", color: "#fff" });
    } catch {
      Swal.fire({ icon: "error", title: "Copy failed", timer: 1200, showConfirmButton: false, background: "#0b1329", color: "#fff" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-transparent border-b-purple-500 border-t-indigo-500" />
      </div>
    );
  }

  if (!data) return null;

  const daysLeft = data.deadline ? Math.ceil((new Date(data.deadline) - new Date()) / 86400000) : null;
  const expired = daysLeft !== null && daysLeft <= 0;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";

  const QUICK = [
    { i: MapPin, l: "Location", v: data.location },
    { i: IndianRupee, l: "Stipend", v: data.stipend, c: "text-emerald-400" },
    { i: CalendarDays, l: "Duration", v: data.duration || "Flexible" },
    { i: Users, l: "Openings", v: `${data.openings || 1}` },
    { i: Briefcase, l: "Experience", v: data.experience || "Fresher" },
    { i: Globe, l: "Work Mode", v: data.workMode || "On-site" },
    { i: Clock, l: "Start Date", v: data.isStartImmediate ? "Immediately" : fmtDate(data.startDate) },
    { i: AlertTriangle, l: "Apply By", v: fmtDate(data.deadline), c: expired ? "text-rose-400" : "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black pb-28 text-white lg:pb-8">
      {/* TOP BAR */}
      <div className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="flex gap-2">
            <button onClick={toggleSave} className={`rounded-lg border p-2 transition ${saved ? "border-indigo-500 bg-indigo-500/15 text-indigo-400" : "border-gray-800 text-gray-500 hover:text-white"}`}>
              <Bookmark size={15} className={saved ? "fill-indigo-400" : ""} />
            </button>
            <button onClick={share} className="rounded-lg border border-gray-800 p-2 text-gray-500 transition hover:border-gray-700 hover:text-white">
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:flex">
        {/* ─── MAIN ─── */}
        <div className="min-w-0 flex-1">
          <div className="rounded-3xl border border-gray-800 bg-gray-900/60 p-6 backdrop-blur sm:p-8">
            {/* header */}
            <div className="flex flex-wrap items-center gap-2">
              {data.isActivelyHiring !== false && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400">
                  <ArrowUpRight size={13} /> Actively Hiring
                </span>
              )}
              {data.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-amber-400">
                  <Flame size={10} /> Featured
                </span>
              )}
              {data.requiresPremiumResume && (
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-purple-300">
                  <Crown size={10} /> Premium Only
                </span>
              )}
            </div>

            <div className="mt-4 flex items-start gap-4">
              {data.companyLogo ? (
                <img src={resolveUrl(data.companyLogo)} alt="" className="h-16 w-16 shrink-0 rounded-2xl bg-white object-contain p-1.5" onError={(e) => (e.currentTarget.style.display = "none")} />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-black">
                  {(data.companyName || "C")[0]}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">{data.title}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                  <Building2 size={14} /> {data.companyName}
                  {data.companyWebsite && (
                    <a href={data.companyWebsite} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-xs text-indigo-400 hover:underline">
                      Website <ExternalLink size={10} />
                    </a>
                  )}
                </p>
              </div>
            </div>

            {/* quick grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-gray-800 bg-gray-950/50 p-5 sm:grid-cols-4">
              {QUICK.map((q) => (
                <div key={q.l} className="flex items-start gap-2">
                  <q.i size={14} className="mt-0.5 shrink-0 text-gray-600" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600">{q.l}</p>
                    <p className={`mt-0.5 truncate text-[12px] font-bold ${q.c || "text-gray-200"}`}>{q.v}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
              <span className="inline-flex items-center gap-1"><Eye size={11} /> {data.views || 0} views</span>
              <span className="inline-flex items-center gap-1"><Send size={11} /> {data.applicationsCount || 0} applied</span>
              <span className="inline-flex items-center gap-1"><Clock size={11} /> Posted {fmtDate(data.createdAt)}</span>
              {!expired && daysLeft !== null && (
                <span className={`rounded-md px-2 py-0.5 font-bold ${daysLeft <= 3 ? "bg-rose-500/15 text-rose-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                  {daysLeft} days left
                </span>
              )}
            </div>

            {/* skills */}
            {data.skills?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {data.skills.map((s) => (
                  <span key={s} className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-300">{s}</span>
                ))}
              </div>
            )}

            {/* ── SECTIONS ── */}
            {data.aboutCompany && (
              <Section icon={Building2} title={`About ${data.companyName}`}>
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-400">{data.aboutCompany}</p>
              </Section>
            )}

            <Section icon={Info} title={`About the ${data.postType === "job" ? "Job" : "Internship"}`}>
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-400">{data.aboutInternship}</p>
            </Section>

            {data.responsibilities?.length > 0 && (
              <Section icon={ListChecks} title="Day-to-day Responsibilities">
                <ul className="space-y-2.5">
                  {data.responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-gray-400">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" /> {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {data.whoCanApply && (
              <Section icon={Users} title="Who Can Apply">
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-400">{data.whoCanApply}</p>
              </Section>
            )}

            {data.preferredQualifications?.length > 0 && (
              <Section icon={CheckCircle2} title="Preferred Qualifications">
                <ul className="space-y-2">
                  {data.preferredQualifications.map((q, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-gray-400">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-400" /> {q}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {data.perks?.length > 0 && (
              <Section icon={Gift} title="Perks & Benefits">
                <div className="flex flex-wrap gap-2">
                  {data.perks.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
                      <Gift size={11} /> {p}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {data.assessmentRequired && (
              <Section icon={AlertTriangle} title="Selection Process">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-4">
                  <p className="text-[13px] leading-relaxed text-amber-200/85">
                    {data.assessmentDetails || "Shortlisted candidates will receive an assignment."}
                  </p>
                </div>
              </Section>
            )}

            {data.additionalInfo && (
              <Section icon={Info} title="Additional Information">
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-400">{data.additionalInfo}</p>
              </Section>
            )}
          </div>

          {/* SIMILAR */}
          {similar.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-black">Similar Opportunities</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {similar.slice(0, 4).map((s) => (
                  <InternshipCard key={s._id} internship={s} user={user} hasPremiumResume={hasPremiumResume} compact />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── SIDEBAR (desktop) ─── */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Stipend</p>
              <p className="mt-1 text-2xl font-black text-emerald-400">{data.stipend}</p>
              {data.isNegotiable && <p className="mt-0.5 text-[10px] text-gray-500">Negotiable</p>}

              <div className="mt-4 space-y-2 border-t border-gray-800 pt-4 text-[11px]">
                {[["Openings", data.openings || 1], ["Applicants", data.applicationsCount || 0], ["Deadline", fmtDate(data.deadline)]].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-bold text-gray-200">{v}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => !applied && !expired && setShowApply(true)}
                disabled={applied || expired}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-black uppercase tracking-wider transition active:scale-95 ${
                  applied ? "cursor-default bg-emerald-600 text-white"
                  : expired ? "cursor-not-allowed bg-gray-800 text-gray-600"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/40 hover:opacity-90"
                }`}
              >
                {applied ? <><CheckCircle2 size={14} /> Applied</> : expired ? "Applications Closed" : <><Zap size={14} /> Apply Now</>}
              </button>

              {!applied && !expired && (
                <p className="mt-2.5 text-center text-[10px] text-gray-600">
                  {hasPremiumResume ? "⚡ 1-click apply with Premium Resume" : "Upload PDF or create Premium Resume"}
                </p>
              )}
            </div>

            {!hasPremiumResume && (
              <Link to="/resume" className="block rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/15 to-purple-600/10 p-5 transition hover:border-indigo-500/50">
                <Crown size={20} className="mb-2 text-indigo-400" />
                <p className="text-sm font-bold">Get Premium Resume</p>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
                  ATS-optimized resume in 2 min — apply faster at just ₹50.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400">
                  Create now <ArrowUpRight size={12} />
                </span>
              </Link>
            )}
          </div>
        </aside>
      </div>

      {/* MOBILE STICKY APPLY */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-gray-950/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] text-gray-500">Stipend</p>
            <p className="truncate text-sm font-black text-emerald-400">{data.stipend}</p>
          </div>
          <button
            onClick={() => !applied && !expired && setShowApply(true)}
            disabled={applied || expired}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-7 py-3 text-[11px] font-black uppercase tracking-wider ${
              applied ? "bg-emerald-600 text-white" : expired ? "bg-gray-800 text-gray-600" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            }`}
          >
            {applied ? <><CheckCircle2 size={13} /> Applied</> : expired ? "Closed" : <><Zap size={13} /> Apply Now</>}
          </button>
        </div>
      </div>

      <ApplyModal
        open={showApply}
        onClose={() => setShowApply(false)}
        internship={data}
        hasPremiumResume={hasPremiumResume}
        user={user}
        onSuccess={() => setApplied(true)}
      />
    </div>
  );
};

export default InternshipDetail;