import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Compass, PlusSquare, Send, User, Users, Globe,
  Briefcase, Building2, Menu, X, FileText, Crown, LogOut,
  LayoutDashboard, Search, ChevronDown, Clock, Trash2, TrendingUp,
  ArrowRight, Sparkles, CornerDownLeft, ShieldCheck, CheckCircle, Lock
} from "lucide-react";
import axios from "axios";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const LANGS = ["English", "Hindi", "Spanish", "Portuguese", "Chinese", "French"];

const LANG_MAP = {
  English: "en", Hindi: "hi", Spanish: "es",
  Portuguese: "pt", Chinese: "zh-CN", French: "fr",
};

/* ── 🏳️ REAL FLAG IMAGES + native names ── */
const LANG_META = {
  English:    { iso: "gb", code: "EN", native: "English"   },
  Hindi:      { iso: "in", code: "HI", native: "हिन्दी"     },
  Spanish:    { iso: "es", code: "ES", native: "Español"   },
  Portuguese: { iso: "pt", code: "PT", native: "Português" },
  Chinese:    { iso: "cn", code: "ZH", native: "中文"       },
  French:     { iso: "fr", code: "FR", native: "Français"  },
};

/* ── Reusable Flag <img> ── */
const Flag = ({ iso, className = "h-4 w-6" }) => (
  <img
    src={`https://flagcdn.com/w40/${iso}.png`}
    srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
    alt=""
    loading="lazy"
    className={`shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-black/30 ${className}`}
  />
);

const TRENDING = ["React Developer", "Remote Internship", "Data Analyst", "UI/UX Designer"];

/* ── Tiny Premium Tooltip ── */
const Tip = ({ children }) => (
  <span className="pointer-events-none absolute -bottom-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-zinc-700/80 bg-zinc-950/90 px-2.5 py-1 text-[11px] font-medium text-zinc-300 opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:translate-y-0.5 group-hover:opacity-100">
    {children}
  </span>
);

