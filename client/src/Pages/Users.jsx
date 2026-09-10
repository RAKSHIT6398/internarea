import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  UserPlus, UserCheck, Clock, Search, Sparkles, Check, X,
  LayoutGrid, List, ChevronLeft, ChevronRight, Users2, Inbox,
  ArrowUpDown, RotateCw, SlidersHorizontal,
} from "lucide-react";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

/* ════════ Swal preset ════════ */
const toast = (icon, title, text, iconColor) =>
  Swal.fire({
    icon, title, text,
    timer: 1500, showConfirmButton: false,
    background: "#18181b", color: "#fff", iconColor,
    toast: true, position: "top-end",
  });

/* ════════ Tabs ════════ */
const TABS = [
  { key: "all",      label: "All",      Icon: Users2 },
  { key: "received", label: "Requests", Icon: Inbox },
  { key: "accepted", label: "Friends",  Icon: UserCheck },
  { key: "pending",  label: "Sent",     Icon: Clock },
];

const PAGE_SIZES = [12, 24, 48];

export default function Users() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busyId, setBusyId]       = useState(null);
  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch]       = useState("");
  const [tab, setTab]             = useState("all");
  const [view, setView]           = useState(localStorage.getItem("usersView") || "grid");
  const [sort, setSort]           = useState("az");
  const [page, setPage]           = useState(1);
  const [perPage, setPerPage]     = useState(12);

  const searchRef = useRef(null);
  const topRef    = useRef(null);

  /* ── fetch ── */
  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/friend/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const onFocus = () => fetchUsers(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  /* ── debounce search ── */
  useEffect(() => {
    const t = setTimeout(() => { setSearch(rawSearch); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [rawSearch]);

  /* ── "/" shortcut ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault(); searchRef.current?.focus();
      }
      if (e.key === "Escape") { setRawSearch(""); searchRef.current?.blur(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => localStorage.setItem("usersView", view), [view]);

  /* ── actions ── */
  const patch = (id, data) =>
    setUsers((p) => p.map((u) => (u._id === id ? { ...u, ...data } : u)));

  const sendRequest = async (id) => {
    setBusyId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/friend/send`, { friendId: id },
        { headers: { Authorization: `Bearer ${token}` } });
      patch(id, { relationship: "pending" });
      toast("success", "Request Sent", "", "#f97316");
    } catch (e) { console.error(e); toast("error", "Failed", "", "#ef4444"); }
    finally { setBusyId(null); }
  };

  const handleAccept = async (requestId, id) => {
    setBusyId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/friend/accept`, { requestId },
        { headers: { Authorization: `Bearer ${token}` } });
      patch(id, { relationship: "accepted" });
      toast("success", "You're now friends", "", "#10b981");
    } catch (e) { console.error(e); }
    finally { setBusyId(null); }
  };

  const handleReject = async (requestId, id) => {
    setBusyId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/friend/reject`, {
        headers: { Authorization: `Bearer ${token}` }, data: { requestId },
      });
      patch(id, { relationship: "none", requestId: null });
      toast("info", "Request rejected", "", "#ef4444");
    } catch (e) { console.error(e); }
    finally { setBusyId(null); }
  };

  /* ── counts ── */
  const counts = useMemo(() => ({
    all:      users.length,
    received: users.filter((u) => u.relationship === "received").length,
    accepted: users.filter((u) => u.relationship === "accepted").length,
    pending:  users.filter((u) => u.relationship === "pending").length,
  }), [users]);

  /* ── filter + sort ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = users.filter((u) => {
      const okTab = tab === "all" ? true : u.relationship === tab;
      const okSearch = !q ||
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      return okTab && okSearch;
    });
    list = [...list].sort((a, b) => {
      if (sort === "az") return (a.name || "").localeCompare(b.name || "");
      if (sort === "za") return (b.name || "").localeCompare(a.name || "");
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return list;
  }, [users, search, tab, sort]);

  /* ── paginate ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const goPage = (n) => {
    setPage(Math.min(Math.max(1, n), totalPages));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pageNumbers = useMemo(() => {
    const out = [], d = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safePage - d && i <= safePage + d)) out.push(i);
      else if (out[out.length - 1] !== "…") out.push("…");
    }
    return out;
  }, [totalPages, safePage]);

  const avatar = (u) =>
    u.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "U")}&background=ff6b00&color=fff&size=160&bold=true`;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] text-white pb-24">
      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-7 text-center sm:px-6">
          <h1 className="flex items-center justify-center gap-2.5 text-3xl font-black tracking-tight md:text-4xl">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Discover People
            </span>
            <Sparkles className="animate-pulse text-orange-500" size={24} />
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[13px] text-zinc-400">
            Connect with developers & professionals across CareerSphere.
          </p>
        </div>
      </div>

      <div ref={topRef} className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ═══ STICKY TOOLBAR ═══ */}
        <div className="sticky top-[60px] z-30 -mx-4 mb-6 border-b border-zinc-800/60 bg-[#0b0f19]/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
          {/* Row 1: search + view */}
          <div className="flex items-center gap-3">
            <div className="group relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition group-focus-within:text-orange-500" />
              <input
                ref={searchRef}
                value={rawSearch}
                onChange={(e) => setRawSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-11 pr-20 text-[13px] font-medium text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                {rawSearch && (
                  <button onClick={() => setRawSearch("")} className="text-zinc-500 hover:text-white">
                    <X size={14} />
                  </button>
                )}
                <kbd className="hidden rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-500 sm:block">/</kbd>
              </div>
            </div>

            {/* sort */}
            <div className="relative hidden sm:block">
              <ArrowUpDown size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer appearance-none rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-8 pr-8 text-[12px] font-semibold text-zinc-300 outline-none hover:border-zinc-700"
              >
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="new">Newest</option>
              </select>
            </div>

            {/* view toggle */}
            <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
              {[["grid", LayoutGrid], ["list", List]].map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-lg p-1.5 transition ${
                    view === v ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchUsers(true)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-zinc-500 transition hover:border-zinc-700 hover:text-orange-400 active:rotate-180"
              title="Refresh"
            >
              <RotateCw size={15} />
            </button>
          </div>

          {/* Row 2: tabs */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(({ key, label, Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => { setTab(key); setPage(1); }}
                  className={`group flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                    active
                      ? "border-orange-500/40 bg-orange-500/15 text-orange-400"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  <span className={`rounded-full px-1.5 py-px text-[10px] font-black ${
                    key === "received" && counts.received > 0 && !active
                      ? "bg-red-500 text-white"
                      : active ? "bg-orange-500/25 text-orange-300" : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {counts[key]}
                  </span>
                </button>
              );
            })}

            <span className="ml-auto hidden shrink-0 items-center gap-1.5 text-[11px] font-medium text-zinc-600 sm:flex">
              <SlidersHorizontal size={11} />
              {filtered.length} result{filtered.length !== 1 && "s"}
            </span>
          </div>
        </div>

        {/* ═══ CONTENT ═══ */}
        {loading ? (
          <SkeletonBlock view={view} />
        ) : paged.length === 0 ? (
          <EmptyState tab={tab} search={search} onClear={() => { setRawSearch(""); setTab("all"); }} />
        ) : view === "grid" ? (
          /* ─── GRID ─── */
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {paged.map((u) => (
              <div
                key={u._id}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_12px_40px_rgba(0,0,0,.5)]"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl transition group-hover:bg-orange-500/20" />
                <StatusRing rel={u.relationship}>
                  <Link to={`/users/${u._id}`}>
                    <img src={avatar(u)} alt={u.name}
                      className="h-16 w-16 rounded-full object-cover transition group-hover:scale-105" />
                  </Link>
                </StatusRing>

                <Link to={`/users/${u._id}`} className="mt-3 w-full truncate text-center text-[13.5px] font-black text-zinc-100 transition hover:text-orange-400">
                  {u.name}
                </Link>
                <p className="mb-4 w-full truncate text-center text-[10.5px] text-zinc-600">{u.email}</p>

                <div className="mt-auto w-full">
                  <ActionBtn u={u} busy={busyId === u._id}
                    onSend={sendRequest} onAccept={handleAccept} onReject={handleReject} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ─── LIST ─── */
          <div className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/30 backdrop-blur-xl">
            {paged.map((u, i) => (
              <div
                key={u._id}
                className={`group flex items-center gap-3 px-4 py-3 transition hover:bg-zinc-800/30 ${
                  i !== paged.length - 1 ? "border-b border-zinc-800/50" : ""
                }`}
              >
                <StatusRing rel={u.relationship} sm>
                  <Link to={`/users/${u._id}`}>
                    <img src={avatar(u)} alt={u.name} className="h-10 w-10 rounded-full object-cover" />
                  </Link>
                </StatusRing>

                <div className="min-w-0 flex-1">
                  <Link to={`/users/${u._id}`} className="block truncate text-[13px] font-bold text-zinc-100 transition hover:text-orange-400">
                    {u.name}
                  </Link>
                  <p className="truncate text-[11px] text-zinc-600">{u.email}</p>
                </div>

                <div className="w-[180px] shrink-0 sm:w-[200px]">
                  <ActionBtn u={u} busy={busyId === u._id} compact
                    onSend={sendRequest} onAccept={handleAccept} onReject={handleReject} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ PAGINATION ═══ */}
        {!loading && filtered.length > 0 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-[11.5px] text-zinc-600">
              Showing{" "}
              <span className="font-bold text-zinc-400">
                {(safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filtered.length)}
              </span>{" "}
              of <span className="font-bold text-zinc-400">{filtered.length}</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(+e.target.value); setPage(1); }}
                className="ml-2 cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-zinc-400 outline-none"
              >
                {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} / page</option>)}
              </select>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <PageBtn onClick={() => goPage(safePage - 1)} disabled={safePage === 1}>
                  <ChevronLeft size={15} />
                </PageBtn>
                {pageNumbers.map((n, i) =>
                  n === "…" ? (
                    <span key={`e${i}`} className="px-1 text-xs text-zinc-700">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => goPage(n)}
                      className={`h-8 min-w-[32px] rounded-lg px-2 text-[12px] font-bold transition ${
                        n === safePage
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/20"
                          : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}
                <PageBtn onClick={() => goPage(safePage + 1)} disabled={safePage === totalPages}>
                  <ChevronRight size={15} />
                </PageBtn>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════ SUB-COMPONENTS ════════ */

function StatusRing({ rel, children, sm }) {
  const ring =
    rel === "accepted" ? "ring-emerald-500/60"
    : rel === "received" ? "ring-blue-500/60"
    : rel === "pending" ? "ring-amber-500/50"
    : "ring-zinc-800";
  const dot =
    rel === "accepted" ? "bg-emerald-500"
    : rel === "received" ? "bg-blue-500"
    : rel === "pending" ? "bg-amber-500"
    : null;
  return (
    <div className={`relative rounded-full ring-2 ${ring} ring-offset-2 ring-offset-[#0b0f19]`}>
      {children}
      {dot && (
        <span className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[#0b0f19] ${dot} ${sm ? "h-2.5 w-2.5" : "h-3 w-3"}`} />
      )}
    </div>
  );
}

function ActionBtn({ u, busy, compact, onSend, onAccept, onReject }) {
  const base = `w-full inline-flex items-center justify-center gap-1.5 rounded-lg font-bold tracking-wide transition-all active:scale-95 ${
    compact ? "py-1.5 text-[11px]" : "py-2 text-[11.5px]"
  }`;

  if (busy)
    return <div className={`${base} border border-zinc-800 bg-zinc-800/40 text-zinc-500`}>
      <RotateCw size={12} className="animate-spin" /> …
    </div>;

  if (u.relationship === "accepted")
    return <div className={`${base} border border-emerald-500/20 bg-emerald-500/10 text-emerald-400`}>
      <UserCheck size={12} /> Friends
    </div>;

  if (u.relationship === "pending")
    return <div className={`${base} border border-amber-500/20 bg-amber-500/10 text-amber-400`}>
      <Clock size={12} /> Requested
    </div>;

  if (u.relationship === "received")
    return (
      <div className="flex w-full gap-1.5">
        <button onClick={() => onAccept(u.requestId, u._id)}
          className={`${base} bg-emerald-600 text-white hover:bg-emerald-500`}>
          <Check size={12} /> Accept
        </button>
        <button onClick={() => onReject(u.requestId, u._id)}
          className={`${base} border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white`}>
          <X size={12} />
        </button>
      </div>
    );

  return (
    <button onClick={() => onSend(u._id)}
      className={`${base} bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/10 hover:from-orange-600 hover:to-pink-600`}>
      <UserPlus size={12} /> Add Friend
    </button>
  );
}

function SkeletonBlock({ view }) {
  const n = view === "grid" ? 8 : 6;
  return view === "grid" ? (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="flex flex-col items-center rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5">
          <div className="h-16 w-16 animate-pulse rounded-full bg-zinc-800" />
          <div className="mt-3 h-3 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="mt-2 h-2.5 w-32 animate-pulse rounded bg-zinc-800/60" />
          <div className="mt-4 h-8 w-full animate-pulse rounded-lg bg-zinc-800/60" />
        </div>
      ))}
    </div>
  ) : (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/30">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-zinc-800/50 px-4 py-3 last:border-0">
          <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-800" />
          <div className="flex-1">
            <div className="h-3 w-32 animate-pulse rounded bg-zinc-800" />
            <div className="mt-2 h-2.5 w-44 animate-pulse rounded bg-zinc-800/60" />
          </div>
          <div className="h-7 w-[180px] animate-pulse rounded-lg bg-zinc-800/60" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tab, search, onClear }) {
  const msg = search
    ? { t: "No matches found", s: `Nothing for "${search}". Try a different name or email.` }
    : tab === "received" ? { t: "No pending requests", s: "You're all caught up 🎉" }
    : tab === "accepted" ? { t: "No friends yet", s: "Head to All and send some requests." }
    : tab === "pending"  ? { t: "No sent requests", s: "Requests you send will appear here." }
    : { t: "No users found", s: "Check back later." };

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-zinc-800/60 bg-zinc-900/20 px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
        <Users2 size={22} className="text-zinc-600" />
      </div>
      <h3 className="text-sm font-bold text-zinc-300">{msg.t}</h3>
      <p className="mt-1.5 text-[12px] text-zinc-600">{msg.s}</p>
      {(search || tab !== "all") && (
        <button onClick={onClear}
          className="mt-5 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-[11.5px] font-bold text-zinc-400 transition hover:border-orange-500/40 hover:text-orange-400">
          Clear filters
        </button>
      )}
    </div>
  );
}

function PageBtn({ children, ...p }) {
  return (
    <button
      {...p}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-zinc-800"
    >
      {children}
    </button>
  );
}