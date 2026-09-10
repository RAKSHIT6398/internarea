import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Briefcase, Building2, MapPin, Tag, IndianRupee, Users, Calendar,
  FileText, Gift, Info, ChevronRight, ChevronLeft, Check, Plus, X,
  Globe, Image as ImageIcon, Sparkles, Clock, ListChecks, Send, Eye,
} from "lucide-react";
import { CATEGORIES } from "../constants/categories";
const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const EMPTY = {
  postType: "internship",
  title: "", companyName: "", companyLogo: "", companyWebsite: "", aboutCompany: "",
  category: "", skills: [],
  location: "", workMode: "On-site", isPartTime: false,
  stipend: "", isUnpaid: false, isNegotiable: false, ctc: "", experience: "Fresher",
  duration: "", startDate: "", isStartImmediate: false, deadline: "",
  aboutInternship: "", responsibilities: [], whoCanApply: "",
  preferredQualifications: [], perks: [], additionalInfo: "", openings: 1,
  assessmentRequired: false, assessmentDetails: "",
  isFeatured: false, isActivelyHiring: true, requiresPremiumResume: false,
};

const STEPS = [
  { id: 0, label: "Basics", icon: Briefcase },
  { id: 1, label: "Company", icon: Building2 },
  { id: 2, label: "Details", icon: FileText },
  { id: 3, label: "Perks & Meta", icon: Gift },
  { id: 4, label: "Review", icon: Eye },
];

const PERK_PRESETS = [
  "Certificate", "Letter of Recommendation", "Flexible Work Hours",
  "5 Days a Week", "Informal Dress Code", "Free Snacks & Beverages",
  "Job Offer (PPO)", "Travel Allowance", "Mentorship", "Team Outings",
];

/* ── Reusable inputs ── */
const Field = ({ label, icon: Icon, required, children, hint, full }) => (
  <div className={full ? "col-span-full" : ""}>
    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
      {Icon && <Icon size={12} className="text-purple-400" />}
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-[10px] text-gray-600">{hint}</p>}
  </div>
);

const inputCls =
  "w-full rounded-xl border border-gray-800 bg-[#070c19] p-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20";

