import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  Search, SlidersHorizontal, X, Filter, Inbox,
  Home, Clock, Sparkles, RotateCcw, Zap, Flame, Layers,
} from "lucide-react";
import InternshipCard from "./InternshipCard";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const SORTS = [
  { v: "latest", l: "Latest First" },
  { v: "stipend-high", l: "Highest Stipend" },
  { v: "stipend-low", l: "Lowest Stipend" },
  { v: "popular", l: "Most Popular" },
  { v: "deadline", l: "Closing Soon" },
];

const EMPTY_FILTERS = {
  search: "", category: "", location: "",
  wfh: false, partTime: false, featured: false,
  minStipend: 0, sort: "latest", page: 1,
};

const Skeleton = () => (
  <div className="animate-pulse rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
    <div className="mb-4 flex gap-3">
      <div className="h-12 w-12 rounded-xl bg-gray-800" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/4 rounded bg-gray-800" />
        <div className="h-2.5 w-1/2 rounded bg-gray-800/70" />
      </div>
    </div>
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-2.5 rounded bg-gray-800/70" style={{ width: `${100 - i * 12}%` }} />
      ))}
    </div>
    <div className="mt-5 h-10 rounded-xl bg-gray-800" />
  </div>
);

const Internships = ({ postType = "internship" }) => {
  const [params, setParams] = useSearchParams();

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({
    categories: [], locations: [], stipend: { min: 0, max: 100000 }, counts: {},
  });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilter, setMobileFilter] = useState(false);

  const [user, setUser] = useState(null);
  const [hasPremiumResume, setHasPremiumResume] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);
  const [appliedIds, setAppliedIds] = useState([]);

  const [f, setF] = useState({
    ...EMPTY_FILTERS,
    search: params.get("search") || "",
    category: params.get("category") || "",
    location: params.get("location") || "",
    wfh: params.get("wfh") === "true",
    partTime: params.get("partTime") === "true",
    featured: params.get("featured") === "true",
    minStipend: Number(params.get("minStipend") || 0),
    sort: params.get("sort") || "latest",
    page: Number(params.get("page") || 1),
  });

  const set = (k, v) =>
    setF((p) => ({ ...p, [k]: v, ...(k !== "page" ? { page: 1 } : {}) }));

  const isJob = postType === "job";

  /* ── user + applied ── */
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;
    const h = { headers: { Authorization: `Bearer ${t}` } };

    axios.get(`${API}/api/user/profile`, h)
      .then(({ data }) => {
        setUser(data.user);
        setHasPremiumResume(!!(data.resume && data.resume.pdfPath));
        setAppliedCount(data.user?.monthlyApplicationsCount || 0);
      }).catch(() => {});

    axios.get(`${API}/api/application/my`, h)
      .then(({ data }) =>
        setAppliedIds(
  (data.applications || [])
    .map((a) => String(a.internshipId?._id || a.internshipId || ""))
    .filter(Boolean)
)
      ).catch(() => {});
  }, []);

  /* ── sidebar meta ── */
  const fetchMeta = useCallback(() => {
    axios.get(`${API}/api/internships/filters/meta?postType=${postType}`)
      .then(({ data }) => { if (data.success) setMeta(data.meta); })
      .catch(() => {});
  }, [postType]);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  /* ── list ── */
  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams({
        postType, limit: "9", page: String(f.page), sort: f.sort,
      });
      if (f.search) q.set("search", f.search);
      if (f.category) q.set("category", f.category);
      if (f.location) q.set("location", f.location);
      if (f.wfh) q.set("wfh", "true");
      if (f.partTime) q.set("partTime", "true");
      if (f.featured) q.set("featured", "true");
      if (f.minStipend > 0) q.set("minStipend", String(f.minStipend));

      const { data } = await axios.get(`${API}/api/internships?${q.toString()}`);
      setList(data.internships || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);

      const url = new URLSearchParams(q);
      url.delete("postType"); url.delete("limit");
      setParams(url, { replace: true });
    } catch (e) {
      console.error("Fetch failed:", e);
      setList([]); setTotal(0); setPages(1);
    } finally { setLoading(false); }
  }, [f, postType, setParams]);

  useEffect(() => {
    const t = setTimeout(fetchList, f.search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchList]);

  const reset = () => setF({ ...EMPTY_FILTERS });

  const activeCount = useMemo(
    () => [f.search, f.category, f.location, f.wfh, f.partTime, f.featured, f.minStipend > 0]
      .filter(Boolean).length,
    [f]
  );

  /* ══════════════════════════════════════════
     SIDEBAR  (variable, component nahi → focus safe)
  ══════════════════════════════════════════ */
  const sidebar = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-black text-white">
          <Filter size={15} className="text-indigo-400" /> Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-black">
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button onClick={reset}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300">
            <RotateCcw size={11} /> Clear all
          </button>
        )}
      </div>

      {/* ⚡ QUICK FILTERS */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          <Zap size={11} className="text-amber-400" /> Quick Filter
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={reset}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition active:scale-95 ${
              activeCount === 0
                ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                : "border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300"
            }`}
          >
            <Layers size={10} /> All
          </button>

          <button
            onClick={() => set("wfh", !f.wfh)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition active:scale-95 ${
              f.wfh
                ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                : "border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300"
            }`}
          >
            <Home size={10} /> Work From Home
            {meta.counts?.remote > 0 && (
              <span className="opacity-60">{meta.counts.remote}</span>
            )}
          </button>

          <button
            onClick={() => set("partTime", !f.partTime)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition active:scale-95 ${
              f.partTime
                ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                : "border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300"
            }`}
          >
            <Clock size={10} /> Part-time
            {meta.counts?.partTime > 0 && (
              <span className="opacity-60">{meta.counts.partTime}</span>
            )}
          </button>

          <button
            onClick={() => set("featured", !f.featured)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition active:scale-95 ${
              f.featured
                ? "border-amber-500 bg-amber-500/20 text-amber-300"
                : "border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300"
            }`}
          >
            <Flame size={10} /> Featured
          </button>

          <button
            onClick={() => set("sort", f.sort === "stipend-high" ? "latest" : "stipend-high")}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition active:scale-95 ${
              f.sort === "stipend-high"
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                : "border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300"
            }`}
          >
            ₹ High Stipend
          </button>
        </div>
      </div>

      <div className="h-px bg-gray-800/70" />

      {/* CATEGORY */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Category</p>
          {f.category && (
            <button onClick={() => set("category", "")} className="text-[10px] text-rose-400 hover:text-rose-300">
              clear
            </button>
          )}
        </div>

        <input
          value={f.category}
          onChange={(e) => set("category", e.target.value)}
          placeholder="Type or pick below..."
          className="mb-2 w-full rounded-xl border border-gray-800 bg-[#0a0f1c] px-3 py-2.5 text-xs text-white outline-none placeholder:text-gray-600 focus:border-indigo-500"
        />

        {meta.categories.length === 0 ? (
          <p className="text-[10px] italic text-gray-600">No categories yet</p>
        ) : (
          <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
            {meta.categories.slice(0, 15).map((c) => (
              <button
                key={c.name}
                onClick={() => set("category", f.category === c.name ? "" : c.name)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] transition ${
                  f.category === c.name
                    ? "bg-indigo-600/20 font-bold text-indigo-300"
                    : "text-gray-400 hover:bg-gray-800/60"
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className="ml-2 shrink-0 rounded bg-gray-800 px-1.5 text-[9px] text-gray-500">
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LOCATION */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Location</p>
          {f.location && (
            <button onClick={() => set("location", "")} className="text-[10px] text-rose-400 hover:text-rose-300">
              clear
            </button>
          )}
        </div>

        <input
          value={f.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="e.g. Mumbai"
          className="mb-2 w-full rounded-xl border border-gray-800 bg-[#0a0f1c] px-3 py-2.5 text-xs text-white outline-none placeholder:text-gray-600 focus:border-indigo-500"
        />

        <div className="flex flex-wrap gap-1.5">
          {meta.locations.slice(0, 8).map((l) => (
            <button
              key={l.name}
              onClick={() => set("location", f.location === l.name ? "" : l.name)}
              className={`rounded-lg border px-2 py-1 text-[10px] transition ${
                f.location === l.name
                  ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                  : "border-gray-800 text-gray-500 hover:border-gray-700"
              }`}
            >
              {l.name} <span className="opacity-50">{l.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CHECKBOX TOGGLES */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Preferences</p>
        {[
          { k: "wfh", label: "Work from home", icon: Home, count: meta.counts?.remote },
          { k: "partTime", label: "Part-time", icon: Clock, count: meta.counts?.partTime },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => set(t.k, !f[t.k])}
            className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
              f[t.k] ? "border-indigo-500/50 bg-indigo-500/10" : "border-gray-800 bg-[#0a0f1c] hover:border-gray-700"
            }`}
          >
            <div className={`flex h-4 w-4 items-center justify-center rounded border-2 transition ${
              f[t.k] ? "border-indigo-500 bg-indigo-500" : "border-gray-600"
            }`}>
              {f[t.k] && (
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <t.icon size={13} className={f[t.k] ? "text-indigo-400" : "text-gray-600"} />
            <span className={`flex-1 text-[11px] font-semibold ${f[t.k] ? "text-indigo-300" : "text-gray-400"}`}>
              {t.label}
            </span>
            {t.count > 0 && <span className="text-[9px] text-gray-600">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* STIPEND */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Min Stipend</p>
          <span className="text-[11px] font-black text-indigo-400">
            ₹{f.minStipend.toLocaleString("en-IN")}
          </span>
        </div>
        <input
          type="range" min={0} max={100000} step={1000}
          value={f.minStipend}
          onChange={(e) => set("minStipend", Number(e.target.value))}
          className="w-full cursor-pointer accent-indigo-500"
        />
        <div className="mt-1 flex justify-between text-[9px] text-gray-600">
          <span>₹0</span><span>₹50K</span><span>₹1L</span>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* HEADER */}
      <div className="border-b border-gray-800 bg-gray-900/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
            <Sparkles size={11} /> {isJob ? "Jobs" : "Internships"}
          </span>
          <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
            Find your perfect{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {isJob ? "job" : "internship"}
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            <b className="text-indigo-400">{total}</b> verified {isJob ? "jobs" : "internships"} · updated daily
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:px-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              value={f.search}
              onChange={(e) => set("search", e.target.value)}
              placeholder={`Search ${isJob ? "job" : "internship"}, company, skill...`}
              className="w-full rounded-xl border border-gray-800 bg-[#0a0f1c] py-2.5 pl-10 pr-9 text-sm text-white outline-none placeholder:text-gray-600 focus:border-indigo-500"
            />
            {f.search && (
              <button onClick={() => set("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative hidden sm:block">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <select
              value={f.sort}
              onChange={(e) => set("sort", e.target.value)}
              className="cursor-pointer appearance-none rounded-xl border border-gray-800 bg-[#0a0f1c] py-2.5 pl-9 pr-8 text-xs font-medium text-gray-300 outline-none focus:border-indigo-500"
            >
              {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>

          <button onClick={() => setMobileFilter(true)}
            className="relative rounded-xl border border-gray-800 bg-[#0a0f1c] p-2.5 text-gray-400 lg:hidden">
            <Filter size={16} />
            {activeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-black">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* ── ACTIVE FILTER PILLS ── */}
        {activeCount > 0 && (
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 pb-3 sm:px-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Active:</span>
            {[
              f.search && { k: "search", label: `"${f.search}"`, clear: () => set("search", "") },
              f.category && { k: "category", label: f.category, clear: () => set("category", "") },
              f.location && { k: "location", label: f.location, clear: () => set("location", "") },
              f.wfh && { k: "wfh", label: "Work From Home", clear: () => set("wfh", false) },
              f.partTime && { k: "partTime", label: "Part-time", clear: () => set("partTime", false) },
              f.featured && { k: "featured", label: "Featured", clear: () => set("featured", false) },
              f.minStipend > 0 && {
                k: "stipend",
                label: `≥ ₹${f.minStipend.toLocaleString("en-IN")}`,
                clear: () => set("minStipend", 0),
              },
            ].filter(Boolean).map((p) => (
              <span key={p.k}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold text-indigo-300">
                {p.label}
                <button onClick={p.clear} className="hover:text-white"><X size={10} /></button>
              </span>
            ))}
            <button onClick={reset}
              className="ml-1 text-[10px] font-bold text-rose-400 hover:text-rose-300">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="mx-auto max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:flex">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur">
            {sidebar}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing <b className="text-white">{list.length}</b> of <b className="text-white">{total}</b>
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-800 bg-gray-900 px-3 py-1 text-[10px] font-semibold text-gray-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live feed
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-800 bg-gray-900/50 p-16 text-center">
              <Inbox className="mx-auto mb-4 text-gray-700" size={44} />
              <h4 className="text-base font-bold text-gray-300">
                {activeCount > 0 ? "No results for these filters" : "No internships posted yet"}
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                {activeCount > 0 ? "Try changing filters or keyword." : "Check back soon!"}
              </p>
              {activeCount > 0 && (
                <button onClick={reset}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider hover:bg-indigo-500">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((it) => (
                 <InternshipCard
  key={it._id}
  internship={it}
  user={user}
  userSubscription={user?.subscription}
  hasPremiumResume={hasPremiumResume}
  totalAppliedCount={appliedCount}
  alreadyApplied={appliedIds.includes(String(it._id))}
  onApplied={() => {
    setAppliedCount((c) => c + 1);
    setAppliedIds((prev) =>
      prev.includes(String(it._id))
        ? prev
        : [...prev, String(it._id)]
    );
    fetchMeta();
  }}
/>
                ))}
              </div>

              {pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button disabled={f.page === 1} onClick={() => set("page", f.page - 1)}
                    className="rounded-xl border border-gray-800 px-4 py-2 text-[11px] font-bold text-gray-400 hover:border-indigo-500 hover:text-white disabled:opacity-30">
                    Prev
                  </button>
                  {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
                    const p = Math.max(1, Math.min(Math.max(1, pages - 4), f.page - 2)) + i;
                    if (p > pages) return null;
                    return (
                      <button key={p} onClick={() => set("page", p)}
                        className={`h-9 w-9 rounded-xl text-[11px] font-bold transition ${
                          f.page === p ? "bg-indigo-600 text-white" : "border border-gray-800 text-gray-400 hover:border-gray-700"
                        }`}>
                        {p}
                      </button>
                    );
                  })}
                  <button disabled={f.page === pages} onClick={() => set("page", f.page + 1)}
                    className="rounded-xl border border-gray-800 px-4 py-2 text-[11px] font-bold text-gray-400 hover:border-indigo-500 hover:text-white disabled:opacity-30">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileFilter && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileFilter(false)} />
          <div className="absolute bottom-0 max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border-t border-gray-800 bg-[#0b1120] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-black">Filters</h3>
              <button onClick={() => setMobileFilter(false)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {sidebar}

            <div className="mb-2 mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Sort By</p>
              <select value={f.sort} onChange={(e) => set("sort", e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-[#0a0f1c] px-3 py-2.5 text-xs text-gray-300 outline-none focus:border-indigo-500">
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>

            <button onClick={() => setMobileFilter(false)}
              className="sticky bottom-0 mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-xs font-black uppercase tracking-wider shadow-lg">
              Show {total} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Internships;