/* ── Dropdown Item ── */
const DropItem = ({ to, icon: Icon, children, className = "" }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-zinc-300 transition-all hover:bg-zinc-800/60 hover:text-white ${className}`}
  >
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800/70 text-zinc-400 transition-colors group-hover:text-white">
      <Icon size={14} />
    </div>
    {children}
  </Link>
);

/* ══════════════ 🌍 PREMIUM LANGUAGE PICKER ══════════════ */
const LangPicker = ({ language, onChange, variant = "desktop" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const meta = LANG_META[language] || LANG_META.English;
  const isFull = variant === "full";

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div ref={ref} className={`relative ${isFull ? "w-full" : ""}`}>
      {/* TRIGGER */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        translate="no"
        className={`notranslate flex items-center gap-2 rounded-xl border bg-zinc-900/60 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800/60 ${
          isFull ? "w-full justify-between" : ""
        } ${open ? "border-indigo-500/50 ring-4 ring-indigo-500/10" : "border-zinc-800/90 hover:border-zinc-700"}`}
      >
        <span className="flex items-center gap-2">
          <Flag iso={meta.iso} />
          <span className={isFull ? "" : "hidden sm:inline"}>{language}</span>
          {!isFull && <span className="sm:hidden">{meta.code}</span>}
        </span>
        <ChevronDown
          size={12}
          className={`text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* PANEL */}
      {open && (
        <div
          translate="no"
          className={`notranslate nb-pop absolute z-[70] overflow-hidden rounded-2xl border border-zinc-7/60 bg-[#0c101c]/95 p-1.5 shadow-[0_24px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl ${
            isFull ? "bottom-full left-0 right-0 mb-2" : "right-0 mt-2 w-60"
          }`}
        >
          <p className="flex items-center gap-1.5 px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <Globe size={11} className="text-indigo-400" /> Select Language
          </p>

          {/* 👈 CHANGED #1 : no-scrollbar added */}
          <div className="no-scrollbar max-h-72 space-y-0.5 overflow-y-auto overscroll-contain">
            {LANGS.map((l) => {
              const m = LANG_META[l];
              const active = language === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => { setOpen(false); onChange(l); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all ${
                    active
                      ? "border border-indigo-500/30 bg-indigo-600/15 text-white"
                      : "border border-transparent text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/70">
                    <Flag iso={m.iso} className="h-3.5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold">{l}</span>
                    <span className="block truncate text-[10px] text-zinc-500">{m.native}</span>
                  </span>

                  {l === "French" && !active && (
                    <Lock size={11} className="shrink-0 text-amber-40/80" />
                  )}
                  {active && (
                    <CheckCircle size={13} className="shrink-0 text-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-1 flex items-center gap-1 border-t border-zinc-800/80 px-2.5 pb-0.5 pt-1.5 text-[9px] text-zinc-600">
            <Lock size={9} className="text-amber-500/70" /> French requires OTP verification
          </p>
        </div>
      )}
    </div>
  );
};

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [me, setMe] = useState(null);

  /* ── Search State ── */
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggest, setSuggest] = useState({ internships: [], jobs: [], users: [] });
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("recentSearches")) || []; } catch { return []; }
  });

  const searchWrapRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  /* ── Avatar Dropdown ── */
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);

  /* ── User Info ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${API}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setMe(data.user))
      .catch(() => {});
  }, []);

  /* ── Reset selection index on query change ── */
  useEffect(() => {
    setActiveIdx(-1);
  }, [query]);

  /* ── Debounced live suggestions ── */
  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setSuggest({ internships: [], jobs: [], users: [] });
      setSuggestLoading(false);
      return;
    }

    setSuggestLoading(true);

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/api/search/suggest`, {
          params: { q },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSuggest({
          internships: data.internships || [],
          jobs: data.jobs || [],
          users: data.users || [],
        });
      } catch {
        setSuggest({ internships: [], jobs: [], users: [] });
      } finally {
        setSuggestLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  /* ── Flat list for keyboard navigation ── */
  const flatResults = useMemo(() => [
    ...suggest.internships.map((x) => ({ ...x, _kind: "internship", _to: `/internships/${x._id}` })),
    ...suggest.jobs.map((x) => ({ ...x, _kind: "job", _to: `/jobs/${x._id}` })),
    ...suggest.users.map((x) => ({ ...x, _kind: "user", _to: `/users/${x._id}` })),
  ], [suggest]);

  const saveRecentSearch = (term) => {
    const value = term.trim();
    if (!value) return;

    setRecent((prev) => {
      const next = [value, ...prev.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(next));
      return next;
    });
  };

  const goToSuggestion = (item) => {
    const typedQuery = query.trim();
    if (typedQuery) saveRecentSearch(typedQuery);

    navigate(item._to);
    setQuery("");
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setActiveIdx(-1);
  };

  const runSearch = (raw) => {
    const q = (raw ?? query).trim();
    if (!q) return;

    saveRecentSearch(q);
    setQuery("");
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setActiveIdx(-1);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const clearRecent = (e) => {
    e.stopPropagation();
    setRecent([]);
    localStorage.removeItem("recentSearches");
  };

  /* ── Keyboard Navigation ── */
  const onSearchKeyDown = (e) => {
    if (!searchOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!flatResults.length) return;
      setActiveIdx((current) => (current + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!flatResults.length) return;
      setActiveIdx((current) => (current <= 0 ? flatResults.length - 1 : current - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && flatResults[activeIdx]) {
        goToSuggestion(flatResults[activeIdx]);
      } else if (query.trim()) {
        runSearch();
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      setMobileSearchOpen(false);
    }
  };

  /* ── Route Change Effect ── */
  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
    setAvatarOpen(false);
    setSearchOpen(false);
  }, [path]);

  /* ── Outside Click ── */
  useEffect(() => {
    const onDown = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ── Ctrl+K / Cmd+K Global Shortcut ── */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth >= 768) {
          searchInputRef.current?.focus();
          setSearchOpen(true);
        } else {
          setMobileSearchOpen(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 60);
        }
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setAvatarOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── Google Translate ── */
  const changeUniversalLanguage = (lang) => {
    const googleSelect = document.querySelector(".goog-te-combo");
    if (googleSelect) {
      googleSelect.value = LANG_MAP[lang] || "en";
      googleSelect.dispatchEvent(new Event("change"));
    }
  };

  useEffect(() => {
    localStorage.setItem("language", language);
    const timer = setTimeout(() => changeUniversalLanguage(language), 1000);
    return () => clearTimeout(timer);
  }, [language]);

  const handleLanguageChange = async (selectedLanguage) => {
    if (selectedLanguage === language) return;

    try {
      const token = localStorage.getItem("token");

      if (selectedLanguage === "French") {
        await axios.post(`${API}/api/language/send-otp`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShowOtpModal(true);
        return;
      }

      await axios.post(`${API}/api/language/change`, { language: selectedLanguage }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLanguage(selectedLanguage);
    } catch (error) {
      setLanguage(localStorage.getItem("language") || "English");
      alert(error?.response?.data?.message || "Failed to change language");
    }
  };

  const verifyOtp = async () => {
    try {
      setOtpLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/language/verify-otp`, { otp }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLanguage("French");
      localStorage.setItem("language", "French");
      changeUniversalLanguage("French");
      setShowOtpModal(false);
      setOtp("");
      alert("Language changed to French");
    } catch (error) {
      alert(error?.response?.data?.message || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCancelOtp = () => {
    setShowOtpModal(false);
    setOtp("");
    setLanguage(localStorage.getItem("language") || "English");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const getAvatarUrl = (person) => {
    if (person?.profileImage) {
      return person.profileImage.startsWith("http")
        ? person.profileImage
        : `${API}${person.profileImage}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(person?.name || "User")}&background=6366f1&color=fff&bold=true`;
  };

  const avatar = getAvatarUrl(me);

  const NAV_LINKS = [
    { to: "/internships", label: "Internships", icon: Briefcase },
    { to: "/jobs", label: "Jobs", icon: Building2 },
    { to: "/resume", label: "Resume", icon: FileText },
    { to: "/pricing", label: "Pricing", icon: Crown },
  ];

  const ICON_LINKS = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/feed", icon: Compass, label: "Feed" },
    { to: "/shared-posts", icon: Send, label: "Shared" },
    { to: "/create-post", icon: PlusSquare, label: "Create" },
    { to: "/users", icon: Users, label: "Network" },
  ];

  /* ══════════════ SUGGESTION PANEL ══════════════ */
  const SuggestPanel = ({ mobile = false }) => (
    /* 👈 CHANGED #2 : no-scrollbar added */
    <div
      className={`nb-pop no-scrollbar overflow-hidden rounded-2xl border border-zinc-700/60 bg-[#0c101c]/95 shadow-[0_24px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ${
        mobile ? "mt-2.5 max-h-[65vh] overflow-y-auto" : "absolute left-0 right-0 top-[calc(100%+10px)] max-h-[75vh] overflow-y-auto"
      }`}
    >
      {/* 1. Empty Query -> Recent & Trending */}
      {!query.trim() && (
        <div className="p-3">
          {recent.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between px-2.5 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Recent Searches</span>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 transition-colors hover:text-rose-400"
                >
                  <Trash2 size={11} /> Clear
                </button>
              </div>
              <div className="space-y-0.5">
                {recent.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => runSearch(item)}
                    className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-zinc-300 transition-all hover:bg-zinc-800/60 hover:text-white"
                  >
                    <Clock size={13} className="text-zinc-500 transition-colors group-hover:text-indigo-400" />
                    <span className="flex-1 truncate">{item}</span>
                    <ArrowRight size={12} className="-translate-x-1 text-zinc-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-zinc-500">
              <TrendingUp size={12} className="text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Popular Searches</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1.5">
              {TRENDING.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => runSearch(tag)}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-900/80 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. 1 Character Hint */}
      {query.trim().length === 1 && (
        <div className="py-8 text-center text-xs font-medium text-zinc-500">
          Type at least <span className="font-semibold text-zinc-200">2 characters</span> to search...
        </div>
      )}

      {/* 3. Loading */}
      {suggestLoading && (
        <div className="flex items-center justify-center gap-2.5 py-8 text-xs text-zinc-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />
          Finding results...
        </div>
      )}

      {/* 4. No Results */}
      {!suggestLoading && query.trim().length >= 2 && flatResults.length === 0 && (
        <div className="px-4 py-8 text-center">
          <Search size={20} className="mx-auto mb-2 text-zinc-600" />
          <p className="text-xs font-semibold text-zinc-300">No exact matches for "{query.trim()}"</p>
          <p className="mt-1 text-[11px] text-zinc-500">Press Enter to perform a global search</p>
        </div>
      )}

      {/* 5. Results Found */}
      {!suggestLoading && flatResults.length > 0 && (
        /* 👈 CHANGED #3 : no-scrollbar added */
        <div className="no-scrollbar max-h-[380px] space-y-3 overflow-y-auto p-2">
          {/* INTERNSHIPS */}
          {suggest.internships.length > 0 && (
            <div>
              <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400/80">
                Internships ({suggest.internships.length})
              </p>
              {suggest.internships.map((item) => {
                const idx = flatResults.findIndex((x) => x._kind === "internship" && x._id === item._id);
                const isSelected = activeIdx === idx;
                return (
                  <button
                    key={`internship-${item._id}`}
                    type="button"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => goToSuggestion({ ...item, _to: `/internships/${item._id}` })}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all ${
                      isSelected
                        ? "border border-indigo-500/30 bg-indigo-600/15 text-white shadow-sm"
                        : "border border-transparent text-zinc-300 hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                      <Briefcase size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-zinc-100">{item.title}</p>
                      <p className="truncate text-[10px] text-zinc-400">
                        {item.companyName || item.company} {item.location ? `• ${item.location}` : ""}
                      </p>
                    </div>
                    {isSelected ? (
                      <CornerDownLeft size={13} className="shrink-0 text-indigo-400" />
                    ) : (
                      <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-300">
                        Intern
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* JOBS */}
          {suggest.jobs.length > 0 && (
            <div>
              <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                Jobs ({suggest.jobs.length})
              </p>
              {suggest.jobs.map((item) => {
                const idx = flatResults.findIndex((x) => x._kind === "job" && x._id === item._id);
                const isSelected = activeIdx === idx;
                return (
                  <button
                    key={`job-${item._id}`}
                    type="button"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => goToSuggestion({ ...item, _to: `/jobs/${item._id}` })}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all ${
                      isSelected
                        ? "border border-emerald-500/30 bg-emerald-600/15 text-white shadow-sm"
                        : "border border-transparent text-zinc-300 hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                      <Building2 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-zinc-100">{item.title}</p>
                      <p className="truncate text-[10px] text-zinc-400">
                        {item.companyName || item.company} {item.location ? `• ${item.location}` : ""}
                      </p>
                    </div>
                    {isSelected ? (
                      <CornerDownLeft size={13} className="shrink-0 text-emerald-400" />
                    ) : (
                      <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300">
                        Job
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* PEOPLE */}
          {suggest.users.length > 0 && (
            <div>
              <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-purple-400/80">
                People ({suggest.users.length})
              </p>
              {suggest.users.map((item) => {
                const idx = flatResults.findIndex((x) => x._kind === "user" && x._id === item._id);
                const isSelected = activeIdx === idx;
                return (
                  <button
                    key={`user-${item._id}`}
                    type="button"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => goToSuggestion({ ...item, _to: `/users/${item._id}` })}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all ${
                      isSelected
                        ? "border border-purple-500/30 bg-purple-600/15 text-white shadow-sm"
                        : "border border-transparent text-zinc-300 hover:bg-zinc-800/50"
                    }`}
                  >
                    <img
                      src={getAvatarUrl(item)}
                      alt={item.name}
                      className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-zinc-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-zinc-100">{item.name}</p>
                      <p className="truncate text-[10px] text-zinc-400">
                        {item.headline || "internArea member"}
                      </p>
                    </div>
                    {isSelected ? (
                      <CornerDownLeft size={13} className="shrink-0 text-purple-400" />
                    ) : (
                      <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-purple-300">
                        Member
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Bottom bar */}
      {query.trim().length >= 2 && (
        <div className="border-t border-zinc-800/80 bg-zinc-950/70 p-2">
          <button
            type="button"
            onClick={() => runSearch()}
            className="flex w-full items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-600/10 px-3 py-2 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-600/20"
          >
            <span className="flex items-center gap-2 truncate">
              <Search size={13} />
              Search all results for "{query.trim()}"
            </span>
            <span className="hidden shrink-0 items-center gap-1 text-[10px] text-zinc-400 sm:flex">
              Press <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-200">↵ Enter</kbd>
            </span>
          </button>
        </div>
      )}

      {/* Keyboard hints */}
      {!mobile && (
        <div className="hidden items-center justify-between border-t border-zinc-800/60 bg-zinc-950/40 px-3 py-1.5 text-[10px] text-zinc-500 sm:flex">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[9px] text-zinc-300">↑↓</kbd> to navigate</span>
            <span><kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[9px] text-zinc-300">esc</kbd> to dismiss</span>
          </div>
          <span>internArea Search</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 👈 CHANGED #4 : .no-scrollbar CSS added */}
      <style>{`
        @keyframes nbPop {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nb-pop { animation: nbPop 0.18s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* 🚫 HIDE SCROLLBAR — scroll still works */
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      {/* ═══════ SECURITY OTP MODAL ═══════ */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="nb-pop w-full max-w-sm rounded-3xl border border-zinc-800 bg-[#0e121d] p-6 text-white shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-center text-lg font-bold tracking-tight">Verify Identity</h2>
            <p className="mb-5 mt-1 flex flex-wrap items-center justify-center gap-1 text-center text-xs text-zinc-400">
              Enter verification code to switch language to
              <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-200" translate="no">
                <Flag iso="fr" className="h-3 w-4" /> French
              </span>
            </p>
            <input
              type="text"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="mb-5 w-full rounded-xl border border-zinc-700 bg-zinc-900/60 p-3 text-center font-mono text-lg tracking-[0.4em] text-white transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleCancelOtp}
                className="w-1/2 rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!otp || otpLoading}
                onClick={verifyOtp}
                className="w-1/2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:opacity-90 disabled:opacity-50"
              >
                {otpLoading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ NAVBAR ═══════ */}
      <nav className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080b13]/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2.5 px-3 sm:px-6">

          {/* ✅ LOGO - Updated with fav.png */}
          <Link to="/home" className="group flex shrink-0 items-center gap-2.5">
            <img 
              src="/fav.png" 
              alt="internArea Logo" 
              className="h-9 w-9 rounded-xl object-contain shadow-md shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105 ring-1 ring-white/10 bg-white/5 p-0.5"
            />
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
              intern<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Area</span>
            </span>
          </Link>

          {/* SEARCH (Desktop) */}
          <div ref={searchWrapRef} className="relative hidden w-full max-w-xs flex-1 md:block lg:max-w-md">
            <form onSubmit={(e) => { e.preventDefault(); runSearch(); }} className="group relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-indigo-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                autoComplete="off"
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={onSearchKeyDown}
                placeholder="Search internships, jobs, people..."
                className="w-full rounded-2xl border border-zinc-800/90 bg-[#101422]/70 py-2 pl-9 pr-16 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-indigo-500/60 focus:bg-[#101422] focus:ring-4 focus:ring-indigo-500/15"
              />

              <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {query ? (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); searchInputRef.current?.focus(); }}
                    className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                ) : (
                  <kbd className="pointer-events-none hidden items-center gap-0.5 rounded-lg border border-zinc-700/70 bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-zinc-400 xl:flex">
                    ⌘K
                  </kbd>
                )}
              </div>
            </form>

            {searchOpen && <SuggestPanel />}
          </div>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => {
              const active = path.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
                    active
                      ? "border border-indigo-500/30 bg-indigo-600/15 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                      : "border border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <l.icon size={14} /> {l.label}
                </Link>
              );
            })}
          </div>

          {/* RIGHT UTILITIES */}
          <div className="flex items-center gap-2">

            {/* Mobile Search Toggle */}
            <button
              onClick={() => {
                setMobileSearchOpen((o) => !o);
                if (!mobileSearchOpen) {
                  setTimeout(() => mobileSearchInputRef.current?.focus(), 60);
                }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-colors hover:text-white md:hidden"
            >
              {mobileSearchOpen ? <X size={16} /> : <Search size={16} />}
            </button>

            {/* 🌍 LANGUAGE (2xl) */}
            <div className="hidden 2xl:block">
              <LangPicker language={language} onChange={handleLanguageChange} />
            </div>

            {/* Icon Links (xl) */}
            <div className="hidden items-center gap-0.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-1 xl:flex">
              {ICON_LINKS.map((i) => {
                const active = path === i.to;
                return (
                  <Link
                    key={i.to}
                    to={i.to}
                    className={`group relative flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                      active
                        ? "border border-indigo-500/30 bg-indigo-600/20 text-indigo-400"
                        : "border border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    }`}
                  >
                    <i.icon size={16} />
                    <Tip>{i.label}</Tip>
                  </Link>
                );
              })}
            </div>

            {/* Avatar Dropdown */}
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setAvatarOpen((o) => !o)}
                className={`flex items-center gap-1.5 rounded-full p-0.5 ring-2 transition-all duration-200 ${
                  avatarOpen || path === "/profile"
                    ? "bg-indigo-500/10 ring-indigo-500"
                    : "ring-transparent hover:ring-zinc-700"
                }`}
              >
                <img src={avatar} alt="me" className="h-8 w-8 rounded-full border border-zinc-700 object-cover" />
                <ChevronDown size={12} className={`hidden text-zinc-400 transition-transform duration-200 sm:block ${avatarOpen ? "rotate-180" : ""}`} />
              </button>

              {avatarOpen && (
                <div className="nb-pop absolute right-0 top-[calc(100%+10px)] w-64 rounded-2xl border border-zinc-800 bg-[#0c101a] p-1.5 shadow-2xl backdrop-blur-2xl">
                  <div className="mb-1 rounded-xl border border-zinc-800/70 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/30" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-white">{me?.name || "Guest User"}</p>
                        <p className="truncate text-[10px] text-zinc-400">{me?.email || "guest@internarea.com"}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-500/15 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-300">
                        <CheckCircle size={10} /> {me?.subscription || "Free Tier"}
                      </span>
                      {me?.subscription !== "Gold" && (
                        <Link to="/pricing" className="text-[10px] font-bold text-amber-400 transition-colors hover:text-amber-300">
                          Upgrade ↗
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <DropItem to="/profile" icon={User}>My Profile</DropItem>
                    <DropItem to="/dashboard" icon={LayoutDashboard}>My Resume</DropItem>
                    <DropItem to="/pricing" icon={Crown}>Pricing Plans</DropItem>
                    {me?.role === "admin" && (
                      <DropItem to="/admin" icon={Crown} className="text-purple-300 hover:bg-purple-500/10">
                        Admin Console
                      </DropItem>
                    )}
                  </div>

                  {/* 🌍 LANGUAGE (small screens) */}
                  <div className="my-1 border-t border-zinc-800/80 px-1.5 pt-2 2xl:hidden">
                    <LangPicker language={language} onChange={handleLanguageChange} variant="full" />
                  </div>

                  <div className="border-t border-zinc-800/80 pt-1">
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Logout */}
            <button
              onClick={logout}
              className="group relative hidden h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-all hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 lg:flex"
            >
              <LogOut size={15} className="transition-transform group-hover:translate-x-0.5" />
              <Tip>Logout</Tip>
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 transition-colors hover:text-white xl:hidden"
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* ═══════ MOBILE SEARCH ═══════ */}
        {mobileSearchOpen && (
          <div className="border-t border-zinc-800/80 bg-[#0c101a] p-3 md:hidden">
            <div className="mx-auto max-w-7xl">
              <form onSubmit={(e) => { e.preventDefault(); runSearch(); }} className="relative">
                <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={query}
                  autoComplete="off"
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search internships, jobs, people..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-9 pr-14 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-indigo-500"
                >
                  Go
                </button>
              </form>

              <SuggestPanel mobile />
            </div>
          </div>
        )}
      </nav>

      {/* ═══════ MOBILE DRAWER ═══════ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

          {/* 👈 no-scrollbar bhi laga diya drawer pe */}
          <aside className="no-scrollbar fixed inset-y-0 right-0 flex h-full w-full max-w-xs flex-col justify-between overflow-y-auto border-l border-zinc-800 bg-[#0b0f19] p-5 shadow-2xl">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <Link to="/profile" className="flex items-center gap-3">
                  <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white">{me?.name || "Guest User"}</p>
                    <p className="truncate text-[10px] text-zinc-400">{me?.email || "Not logged in"}</p>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Explore</p>
                  <div className="space-y-1">
                    {NAV_LINKS.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                          path.startsWith(l.to)
                            ? "border border-indigo-500/30 bg-indigo-600/15 text-indigo-300"
                            : "text-zinc-300 hover:bg-zinc-800/60"
                        }`}
                      >
                        <l.icon size={16} /> {l.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Community</p>
                  <div className="space-y-1">
                    {[...ICON_LINKS,
                      { to: "/profile", icon: User, label: "Profile" },
                      { to: "/dashboard", icon: LayoutDashboard, label: "My Resume" }].map((i) => (
                      <Link
                        key={i.to}
                        to={i.to}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                          path === i.to
                            ? "border border-indigo-500/30 bg-indigo-600/15 text-indigo-300"
                            : "text-zinc-300 hover:bg-zinc-800/60"
                        }`}
                      >
                        <i.icon size={16} /> {i.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-zinc-800/80 pt-4">
              <div>
                <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Language</p>
                <LangPicker language={language} onChange={handleLanguageChange} variant="full" />
              </div>

              {me?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 py-2.5 text-xs font-bold text-purple-300"
                >
                  <Crown size={15} /> Admin Console
                </Link>
              )}

              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-400 transition-all hover:bg-rose-500/20"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Navbar;