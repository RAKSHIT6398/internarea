import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  
import axios from "axios";
import Swal from "sweetalert2";
import {
  X, FileText, Upload, Crown, Check, ChevronRight, ChevronLeft,
  Zap, Calendar, MapPin, Phone, IndianRupee, Link2,
  ShieldCheck, Send, AlertTriangle, Clock, Briefcase, Sparkles, CheckCircle2,
} from "lucide-react";
/* ── Brand SVG icons (lucide me brand icons removed) ── */
const BrandIcon = ({ d, size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d={d} />
  </svg>
);

const PATHS = {
  linkedin: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z",
  github: "M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z",
};
const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const AVAILABILITY = [
  "Full-time (40+ hrs/week)",
  "Part-time (20-30 hrs/week)",
  "Flexible (10-20 hrs/week)",
  "Weekends only",
];

const inputCls =
  "w-full rounded-xl border border-gray-800 bg-[#0a0f1c] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const Label = ({ icon: Icon, children, required }) => (
  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
    {Icon && <Icon size={12} className="text-indigo-400" />}
    {children} {required && <span className="text-rose-400">*</span>}
  </label>
);

const YesNo = ({ value, onChange, yesLabel = "Yes", noLabel = "No" }) => (
  <div className="grid grid-cols-2 gap-2">
    {[
      { v: true, label: yesLabel, on: "border-emerald-500 bg-emerald-500/15 text-emerald-300" },
      { v: false, label: noLabel, on: "border-rose-500 bg-rose-500/15 text-rose-300" },
    ].map((o) => (
      <button
        key={String(o.v)}
        type="button"
        onClick={() => onChange(o.v)}
        className={`rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 ${
          value === o.v ? o.on : "border-gray-800 bg-[#0a0f1c] text-gray-500 hover:border-gray-700"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const ApplyModal = ({ open, onClose, internship, hasPremiumResume, user, onSuccess }) => {
  const navigate = useNavigate();     
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [resumeMode, setResumeMode] = useState(null); // "premium" | "upload"
  const [file, setFile] = useState(null);

  const [f, setF] = useState({
    readyToJoinImmediately: null,
    availableFrom: "",
    availabilityHours: AVAILABILITY[0],
    currentCity: "",
    willingToRelocate: null,
    phone: "",
    expectedStipend: "",
    relevantExperience: "",
    coverLetter: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    agreedToTerms: false,
  });

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  /* reset on open */
  useEffect(() => {
    if (open) {
      setStep(1);
      setFile(null);
      setResumeMode(hasPremiumResume ? "premium" : "upload");
      setF((p) => ({ ...p, agreedToTerms: false }));
    }
  }, [open, hasPremiumResume]);

  /* esc close */
  useEffect(() => {
    const h = (e) => e.key === "Escape" && !submitting && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, submitting, onClose]);

  if (!open || !internship) return null;

  const premiumOnly = internship.requiresPremiumResume;

  const alert = (icon, title, text) =>
    Swal.fire({ icon, title, text, background: "#0b1329", color: "#fff", confirmButtonColor: "#6366f1" });

  const validate = (s) => {
    if (s === 1) {
      if (!resumeMode) return "Please select a resume option.";
      if (resumeMode === "upload" && !file) return "Please upload your resume PDF.";
      if (resumeMode === "premium" && !hasPremiumResume) return "Premium resume not found.";
    }
    if (s === 2) {
      if (f.readyToJoinImmediately === null) return "Please answer: Ready to join immediately?";
      if (f.readyToJoinImmediately === false && !f.availableFrom) return "Please select your availability date.";
      if (!f.currentCity.trim()) return "Current city is required.";
      if (f.willingToRelocate === null) return "Please answer the relocation question.";
      if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, "").slice(-10)))
        return "Enter a valid 10-digit mobile number.";
    }
    if (s === 3 && !f.agreedToTerms) return "Please accept the declaration.";
    return null;
  };

  const next = () => {
    const err = validate(step);
    if (err) return alert("warning", "Hold on!", err);
    setStep((s) => Math.min(3, s + 1));
  };

  const submit = async () => {
    for (let s = 1; s <= 3; s++) {
      const err = validate(s);
      if (err) { setStep(s); return alert("warning", "Incomplete", err); }
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const fd = new FormData();

      if (resumeMode === "premium") fd.append("usePremium", "true");
      else fd.append("resumeFile", file);

      fd.append("screening", JSON.stringify(f));

      const { data } = await axios.post(`${API}/api/application/apply/${internship._id}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onClose();
      await Swal.fire({
        icon: "success",
        title: "Application Sent! 🎉",
        html: `<p style="color:#94a3b8;font-size:13px">${data.message}</p>
               <p style="color:#64748b;font-size:11px;margin-top:8px">Remaining this month: <b style="color:#818cf8">${data.remaining ?? "-"}</b></p>`,
        background: "#0b1329", color: "#fff", confirmButtonColor: "#6366f1",
        confirmButtonText: "Great!",
      });
      onSuccess?.(data);
    } catch (err) {
      const r = err.response?.data;
      if (r?.code === "LIMIT_REACHED") {
        onClose();
        const go = await Swal.fire({
          icon: "warning", title: "🚨 Plan Limit Reached",
          html: `<p style="color:#94a3b8;font-size:13px">${r.message}</p>`,
          showCancelButton: true, confirmButtonText: "Upgrade Now 💎", cancelButtonText: "Later",
          background: "#0b1329", color: "#fff", confirmButtonColor: "#6366f1", cancelButtonColor: "#334155",
        });
        if (go.isConfirmed) navigate("/pricing");    // ✅ was: window.location.href = "/pricing"
      } else if (r?.code === "NO_PREMIUM_RESUME") {
        onClose();
        const go = await Swal.fire({
          icon: "info", title: "Premium Resume Missing",
          text: r.message, showCancelButton: true, confirmButtonText: "Create Now (₹50)",
          background: "#0b1329", color: "#fff", confirmButtonColor: "#6366f1", cancelButtonColor: "#334155",
        });
        if (go.isConfirmed) navigate("/resume");     // ✅ was: window.location.href = "/resume"
      } else if (r?.code === "ALREADY_APPLIED") {    // ✅ Edit 1 — NEW specific handling
        onClose();
        Swal.fire({
          icon: "info",
          title: "Already Applied ✅",
          text: r.message,
          background: "#0b1329",
          color: "#fff",
          confirmButtonColor: "#6366f1",
        });
        onSuccess?.();   // button ko "Applied" state mein daal do
      } else {
        alert("error", "Failed", r?.message || err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS = [
    { n: 1, label: "Resume", icon: FileText },
    { n: 2, label: "Screening", icon: Briefcase },
    { n: 3, label: "Review", icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-gray-800 bg-[#0b1120] shadow-2xl sm:rounded-3xl">

        {/* ─── HEADER ─── */}
        <div className="relative shrink-0 border-b border-gray-800 bg-gradient-to-r from-indigo-600/15 via-purple-600/10 to-transparent p-5">
          <button
            onClick={() => !submitting && onClose()}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-800 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-3 pr-8">
            {internship.companyLogo ? (
              <img src={internship.companyLogo} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-1" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-black text-white">
                {(internship.companyName || "C")[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400">Applying for</p>
              <h3 className="truncate text-base font-black text-white">{internship.title}</h3>
              <p className="truncate text-xs text-gray-400">
                {internship.companyName} · {internship.location} · {internship.stipend}
              </p>
            </div>
          </div>

          {/* stepper */}
          <div className="mt-4 flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.n}>
                <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${
                  step === s.n ? "bg-indigo-600 text-white"
                  : step > s.n ? "bg-emerald-500/15 text-emerald-400" : "text-gray-600"
                }`}>
                  {step > s.n ? <Check size={11} /> : <s.icon size={11} />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < 2 && <div className={`h-px flex-1 ${step > s.n ? "bg-emerald-500/40" : "bg-gray-800"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ─── BODY ─── */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ══ STEP 1: RESUME ══ */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Choose your resume</h4>
                <p className="mt-0.5 text-xs text-gray-500">Recruiter ko yehi resume dikhega.</p>
              </div>

              {/* Premium */}
              <button
                type="button"
                disabled={!hasPremiumResume}
                onClick={() => setResumeMode("premium")}
                className={`relative w-full overflow-hidden rounded-2xl border p-4 text-left transition ${
                  resumeMode === "premium"
                    ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                    : hasPremiumResume
                    ? "border-gray-800 bg-[#0a0f1c] hover:border-gray-700"
                    : "cursor-not-allowed border-gray-800 bg-[#0a0f1c] opacity-50"
                }`}
              >
                <span className="absolute right-3 top-3 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-black">
                  Recommended
                </span>
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-indigo-600/20 p-2.5 text-indigo-400"><Crown size={18} /></div>
                  <div className="flex-1 pr-16">
                    <p className="text-sm font-bold text-white">Use Premium ATS Resume</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">
                      Instant apply — recruiter ko structured, ATS-optimized profile milega.
                    </p>
                    {hasPremiumResume ? (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 size={10} /> Active in your profile
                      </span>
                    ) : (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                        <AlertTriangle size={10} /> Not created yet (₹50)
                      </span>
                    )}
                  </div>
                  {resumeMode === "premium" && (
                    <div className="rounded-full bg-indigo-600 p-1 text-white"><Check size={12} /></div>
                  )}
                </div>
              </button>

              {/* Upload */}
              <button
                type="button"
                disabled={premiumOnly}
                onClick={() => setResumeMode("upload")}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  resumeMode === "upload"
                    ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                    : premiumOnly
                    ? "cursor-not-allowed border-gray-800 bg-[#0a0f1c] opacity-50"
                    : "border-gray-800 bg-[#0a0f1c] hover:border-gray-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-600/20 p-2.5 text-emerald-400"><Upload size={18} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Upload My Own Resume</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {premiumOnly ? "🔒 This listing accepts Premium resume only." : "PDF only · max 5 MB"}
                    </p>
                  </div>
                  {resumeMode === "upload" && (
                    <div className="rounded-full bg-emerald-600 p-1 text-white"><Check size={12} /></div>
                  )}
                </div>
              </button>

              {resumeMode === "upload" && !premiumOnly && (
                <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-gray-800 bg-[#0a0f1c] p-6 text-center transition hover:border-indigo-500/50">
                  <input
                    type="file" accept="application/pdf" className="hidden"
                    onChange={(e) => {
                      const fl = e.target.files?.[0];
                      if (!fl) return;
                      if (fl.type !== "application/pdf") return alert("error", "Invalid", "Only PDF allowed.");
                      if (fl.size > 5 * 1024 * 1024) return alert("error", "Too large", "Max 5 MB.");
                      setFile(fl);
                    }}
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText size={22} className="text-emerald-400" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-white">{file.name}</p>
                        <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={22} className="mx-auto mb-2 text-gray-600" />
                      <p className="text-xs font-semibold text-gray-300">Click to upload PDF</p>
                      <p className="mt-0.5 text-[10px] text-gray-600">Max 5 MB</p>
                    </>
                  )}
                </label>
              )}

              {!hasPremiumResume && (
                <a href="/resume" className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 transition hover:bg-indigo-500/10">
                  <span className="flex items-center gap-2 text-[11px] text-indigo-300">
                    <Sparkles size={13} /> Build an ATS-friendly resume in 2 min — just ₹50
                  </span>
                  <ChevronRight size={14} className="text-indigo-400" />
                </a>
              )}
            </div>
          )}

          {/* ══ STEP 2: SCREENING ══ */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white">A few quick questions</h4>
                <p className="mt-0.5 text-xs text-gray-500">Recruiters ye sabse pehle dekhte hain.</p>
              </div>

              {/* ⭐ Ready to join */}
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.06] p-4">
                <Label icon={Zap} required>Are you ready to join immediately?</Label>
                <YesNo
                  value={f.readyToJoinImmediately}
                  onChange={(v) => set("readyToJoinImmediately", v)}
                  yesLabel="✅ Yes, immediately"
                  noLabel="📅 No, from a date"
                />
                {f.readyToJoinImmediately === false && (
                  <div className="mt-3">
                    <Label icon={Calendar} required>Available from</Label>
                    <input
                      type="date" className={`${inputCls} [color-scheme:dark]`}
                      min={new Date().toISOString().slice(0, 10)}
                      value={f.availableFrom} onChange={(e) => set("availableFrom", e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label icon={Clock}>Weekly availability</Label>
                <select className={inputCls} value={f.availabilityHours} onChange={(e) => set("availabilityHours", e.target.value)}>
                  {AVAILABILITY.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label icon={MapPin} required>Current city</Label>
                  <input className={inputCls} placeholder="e.g. Indore" value={f.currentCity} onChange={(e) => set("currentCity", e.target.value)} />
                </div>
                <div>
                  <Label icon={Phone} required>Mobile number</Label>
                  <input className={inputCls} placeholder="9876543210" maxLength={10}
                    value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} />
                </div>
              </div>

              <div>
                <Label icon={MapPin} required>
                  Willing to relocate to {internship.location}?
                </Label>
                <YesNo value={f.willingToRelocate} onChange={(v) => set("willingToRelocate", v)}
                  yesLabel="Yes, I can relocate" noLabel="No / Remote only" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label icon={IndianRupee}>Expected stipend</Label>
                  <input className={inputCls} placeholder="As per company standards" value={f.expectedStipend} onChange={(e) => set("expectedStipend", e.target.value)} />
                </div>
                <div>
                  <Label icon={Briefcase}>Relevant experience</Label>
                  <input className={inputCls} placeholder="e.g. 2 React projects" value={f.relevantExperience} onChange={(e) => set("relevantExperience", e.target.value)} />
                </div>
              </div>

              <div>
                <Label icon={FileText}>Why should we hire you? <span className="normal-case text-gray-600">(optional)</span></Label>
                <textarea rows={4} maxLength={800} className={`${inputCls} resize-none`}
                  placeholder="Apni skills, projects aur enthusiasm 3-4 lines me batao..."
                  value={f.coverLetter} onChange={(e) => set("coverLetter", e.target.value)} />
                <p className="mt-1 text-right text-[10px] text-gray-600">{f.coverLetter.length}/800</p>
              </div>

              <div className="space-y-3 rounded-2xl border border-gray-800 bg-[#0a0f1c] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Profile links (optional)
                </p>

                {/* Portfolio */}
                <div className="relative">
                  <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input className={`${inputCls} pl-9`} placeholder="https://myportfolio.com"
                    value={f.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)} />
                </div>

                {/* LinkedIn */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                    <BrandIcon d={PATHS.linkedin} />
                  </span>
                  <input className={`${inputCls} pl-9`} placeholder="https://linkedin.com/in/username"
                    value={f.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} />
                </div>

                {/* GitHub */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                    <BrandIcon d={PATHS.github} />
                  </span>
                  <input className={`${inputCls} pl-9`} placeholder="https://github.com/username"
                    value={f.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 3: REVIEW ══ */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Review & confirm</h4>
                <p className="mt-0.5 text-xs text-gray-500">Submit ke baad edit nahi kar paoge.</p>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-[#0a0f1c] p-4">
                <div className="mb-3 flex items-center gap-2 border-b border-gray-800 pb-3">
                  {resumeMode === "premium"
                    ? <><Crown size={15} className="text-indigo-400" /><span className="text-xs font-bold text-indigo-300">Premium ATS Resume</span></>
                    : <><FileText size={15} className="text-emerald-400" /><span className="truncate text-xs font-bold text-emerald-300">{file?.name}</span></>}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    ["Applicant", user?.name || "—"],
                    ["Email", user?.email || "—"],
                    ["Join", f.readyToJoinImmediately ? "⚡ Immediately" : `📅 ${f.availableFrom || "—"}`],
                    ["Availability", f.availabilityHours],
                    ["City", f.currentCity || "—"],
                    ["Relocate", f.willingToRelocate ? "Yes" : "No"],
                    ["Phone", f.phone || "—"],
                    ["Expected", f.expectedStipend || "Not specified"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[9px] uppercase tracking-wider text-gray-600">{k}</p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-gray-200">{v}</p>
                    </div>
                  ))}
                </div>

                {f.coverLetter && (
                  <div className="mt-3 border-t border-gray-800 pt-3">
                    <p className="text-[9px] uppercase tracking-wider text-gray-600">Cover Letter</p>
                    <p className="mt-1 line-clamp-4 text-[11px] leading-relaxed text-gray-400">{f.coverLetter}</p>
                  </div>
                )}
              </div>

              {internship.assessmentRequired && (
                <div className="flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-3">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-400" />
                  <div>
                    <p className="text-[11px] font-bold text-amber-300">Assessment required</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-amber-200/70">
                      {internship.assessmentDetails || "Shortlisted candidates ko ek small assignment milega."}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => set("agreedToTerms", !f.agreedToTerms)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  f.agreedToTerms ? "border-emerald-500/50 bg-emerald-500/[0.07]" : "border-gray-800 bg-[#0a0f1c] hover:border-gray-700"
                }`}
              >
                <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition ${
                  f.agreedToTerms ? "border-emerald-500 bg-emerald-500" : "border-gray-600"
                }`}>
                  {f.agreedToTerms && <Check size={10} className="text-white" />}
                </div>
                <p className="text-[11px] leading-relaxed text-gray-400">
                  Main confirm karta hoon ki upar di gayi saari information <b className="text-gray-200">sahi</b> hai,
                  aur select hone par main is role ke liye <b className="text-gray-200">available</b> rahunga.
                  Galat information par application reject ho sakti hai.
                </p>
              </button>
            </div>
          )}
        </div>

        {/* ─── FOOTER ─── */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-800 bg-[#0a0f1c]/60 p-4">
          <button
            type="button"
            onClick={() => (step === 1 ? onClose() : setStep((s) => s - 1))}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-800 px-4 py-2.5 text-[11px] font-bold text-gray-400 transition hover:border-gray-700 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft size={13} /> {step === 1 ? "Cancel" : "Back"}
          </button>

          <span className="hidden text-[10px] text-gray-600 sm:block">Step {step} of 3</span>

          {step < 3 ? (
            <button
              type="button" onClick={next}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition hover:opacity-90 active:scale-95"
            >
              Continue <ChevronRight size={13} />
            </button>
          ) : (
            <button
              type="button" onClick={submit} disabled={submitting || !f.agreedToTerms}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting
                ? <><span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Sending...</>
                : <><Send size={13} /> Submit Application</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;