const Toggle = ({ label, checked, onChange, desc }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
      checked ? "border-purple-500/50 bg-purple-500/10" : "border-gray-800 bg-[#070c19] hover:border-gray-700"
    }`}
  >
    <div>
      <p className={`text-xs font-bold ${checked ? "text-purple-300" : "text-gray-300"}`}>{label}</p>
      {desc && <p className="mt-0.5 text-[10px] text-gray-500">{desc}</p>}
    </div>
    <div className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-purple-600" : "bg-gray-700"}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
    </div>
  </button>
);

/* ── Chips input ── */
const ChipInput = ({ value = [], onChange, placeholder, presets = [] }) => {
  const [text, setText] = useState("");
  const add = (v) => {
    const t = (v ?? text).trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setText("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className={inputCls}
        />
        <button type="button" onClick={() => add()}
          className="shrink-0 rounded-xl bg-purple-600 px-4 text-white transition hover:bg-purple-500">
          <Plus size={16} />
        </button>
      </div>

      {presets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {presets.filter((p) => !value.includes(p)).map((p) => (
            <button key={p} type="button" onClick={() => add(p)}
              className="rounded-lg border border-gray-800 bg-gray-900/60 px-2 py-1 text-[10px] text-gray-400 transition hover:border-purple-500/50 hover:text-purple-300">
              + {p}
            </button>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span key={v} className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/15 px-2.5 py-1 text-[11px] font-semibold text-purple-300">
              {v}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="hover:text-white">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════ MAIN ══════════════ */
const PostInternship = ({ onPostSuccess, editData = null }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(editData ? { ...EMPTY, ...editData } : EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const isJob = form.postType === "job";

  const validate = (s) => {
    if (s === 0) {
      if (!form.title.trim()) return "Title required";
      if (!form.companyName.trim()) return "Company name required";
      if (!form.category.trim()) return "Category required";
      if (!form.location.trim()) return "Location required";
    }
    if (s === 2) {
      if (!form.aboutInternship.trim()) return "About section required";
      if (!form.stipend.trim() && !form.isUnpaid) return "Stipend required (or mark Unpaid)";
      if (!form.deadline) return "Deadline required";
    }
    return null;
  };

  const next = () => {
    const err = validate(step);
    if (err) return Swal.fire({ icon: "warning", title: "Hold on!", text: err, background: "#0b1329", color: "#fff", confirmButtonColor: "#a855f7" });
    setStep((s) => Math.min(4, s + 1));
  };

  const submit = async () => {
    for (let s = 0; s <= 2; s++) {
      const err = validate(s);
      if (err) { setStep(s); return Swal.fire({ icon: "warning", title: "Incomplete", text: err, background: "#0b1329", color: "#fff", confirmButtonColor: "#a855f7" }); }
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
  const payload = {
  title: form.title,
  companyName: form.companyName,
  companyLogo: form.companyLogo,
  companyWebsite: form.companyWebsite,

  location: form.location,
  category: form.category,
  skills: Array.isArray(form.skills) ? form.skills : [],

  aboutCompany: form.aboutCompany,
  aboutInternship: form.aboutInternship,
  responsibilities: form.responsibilities,
  whoCanApply: form.whoCanApply,
  preferredQualifications: form.preferredQualifications,

  perks: form.perks,
  additionalInfo: form.additionalInfo,

  openings: Number(form.openings) || 1,

  stipend: form.stipend || "Unpaid",
  isUnpaid: form.isUnpaid,
  isNegotiable: form.isNegotiable,
  ctc: form.ctc,

  experience: form.experience,
  duration: form.duration,

  startDate: form.startDate || null,
  isStartImmediate: form.isStartImmediate,
  deadline: form.deadline,

  workMode: form.workMode || "On-site",
  isPartTime: form.isPartTime,

  assessmentRequired: form.assessmentRequired,
  assessmentDetails: form.assessmentDetails,

  isFeatured: form.isFeatured,
  isActivelyHiring: form.isActivelyHiring,

  requiresPremiumResume: form.requiresPremiumResume,

  postType: form.postType || "internship",
};

      if (editData?._id) {
        await axios.put(`${API}/api/internships/${editData._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API}/api/internships`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }

      Swal.fire({
        icon: "success",
        title: editData ? "Updated! ✨" : "Published! 🚀",
        text: `${form.title} is now live.`,
        background: "#0b1329", color: "#fff", confirmButtonColor: "#a855f7",
      });
      setForm(EMPTY); setStep(0);
      onPostSuccess?.();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || err.message, background: "#0b1329", color: "#fff", confirmButtonColor: "#a855f7" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <Sparkles size={18} className="text-purple-400" />
            {editData ? "Edit" : "Post New"} {isJob ? "Job" : "Internship"}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">Fill complete details — students ko detail page pe yehi dikhega.</p>
        </div>

        <div className="inline-flex rounded-xl border border-gray-800 bg-[#070c19] p-1">
          {["internship", "job"].map((t) => (
            <button key={t} type="button" onClick={() => set("postType", t)}
              className={`rounded-lg px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                form.postType === t ? "bg-purple-600 text-white" : "text-gray-500 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-7 flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <button type="button" onClick={() => setStep(s.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-bold transition ${
                step === s.id ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                : step > s.id ? "bg-emerald-500/10 text-emerald-400" : "text-gray-500 hover:text-gray-300"}`}>
              {step > s.id ? <Check size={13} /> : <s.icon size={13} />}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`h-px w-4 shrink-0 sm:w-8 ${step > s.id ? "bg-emerald-500/40" : "bg-gray-800"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 0: BASICS ── */}
      {step === 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Title" icon={Briefcase} required>
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Frontend Developer Intern" />
          </Field>
          <Field label="Company Name" icon={Building2} required>
            <input className={inputCls} value={form.companyName} onChange={(e) => set("companyName", e.target.value)}
              placeholder="e.g. Tech Innovators" />
          </Field>
         <Field label="Category" icon={Tag} required hint="Ye category user ke filter chips me dikhegi">
  <select
    className={inputCls}
    value={CATEGORIES.some((c) => c.name === form.category) ? form.category : (form.category ? "__custom" : "")}
    onChange={(e) => {
      if (e.target.value === "__custom") set("category", " ");
      else set("category", e.target.value);
    }}
  >
    <option value="">— Select Category —</option>
    {CATEGORIES.map((c) => (
      <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
    ))}
    <option value="__custom">➕ Custom category...</option>
  </select>

  {/* custom input tabhi jab list me na ho */}
  {form.category !== "" && !CATEGORIES.some((c) => c.name === form.category) && (
    <input
      autoFocus
      className={`${inputCls} mt-2`}
      value={form.category.trim()}
      onChange={(e) => set("category", e.target.value)}
      placeholder="Type custom category name..."
    />
  )}

  {/* quick chips */}
  <div className="mt-2 flex flex-wrap gap-1.5">
    {CATEGORIES.slice(0, 8).map((c) => (
      <button
        key={c.name}
        type="button"
        onClick={() => set("category", c.name)}
        className={`rounded-lg border px-2 py-1 text-[10px] transition ${
          form.category === c.name
            ? "border-purple-500 bg-purple-600/20 text-purple-300"
            : "border-gray-800 text-gray-500 hover:border-purple-500/40 hover:text-purple-300"
        }`}
      >
        {c.icon} {c.name}
      </button>
    ))}
  </div>
</Field>
          <Field label="Location" icon={MapPin} required>
            <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Mumbai, India" />
          </Field>

          <Field label="Work Mode" icon={Globe}>
            <select className={inputCls} value={form.workMode} onChange={(e) => set("workMode", e.target.value)}>
              <option>On-site</option><option>Remote</option><option>Hybrid</option>
            </select>
          </Field>
          <Field label="Skills Required" icon={ListChecks}>
            <ChipInput value={form.skills} onChange={(v) => set("skills", v)} placeholder="React, Node.js — Enter dabao" />
          </Field>

          <div className="col-span-full grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Toggle label="Part-time" checked={form.isPartTime} onChange={(v) => set("isPartTime", v)} desc="Flexible hours" />
            <Toggle label="Actively Hiring" checked={form.isActivelyHiring} onChange={(v) => set("isActivelyHiring", v)} desc="Green badge dikhega" />
            <Toggle label="Featured" checked={form.isFeatured} onChange={(v) => set("isFeatured", v)} desc="Top pe show hoga" />
          </div>
        </div>
      )}

      {/* ── STEP 1: COMPANY ── */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Company Logo URL" icon={ImageIcon} hint="https://logo.clearbit.com/google.com">
            <input className={inputCls} value={form.companyLogo} onChange={(e) => set("companyLogo", e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Company Website" icon={Globe}>
            <input className={inputCls} value={form.companyWebsite} onChange={(e) => set("companyWebsite", e.target.value)} placeholder="https://company.com" />
          </Field>

          {form.companyLogo && (
            <div className="col-span-full flex items-center gap-3 rounded-xl border border-gray-800 bg-[#070c19] p-3">
              <img src={form.companyLogo} alt="logo" className="h-12 w-12 rounded-xl object-contain bg-white p-1"
                onError={(e) => (e.target.style.opacity = 0.2)} />
              <div>
                <p className="text-sm font-bold text-white">{form.companyName || "Company"}</p>
                <p className="text-[11px] text-gray-500">Logo preview</p>
              </div>
            </div>
          )}

          <Field label="About Company" icon={Info} full hint="Students ko detail page pe dikhega">
            <textarea rows={5} className={`${inputCls} resize-none`} value={form.aboutCompany}
              onChange={(e) => set("aboutCompany", e.target.value)}
              placeholder="Tech Innovators is a leading software development company specializing in modern web applications..." />
          </Field>
        </div>
      )}

      {/* ── STEP 2: DETAILS ── */}
      {step === 2 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label={isJob ? "CTC" : "Stipend"} icon={IndianRupee} required={!form.isUnpaid} hint="e.g. ₹10,000 /month">
            <input className={inputCls} disabled={form.isUnpaid} value={form.isUnpaid ? "Unpaid" : form.stipend}
              onChange={(e) => set("stipend", e.target.value)} placeholder="₹10,000 /month" />
          </Field>
          <Field label="Number of Openings" icon={Users}>
            <input type="number" min={1} className={inputCls} value={form.openings} onChange={(e) => set("openings", e.target.value)} />
          </Field>

          <div className="col-span-full grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Toggle label="Unpaid" checked={form.isUnpaid} onChange={(v) => set("isUnpaid", v)} />
            <Toggle label="Negotiable" checked={form.isNegotiable} onChange={(v) => set("isNegotiable", v)} />
          </div>

          <Field label="Duration" icon={Clock} hint="Internship duration">
            <input className={inputCls} value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="3 Months" />
          </Field>
          <Field label="Experience Required" icon={Briefcase}>
            <input className={inputCls} value={form.experience} onChange={(e) => set("experience", e.target.value)} placeholder="Fresher / 0-1 year" />
          </Field>

          <Field label="Start Date" icon={Calendar}>
            <input type="date" className={`${inputCls} [color-scheme:dark]`} value={form.startDate?.slice(0, 10) || ""}
              onChange={(e) => set("startDate", e.target.value)} disabled={form.isStartImmediate} />
          </Field>
          <Field label="Apply By (Deadline)" icon={Calendar} required>
            <input type="date" className={`${inputCls} [color-scheme:dark]`} value={form.deadline?.slice(0, 10) || ""}
              onChange={(e) => set("deadline", e.target.value)} />
          </Field>

          <div className="col-span-full">
            <Toggle label="Immediate Start" checked={form.isStartImmediate} onChange={(v) => set("isStartImmediate", v)}
              desc="Candidate turant join kar sake" />
          </div>

          <Field label={`About the ${isJob ? "Job" : "Internship"}`} icon={FileText} required full>
            <textarea rows={5} className={`${inputCls} resize-none`} value={form.aboutInternship}
              onChange={(e) => set("aboutInternship", e.target.value)}
              placeholder="As a Frontend Developer Intern, you will work on real-world projects using React.js and Tailwind CSS..." />
          </Field>

          <Field label="Day-to-day Responsibilities" icon={ListChecks} full hint="Ek-ek karke add karo">
            <ChipInput value={form.responsibilities} onChange={(v) => set("responsibilities", v)}
              placeholder="Build reusable UI components" />
          </Field>

          <Field label="Who Can Apply" icon={Users} full>
            <textarea rows={3} className={`${inputCls} resize-none`} value={form.whoCanApply}
              onChange={(e) => set("whoCanApply", e.target.value)}
              placeholder="Students and fresh graduates with knowledge of HTML, CSS, JavaScript and React.js." />
          </Field>

          <Field label="Preferred Qualifications" icon={Check} full>
            <ChipInput value={form.preferredQualifications} onChange={(v) => set("preferredQualifications", v)}
              placeholder="Portfolio / GitHub projects" />
          </Field>
        </div>
      )}

      {/* ── STEP 3: PERKS & META ── */}
      {step === 3 && (
        <div className="grid grid-cols-1 gap-5">
          <Field label="Perks" icon={Gift} full>
            <ChipInput value={form.perks} onChange={(v) => set("perks", v)} placeholder="Custom perk..." presets={PERK_PRESETS} />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Toggle label="Assessment Required" checked={form.assessmentRequired} onChange={(v) => set("assessmentRequired", v)}
              desc="Test / assignment lena hai?" />
            <Toggle label="Premium Resume Only" checked={form.requiresPremiumResume} onChange={(v) => set("requiresPremiumResume", v)}
              desc="Sirf ₹50 wale ATS resume se apply" />
          </div>

          {form.assessmentRequired && (
            <Field label="Assessment Details" icon={FileText} full>
              <textarea rows={3} className={`${inputCls} resize-none`} value={form.assessmentDetails}
                onChange={(e) => set("assessmentDetails", e.target.value)}
                placeholder="Shortlisted candidates ko ek small React assignment (2 din) milega." />
            </Field>
          )}

          <Field label="Additional Information" icon={Info} full>
            <textarea rows={3} className={`${inputCls} resize-none`} value={form.additionalInfo}
              onChange={(e) => set("additionalInfo", e.target.value)}
              placeholder="This is a remote internship with flexible working hours." />
          </Field>
        </div>
      )}

      {/* ── STEP 4: REVIEW ── */}
      {step === 4 && (
        <div className="rounded-2xl border border-gray-800 bg-[#070c19] p-6">
          <div className="mb-5 flex items-start gap-4 border-b border-gray-800 pb-5">
            {form.companyLogo ? (
              <img src={form.companyLogo} alt="" className="h-14 w-14 rounded-xl bg-white object-contain p-1" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-xl font-black text-white">
                {(form.companyName || "C")[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              {form.isActivelyHiring && <p className="mb-1 text-[11px] font-bold text-emerald-400">↗ Actively Hiring</p>}
              <h3 className="text-lg font-black text-white">{form.title || "—"}</h3>
              <p className="text-sm text-gray-400">{form.companyName || "—"}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-gray-800 px-2 py-0.5 text-[10px] text-gray-300">{form.workMode}</span>
                {form.isPartTime && <span className="rounded-md bg-gray-800 px-2 py-0.5 text-[10px] text-gray-300">Part-time</span>}
                {form.isFeatured && <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">Featured</span>}
                {form.requiresPremiumResume && <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">Premium Only</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
            {[
              ["Location", form.location], ["Stipend", form.isUnpaid ? "Unpaid" : form.stipend],
              ["Duration", form.duration || "—"], ["Openings", form.openings],
              ["Category", form.category], ["Start", form.isStartImmediate ? "Immediate" : form.startDate || "—"],
              ["Apply By", form.deadline || "—"], ["Experience", form.experience],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] uppercase tracking-wider text-gray-600">{k}</p>
                <p className="mt-0.5 font-semibold text-gray-200">{v || "—"}</p>
              </div>
            ))}
          </div>

          {[
            ["About Company", form.aboutCompany],
            [`About ${isJob ? "Job" : "Internship"}`, form.aboutInternship],
            ["Who Can Apply", form.whoCanApply],
            ["Additional Info", form.additionalInfo],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="mt-5 border-t border-gray-800 pt-4">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-purple-400">{k}</p>
              <p className="whitespace-pre-line text-xs leading-relaxed text-gray-400">{v}</p>
            </div>
          ))}

          {[["Skills", form.skills], ["Responsibilities", form.responsibilities],
            ["Qualifications", form.preferredQualifications], ["Perks", form.perks]]
            .filter(([, v]) => v?.length).map(([k, arr]) => (
            <div key={k} className="mt-5 border-t border-gray-800 pt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-purple-400">{k}</p>
              <div className="flex flex-wrap gap-1.5">
                {arr.map((x) => (
                  <span key={x} className="rounded-lg bg-gray-800/80 px-2.5 py-1 text-[11px] text-gray-300">{x}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nav buttons */}
      <div className="mt-7 flex items-center justify-between gap-3 border-t border-gray-800 pt-5">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-800 px-5 py-3 text-xs font-bold text-gray-400 transition hover:border-gray-700 hover:text-white disabled:opacity-30">
          <ChevronLeft size={14} /> Back
        </button>

        <p className="hidden text-[11px] text-gray-600 sm:block">Step {step + 1} of {STEPS.length}</p>

        {step < 4 ? (
          <button type="button" onClick={next}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-xs font-bold text-white transition hover:opacity-90 active:scale-95">
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50">
            {saving ? (<><span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Publishing...</>)
              : (<><Send size={14} /> {editData ? "Update" : "Publish"}</>)}
          </button>
        )}
      </div>
    </div>
  );
};

export default PostInternship;