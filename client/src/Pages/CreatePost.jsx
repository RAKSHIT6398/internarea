import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  ImagePlus, Trash2, Send, Users, Infinity as InfinityIcon, Clock,
  Smile, Hash, X, Eye, FileVideo, FileImage, AlertCircle, Sparkles,
  CheckCircle2, Loader2, UploadCloud,
} from "lucide-react";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const MAX_CAPTION = 2200;
const MAX_IMG_MB = 10;
const MAX_VID_MB = 50;

const EMOJIS = ["🎉", "🚀", "💼", "🔥", "💡", "✅", "🙌", "📈", "💻", "🎯", "⚡", "🏆"];
const HASHTAGS = [
  "#internship", "#hiring", "#opentowork", "#webdev",
  "#react", "#nodejs", "#career", "#placement", "#coding", "#interview",
];

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quota, setQuota] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [me, setMe] = useState(null);

  const fileInputRef = useRef(null);
  const captionRef = useRef(null);
  const dragCounter = useRef(0);
  const navigate = useNavigate();

  /* ═══ fetch quota + me ═══ */
  const fetchQuota = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API}/api/post/quota`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuota(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchQuota();
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u) setMe(u);
    } catch { /* ignore */ }
  }, [fetchQuota]);

  /* ═══ unsaved warning ═══ */
  useEffect(() => {
    const dirty = caption.trim() || file;
    const handler = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [caption, file]);

  /* ═══ revoke blob url ═══ */
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  /* ═══ file handling ═══ */
  const validateAndSet = (f) => {
    if (!f) return;
    const isImg = f.type.startsWith("image/");
    const isVid = f.type.startsWith("video/");
    if (!isImg && !isVid) return toast.error("Only images and videos are allowed");

    const mb = f.size / 1024 / 1024;
    const max = isVid ? MAX_VID_MB : MAX_IMG_MB;
    if (mb > max) return toast.error(`File too large. Max ${max}MB for ${isVid ? "videos" : "images"}`);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ═══ drag & drop ═══ */
  useEffect(() => {
    const onEnter = (e) => { e.preventDefault(); dragCounter.current++; if (e.dataTransfer?.types?.includes("Files")) setDragging(true); };
    const onLeave = (e) => { e.preventDefault(); dragCounter.current--; if (dragCounter.current <= 0) { setDragging(false); dragCounter.current = 0; } };
    const onOver  = (e) => e.preventDefault();
    const onDrop  = (e) => {
      e.preventDefault(); setDragging(false); dragCounter.current = 0;
      validateAndSet(e.dataTransfer?.files?.[0]);
    };
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [previewUrl]);

  /* ═══ paste image ═══ */
  useEffect(() => {
    const onPaste = (e) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
      if (item) { validateAndSet(item.getAsFile()); toast.info("Image pasted 📋"); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [previewUrl]);

  /* ═══ insert text at cursor ═══ */
  const insertAtCursor = (txt) => {
    const el = captionRef.current;
    if (!el) return setCaption((c) => (c + txt).slice(0, MAX_CAPTION));
    const s = el.selectionStart, e = el.selectionEnd;
    const next = (caption.slice(0, s) + txt + caption.slice(e)).slice(0, MAX_CAPTION);
    setCaption(next);
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = s + txt.length; });
  };

  /* ═══ limit popup ═══ */
  const showLimitPopup = (data) => {
    const friendCount = data?.friendCount ?? 0;
    const limit = data?.limit ?? 0;
    const postsToday = data?.postsToday ?? 0;
    const friendsNeeded = data?.friendsNeeded ?? Math.max(0, 10 - friendCount);
    const pct = Math.min((friendCount / 10) * 100, 100);
    const resetTxt = data?.resetsAt
      ? new Date(data.resetsAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })
      : "midnight";
    const noFriends = friendCount === 0;

    Swal.fire({
      title: noFriends ? "No Friends Yet 😢" : "Daily Limit Reached! 😅",
      html: `
        <div style="text-align:center">
          <div style="font-size:44px;margin-bottom:6px">${noFriends ? "🧍" : "👥"}</div>
          <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 14px">
            ${noFriends
              ? `Make at least <b style="color:#fb923c">1 friend</b> to start posting.`
              : `You have <b style="color:#fb923c">${friendCount} friend${friendCount !== 1 ? "s" : ""}</b> →
                 <b style="color:#fb923c">${limit} post${limit !== 1 ? "s" : ""} per day</b>.<br/>
                 Aaj ke <b style="color:#fff">${postsToday}/${limit}</b> posts use ho chuke hain.`}
          </p>
          <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">
            <span>${friendCount} friends</span><span>10 = Unlimited 🚀</span>
          </div>
          <div style="width:100%;height:10px;background:#27272a;border-radius:999px;overflow:hidden;margin-bottom:14px">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#f97316,#ec4899);border-radius:999px"></div>
          </div>
          <p style="color:#71717a;font-size:12px;margin:0 0 10px">
            Add <b style="color:#fff">${friendsNeeded} more friend${friendsNeeded !== 1 ? "s" : ""}</b> to unlock
            <b style="background:linear-gradient(90deg,#fb923c,#f472b6);-webkit-background-clip:text;background-clip:text;color:transparent"> UNLIMITED DAILY POSTING</b>
          </p>
          ${noFriends ? "" : `<p style="color:#52525b;font-size:11px;margin:0">🕛 Limit resets at ${resetTxt}</p>`}
        </div>`,
      background: "#18181b", color: "#fff",
      confirmButtonText: "🚀 Find More Friends", cancelButtonText: "Maybe Later",
      showCancelButton: true, confirmButtonColor: "#f97316", cancelButtonColor: "#3f3f46",
      customClass: { popup: "rounded-3xl" },
    }).then((r) => { if (r.isConfirmed) navigate("/users"); });
  };

  /* ═══ submit ═══ */
 const createPost = async () => {
  if (!file) return toast.error("Please select an image or video");
  if (loading) return;

  const token = localStorage.getItem("token");
  if (!token) return toast.error("Authentication required");

  setLoading(true);
  setProgress(0);
  
  try {
    // Step 1: Upload Media (With Auth!)
    const fd = new FormData();
    fd.append("media", file);

    const uploadRes = await axios.post(`${API}/api/upload/media`, fd, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}` 
      },
      onUploadProgress: (e) => {
        if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
      },
    });

    // Step 2: Create Post Record
    const { data } = await axios.post(
      `${API}/api/post/create`,
      { 
        caption, 
        mediaUrl: uploadRes.data.url, 
        mediaType: uploadRes.data.resourceType || "image" 
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const rem = data?.meta?.remaining;
    toast.success(
      rem === "Unlimited" || rem === undefined
        ? "Post published 🎉"
        : `Published! ${rem} post${rem !== 1 ? "s" : ""} left today`
    );

    setCaption("");
    removeFile();
    fetchQuota();
    setTimeout(() => navigate("/feed"), 700);
    
  } catch (err) {
    // Handle specific errors
    if (err?.response?.status === 401) {
      toast.error("Session expired. Please login again.");
      setTimeout(() => navigate("/login"), 1500);
    } else if (err?.response?.status === 403) { 
      showLimitPopup(err.response.data); 
      fetchQuota(); 
    } else {
      toast.error(err?.response?.data?.message || "Post creation failed");
    }
  } finally {
    setLoading(false);
    setProgress(0);
  }
};
  /* ═══ Ctrl+Enter ═══ */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); createPost(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ═══ derived ═══ */
  const unlimited = quota?.unlimited;
  const limitNum = unlimited ? 0 : Number(quota?.limit || 0);
  const usedNum = Number(quota?.postsToday || 0);
  const usedPct = limitNum > 0 ? Math.min((usedNum / limitNum) * 100, 100) : 0;
  const noQuotaLeft = !unlimited && limitNum > 0 && usedNum >= limitNum;
  const zeroFriends = quota && quota.friendCount === 0;
  const blocked = zeroFriends || noQuotaLeft;

  const capLeft = MAX_CAPTION - caption.length;
  const capColor = capLeft < 0 ? "text-rose-400" : capLeft < 150 ? "text-amber-400" : "text-zinc-600";
  const isVideo = file?.type?.startsWith("video/");
  const fileMB = file ? (file.size / 1024 / 1024).toFixed(1) : 0;
  const canPost = file && !loading && !blocked && capLeft >= 0;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] px-4 py-8 text-white sm:px-6">
      {/* ═══ DRAG OVERLAY ═══ */}
      {dragging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="animate-pulse rounded-3xl border-2 border-dashed border-orange-500 bg-orange-500/10 px-16 py-14 text-center">
            <UploadCloud size={54} className="mx-auto mb-3 text-orange-400" />
            <p className="text-lg font-black text-white">Drop to upload</p>
            <p className="mt-1 text-xs text-zinc-400">Images up to {MAX_IMG_MB}MB · Videos up to {MAX_VID_MB}MB</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        {/* ═══ HEADER ═══ */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/20 to-pink-500/10 p-2.5 text-orange-400">
              <Send size={19} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Create New Post</h1>
              <p className="text-[12px] text-zinc-500">Share your wins with the CareerSphere community</p>
            </div>
          </div>

          <div className="hidden items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 sm:flex">
            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px]">Ctrl</kbd>
            +
            <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px]">↵</kbd>
            to publish
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          {/* ══════════ LEFT: EDITOR ══════════ */}
          <div className="space-y-5">
            {/* ── CAPTION ── */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Caption</label>
                <span className={`text-[11px] font-bold tabular-nums ${capColor}`}>
                  {caption.length}/{MAX_CAPTION}
                </span>
              </div>

              <textarea
                ref={captionRef}
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                placeholder="What did you achieve today? Share your story…"
                rows={5}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-800/30 p-3.5 text-[13.5px] leading-relaxed text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:bg-zinc-800/50 focus:ring-4 focus:ring-orange-500/5"
              />

              {/* toolbar */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowEmoji((s) => !s)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                    showEmoji ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                              : "border-zinc-800 bg-zinc-800/40 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Smile size={13} /> Emoji
                </button>
                <button
                  onClick={() => insertAtCursor(" #")}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-800/40 px-2.5 py-1.5 text-[11px] font-bold text-zinc-500 transition hover:text-zinc-300"
                >
                  <Hash size={13} /> Tag
                </button>
                {caption && (
                  <button
                    onClick={() => setCaption("")}
                    className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-zinc-600 transition hover:text-rose-400"
                  >
                    <X size={13} /> Clear
                  </button>
                )}
              </div>

              {showEmoji && (
                <div className="mt-3 flex flex-wrap gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => insertAtCursor(e)}
                      className="rounded-lg p-1.5 text-lg transition hover:scale-125 hover:bg-zinc-800">
                      {e}
                    </button>
                  ))}
                </div>
              )}

              {/* hashtag chips */}
              <div className="mt-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600">Suggested tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {HASHTAGS.map((h) => {
                    const used = caption.includes(h);
                    return (
                      <button
                        key={h}
                        onClick={() => !used && insertAtCursor(` ${h}`)}
                        disabled={used}
                        className={`rounded-full border px-2.5 py-1 text-[10.5px] font-bold transition ${
                          used ? "border-orange-500/30 bg-orange-500/10 text-orange-400/60"
                               : "border-zinc-800 bg-zinc-800/40 text-zinc-500 hover:border-orange-500/40 hover:text-orange-400"
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── MEDIA ── */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Media <span className="text-rose-400">*</span>
                </label>
                {file && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
                    {isVideo ? <FileVideo size={12} className="text-purple-400" /> : <FileImage size={12} className="text-blue-400" />}
                    {fileMB} MB
                  </span>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden"
                onChange={(e) => validateAndSet(e.target.files?.[0])} />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-800/10 py-12 transition hover:border-orange-500/40 hover:bg-orange-500/[0.03]"
                >
                  <div className="rounded-2xl bg-zinc-800/60 p-4 text-zinc-500 transition group-hover:scale-110 group-hover:bg-orange-500/10 group-hover:text-orange-400">
                    <ImagePlus size={26} />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-zinc-300">Click, drag & drop, or paste</p>
                    <p className="mt-1 text-[11px] text-zinc-600">
                      JPG · PNG · GIF up to {MAX_IMG_MB}MB &nbsp;·&nbsp; MP4 · MOV up to {MAX_VID_MB}MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-black">
                  {isVideo ? (
                    <video src={previewUrl} controls className="max-h-[340px] w-full object-contain" />
                  ) : (
                    <img src={previewUrl} alt="Preview" className="max-h-[340px] w-full object-contain" />
                  )}

                  {/* progress overlay */}
                  {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 backdrop-blur-sm">
                      <Loader2 size={30} className="animate-spin text-orange-400" />
                      <div className="w-2/3">
                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all"
                            style={{ width: `${progress}%` }} />
                        </div>
                        <p className="mt-2 text-center text-[11px] font-bold text-zinc-300">
                          {progress < 100 ? `Uploading ${progress}%` : "Publishing…"}
                        </p>
                      </div>
                    </div>
                  )}

                  {!loading && (
                    <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                      <button onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg bg-zinc-900/90 p-2 text-white backdrop-blur transition hover:bg-zinc-800" title="Replace">
                        <ImagePlus size={14} />
                      </button>
                      <button onClick={removeFile}
                        className="rounded-lg bg-rose-500/90 p-2 text-white backdrop-blur transition hover:bg-rose-600" title="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── PUBLISH ── */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                disabled={loading}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-3.5 text-[13px] font-bold text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                onClick={createPost}
                disabled={!canPost}
                className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 py-3.5 text-[13.5px] font-black tracking-wide text-white shadow-lg shadow-pink-500/15 transition hover:shadow-pink-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> {progress < 100 ? `Uploading ${progress}%` : "Publishing…"}</>
                  ) : zeroFriends ? (
                    <><AlertCircle size={15} /> Add a friend to post</>
                  ) : noQuotaLeft ? (
                    <><Clock size={15} /> Daily limit reached</>
                  ) : !file ? (
                    <><ImagePlus size={15} /> Add media to publish</>
                  ) : (
                    <><Send size={15} /> Publish Post</>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* ══════════ RIGHT: SIDEBAR ══════════ */}
          <div className="space-y-5 lg:sticky lg:top-[80px] lg:self-start">
            {/* ── QUOTA ── */}
            {quota && (
              <div className={`overflow-hidden rounded-2xl border backdrop-blur-xl ${
                blocked ? "border-rose-500/30 bg-rose-500/[0.06]"
                : unlimited ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                : "border-zinc-800/80 bg-zinc-900/50"
              }`}>
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
                      <Users size={12} className="text-orange-400" />
                      {quota.friendCount} friend{quota.friendCount !== 1 ? "s" : ""}
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] font-black ${
                      unlimited ? "text-emerald-400" : noQuotaLeft ? "text-rose-400" : "text-orange-400"
                    }`}>
                      {unlimited ? <><InfinityIcon size={12} /> Unlimited</> : <>{usedNum} / {limitNum} today</>}
                    </span>
                  </div>

                  {!unlimited && (
                    <>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div className={`h-full rounded-full transition-all duration-500 ${
                          noQuotaLeft ? "bg-rose-500" : "bg-gradient-to-r from-orange-500 to-pink-500"
                        }`} style={{ width: `${usedPct}%` }} />
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-[9.5px] font-bold uppercase tracking-wider text-zinc-600">
                          <span>{quota.friendCount} friends</span>
                          <span>10 = Unlimited 🚀</span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700"
                            style={{ width: `${Math.min((quota.friendCount / 10) * 100, 100)}%` }} />
                        </div>
                      </div>

                      <p className="mt-3 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-zinc-500">
                        <Clock size={11} className="mt-px shrink-0" />
                        {zeroFriends ? "Add 1 friend to start posting"
                          : noQuotaLeft ? "Resets at midnight (IST)"
                          : `Add ${10 - quota.friendCount} more friend${10 - quota.friendCount !== 1 ? "s" : ""} for unlimited posts`}
                      </p>
                    </>
                  )}

                  {unlimited && (
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 size={12} /> You've unlocked unlimited posting!
                    </p>
                  )}
                </div>

                {!unlimited && (
                  <button onClick={() => navigate("/users")}
                    className="w-full border-t border-zinc-800/60 bg-zinc-950/40 py-2.5 text-[11px] font-bold text-orange-400 transition hover:bg-orange-500/10">
                    Find more friends →
                  </button>
                )}
              </div>
            )}

            {/* ── LIVE PREVIEW ── */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 backdrop-blur-xl">
              <p className="mb-3 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
                <Eye size={12} /> Live Preview
              </p>

              <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2.5 p-3">
                  <img
                    src={me?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(me?.name || "You")}&background=ff6b00&color=fff&bold=true`}
                    alt="" className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold text-zinc-200">{me?.name || "You"}</p>
                    <p className="text-[10px] text-zinc-600">Just now</p>
                  </div>
                </div>

                {caption && (
                  <p className="whitespace-pre-wrap break-words px-3 pb-2.5 text-[12px] leading-relaxed text-zinc-300">
                    {caption.split(/(\s#[\w]+)/g).map((p, i) =>
                      p.trim().startsWith("#")
                        ? <span key={i} className="font-semibold text-orange-400">{p}</span>
                        : <span key={i}>{p}</span>
                    )}
                  </p>
                )}

                {previewUrl ? (
                  isVideo
                    ? <video src={previewUrl} muted className="max-h-44 w-full bg-black object-contain" />
                    : <img src={previewUrl} alt="" className="max-h-44 w-full bg-black object-contain" />
                ) : (
                  <div className="flex h-28 items-center justify-center border-t border-zinc-800/60 bg-zinc-900/40 text-[11px] text-zinc-700">
                    Media preview
                  </div>
                )}
              </div>
            </div>

            {/* ── TIPS ── */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4">
              <p className="mb-2.5 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
                <Sparkles size={12} className="text-amber-400" /> Tips
              </p>
              <ul className="space-y-1.5 text-[11px] leading-relaxed text-zinc-500">
                <li>• Add 2–3 hashtags for better reach</li>
                <li>• Square images (1:1) look best in feed</li>
                <li>• Keep videos under 60 seconds</li>
                <li>• Tell a story — not just "got placed"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}