import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Search, Briefcase, Building2, Users, MapPin, Wallet, Lock, Crown,
} from "lucide-react";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const TABS = [
  { key: "all", label: "All", icon: Search },
  { key: "internships", label: "Internships", icon: Briefcase },
  { key: "jobs", label: "Jobs", icon: Building2 },
  { key: "users", label: "People", icon: Users },
];

const SearchResults = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const type = params.get("type") || "all";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;

    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/search`, {
          params: { q, type },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [q, type]);

  const setTab = (key) => setParams({ q, type: key });
  const counts = data?.counts || {};

  return (
    <div className="min-h-screen bg-[#0b0f19] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">Search Results</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">
            "{q}" {data && <span className="text-sm font-semibold text-zinc-500">· {counts.total || 0} found</span>}
          </h1>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = type === t.key;
            const badge = t.key === "all" ? counts.total : counts[t.key];
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[12px] font-bold transition ${
                  active ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300" : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white"
                }`}
              >
                <t.icon size={14} /> {t.label}
                {badge > 0 && <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400">{badge}</span>}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50" />
            ))}
          </div>
        )}

        {!loading && data && (
          <div className="space-y-8">
            {!!data.internships?.length && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-zinc-400">
                  <Briefcase size={15} className="text-indigo-400" /> Internships
                </h2>
                <div className="space-y-2.5">
                  {data.internships.map((it) => (
                    <Link key={it._id} to={`/internships/${it._id}`} className="block rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:-translate-y-0.5 hover:border-indigo-500/40">
                      <p className="font-bold text-white">{it.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{it.company}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-zinc-400">
                        {it.location && <span className="flex items-center gap-1 rounded-lg bg-zinc-800/70 px-2 py-1"><MapPin size={10} /> {it.location}</span>}
                        {it.stipend && <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-emerald-300"><Wallet size={10} /> ₹{it.stipend}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {!!data.jobs?.length && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-zinc-400">
                  <Building2 size={15} className="text-emerald-400" /> Jobs
                </h2>
                <div className="space-y-2.5">
                  {data.jobs.map((jb) => (
                    <Link key={jb._id} to={`/jobs/${jb._id}`} className="block rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:-translate-y-0.5 hover:border-emerald-500/40">
                      <p className="font-bold text-white">{jb.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{jb.company}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-zinc-400">
                        {jb.location && <span className="flex items-center gap-1 rounded-lg bg-zinc-800/70 px-2 py-1"><MapPin size={10} /> {jb.location}</span>}
                        {jb.salary && <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-emerald-300"><Wallet size={10} /> {jb.salary}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {!!data.users?.length && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-zinc-400">
                  <Users size={15} className="text-purple-400" /> People
                </h2>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {data.users.map((u) => {
                    const img = u.profileImage
                      ? u.profileImage.startsWith("http") ? u.profileImage : `${API}${u.profileImage}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}&background=6366f1&color=fff`;
                    return (
                      <Link key={u._id} to={`/users/${u._id}`} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3.5 transition hover:border-purple-500/40">
                        <img src={img} alt="" className="h-11 w-11 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{u.name}</p>
                          <p className="truncate text-[11px] text-zinc-500">{u.headline || "CareerSphere member"}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {data.lockedCount > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-5 text-center">
                <Lock size={20} className="mx-auto mb-2 text-amber-400" />
                <p className="text-sm font-bold text-amber-200">{data.lockedCount} more results hidden</p>
                <p className="mt-1 text-[11px] text-zinc-400">Your {data.plan} plan shows up to {data.limit} results per category.</p>
                <Link to="/pricing" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white">
                  <Crown size={13} /> Upgrade Plan
                </Link>
              </div>
            )}

            {!data.internships?.length && !data.jobs?.length && !data.users?.length && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16 text-center">
                <Search size={28} className="mx-auto mb-3 text-zinc-700" />
                <p className="font-bold text-zinc-300">No results found</p>
                <p className="mt-1 text-xs text-zinc-500">Try different keywords or check spelling.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;