import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Send, MessageSquare, Link2, Check, MoreVertical, Mail, Trash2,
} from "lucide-react";

/* ── Brand icons ── */
const WhatsAppIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.739-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.013-5.101-2.861-6.958C16.425 2.01 13.96 1 12.009 1 6.575 1 2.15 5.37 2.146 10.797c-.001 1.524.404 3.013 1.171 4.316l-.985 3.595 3.725-.974z" />
  </svg>
);
const FacebookIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
  </svg>
);
const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedInIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-sky-500">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const TelegramIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);
const RedditIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const MENU_W = 224;
const GAP = 8;

export default function PostShareMenu({
  postId,
  onSendToFriend,
  onDelete,
  align = "right",
  icon = "send",
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coords, setCoords] = useState({ top: -9999, left: -9999, maxH: 480 });
  const [atBottom, setAtBottom] = useState(false);

  const btnRef = useRef(null);
  const menuRef = useRef(null);

  /* ═══════════ POSITIONING ═══════════ */
  const place = useCallback(() => {
    const btn = btnRef.current?.getBoundingClientRect();
    if (!btn) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const spaceBelow = vh - btn.bottom - GAP - 8;
    const spaceAbove = btn.top - GAP - 8;

    // jahan zyada jagah hai wahan kholo
    const openUp = spaceBelow < 260 && spaceAbove > spaceBelow;
    const avail = openUp ? spaceAbove : spaceBelow;
    const maxH = Math.max(200, Math.min(avail, vh * 0.7));

    const realH = Math.min(menuRef.current?.scrollHeight || maxH, maxH);

    let top = openUp ? btn.top - GAP - realH : btn.bottom + GAP;
    top = Math.max(8, Math.min(top, vh - realH - 8));

    let left = align === "right" ? btn.right - MENU_W : btn.left;
    left = Math.max(8, Math.min(left, vw - MENU_W - 8));

    setCoords({ top, left, maxH });
  }, [align]);

  /* pehle render ke baad actual height se dobara place karo */
  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  /* ═══════════ EVENTS ═══════════ */
  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };

    /* 🔑 THE FIX — menu ke andar ka scroll ignore karo */
    const onScroll = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return; // andar scroll → kuch mat karo

      // button screen se bahar chala gaya → close
      const btn = btnRef.current?.getBoundingClientRect();
      if (!btn || btn.bottom < 0 || btn.top > window.innerHeight) {
        setOpen(false);
        return;
      }
      place(); // warna menu ko button ke saath move karo
    };

    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  /* ═══════════ SHARE LOGIC ═══════════ */
  const postUrl = `${window.location.origin}/post/${postId}`;
  const shareText = `Check out this post on CareerSphere: ${postUrl}`;

  const shareSocial = (platform) => {
    const urls = {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent("Check out this post on CareerSphere")}`,
      reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent("Check out this post on CareerSphere")}`,
      email: `mailto:?subject=${encodeURIComponent("Check out this post on CareerSphere")}&body=${encodeURIComponent(shareText)}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
    } catch {
      const i = document.createElement("input");
      i.value = postUrl;
      document.body.appendChild(i);
      i.select();
      document.execCommand("copy");
      document.body.removeChild(i);
    }
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: "CareerSphere", text: "Check out this post", url: postUrl });
      setOpen(false);
    } catch { /* cancelled */ }
  };

  const socialRows = [
    { key: "whatsapp", label: "WhatsApp",    icon: <WhatsAppIcon />, bg: "bg-emerald-500/10" },
    { key: "facebook", label: "Facebook",    icon: <FacebookIcon />, bg: "bg-blue-500/10" },
    { key: "x",        label: "X / Twitter", icon: <XIcon />,        bg: "bg-white/10" },
    { key: "linkedin", label: "LinkedIn",    icon: <LinkedInIcon />, bg: "bg-sky-500/10" },
    { key: "telegram", label: "Telegram",    icon: <TelegramIcon />, bg: "bg-cyan-500/10" },
    { key: "reddit",   label: "Reddit",      icon: <RedditIcon />,   bg: "bg-orange-500/10" },
    { key: "email",    label: "Email",       icon: <Mail size={14} className="text-amber-400" />, bg: "bg-amber-500/10" },
  ];

  const rowCls =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-zinc-300 transition hover:bg-zinc-900 active:scale-[0.98]";

  return (
    <>
      {/* ── Trigger ── */}
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); open ? setOpen(false) : setOpen(true); }}
        title={icon === "dots" ? "Options" : "Share"}
        className={
          icon === "dots"
            ? `rounded-full border border-white/10 bg-black/40 p-2 text-white backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-black/60 ${open ? "rotate-90 bg-black/60" : ""}`
            : `flex items-center gap-1.5 text-xs font-bold transition-colors ${open ? "text-orange-400" : "text-zinc-400 hover:text-orange-400"}`
        }
      >
        {icon === "dots" ? <MoreVertical size={14} strokeWidth={2.5} /> : (<><Send className="h-4 w-4" /> Share</>)}
      </button>

      {/* ── Dropdown (portal) ── */}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: MENU_W,
              maxHeight: coords.maxH,
              zIndex: 9999,
            }}
            className="animate-[fadeIn_.12s_ease-out] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-black/60"
          >
            {/* scrollable body */}
            <div
              onScroll={(e) => {
                const el = e.currentTarget;
                setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 8);
              }}
              className="max-h-[inherit] overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar]:w-1"
              style={{ maxHeight: coords.maxH }}
            >
              <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-wider text-zinc-600">
                Share Post
              </p>

              {onSendToFriend && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setOpen(false); onSendToFriend(); }}
                  className={rowCls}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <MessageSquare size={14} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-zinc-200">Send to Friend</span>
                    <span className="block text-[9px] font-medium text-zinc-500">Chat message</span>
                  </span>
                </button>
              )}

              <button type="button" onClick={(e) => { e.stopPropagation(); copyLink(); }} className={rowCls}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Link2 size={14} />}
                </span>
                <span className={copied ? "text-emerald-400" : "text-zinc-200"}>
                  {copied ? "Link Copied!" : "Copy Link"}
                </span>
              </button>

              {typeof navigator !== "undefined" && navigator.share && (
                <button type="button" onClick={(e) => { e.stopPropagation(); nativeShare(); }} className={rowCls}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                    <Send size={13} />
                  </span>
                  <span className="text-zinc-200">More apps…</span>
                </button>
              )}

              <div className="my-2.5 h-px bg-zinc-900" />

              <p className="mb-1.5 px-1 text-[10px] font-black uppercase tracking-wider text-zinc-600">
                Social Media
              </p>

              {socialRows.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); shareSocial(row.key); }}
                  className={rowCls}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${row.bg}`}>
                    {row.icon}
                  </span>
                  <span className="text-zinc-200">{row.label}</span>
                </button>
              ))}

              {onDelete && (
                <>
                  <div className="my-2.5 h-px bg-zinc-900" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-400 transition hover:bg-red-500/10 active:scale-[0.98]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                      <Trash2 size={14} />
                    </span>
                    <span>Delete post</span>
                  </button>
                </>
              )}
            </div>

            {/* bottom fade — "aur options hain" ka hint */}
            {!atBottom && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent" />
            )}
          </div>,
          document.body
        )}
    </>
  );
}