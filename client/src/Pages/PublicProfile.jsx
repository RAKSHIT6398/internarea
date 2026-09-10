import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Users, FileText, UserPlus, Clock, Check,
  UserMinus, User, X, Play, Heart, MessageCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { requireAuth } from "../utils/guestGate";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const fileUrl = (value) => {
  if (!value) return "";
  const src = String(value).trim();
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("blob:")) return src;
  if (src.startsWith("/uploads") || src.startsWith("uploads")) {
    return `${API}${src.startsWith("/") ? src : `/${src}`}`;
  }
  if (src.startsWith("/")) return `${API}${src}`;
  return `${API}/uploads/${src}`;
};

const avatarOf = (person) => {
  const photo = person?.profileImage || person?.avatar || person?.photo || person?.image || "";
  if (photo) return fileUrl(photo);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(person?.name || "User")}&background=f97316&color=fff&bold=true`;
};

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [tab, setTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const isGuest = !token;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // ✅ Moved up to prevent TDZ errors in callbacks
  const user = data?.user;
  const relation = data?.relation || "none";

  const load = async () => {
    setError("");
    try {
      const res = await axios.get(`${API}/api/user/${id}`, { headers });
      const payload = res.data;

      if (token && payload.relation === "self") {
        navigate("/profile", { replace: true });
        return;
      }

      setData(payload);
    } catch (err) {
      setError(err?.response?.data?.message || "Profile not found");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    setTab("posts");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const onFocus = () => { if (id && token) load(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const act = async (kind) => {
    if (!requireAuth(navigate, location, "Friend request")) return;

    setBusy(true);
    try {
      if (kind === "add") {
        await axios.post(`${API}/api/friend/send`, { friendId: id }, { headers });
        Swal.fire({
          icon: "success", title: "Request Sent", text: "Friend request sent successfully!",
          timer: 1500, showConfirmButton: false, background: "#18181b", color: "#fff", iconColor: "#f97316",
        });
      }

      if (kind === "accept") {
        await axios.put(`${API}/api/friend/accept`, { requestId: data.requestId }, { headers });
        Swal.fire({
          icon: "success", title: "Connected!", text: "You are now friends",
          timer: 1500, showConfirmButton: false, background: "#18181b", color: "#fff", iconColor: "#10b981",
        });
      }

      if (kind === "cancel" || kind === "reject") {
        await axios.delete(`${API}/api/friend/reject`, { headers, data: { requestId: data.requestId } });
        Swal.fire({
          icon: "info", title: "Updated", text: "Request removed",
          timer: 1500, showConfirmButton: false, background: "#18181b", color: "#fff", iconColor: "#ef4444",
        });
      }

      if (kind === "unfriend") {
        const result = await Swal.fire({
          title: "Are you sure?", text: "Do you want to unfriend this user?", icon: "warning",
          showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#27272a",
          confirmButtonText: "Yes, Unfriend", background: "#18181b", color: "#fff",
        });
        if (result.isConfirmed) {
          await axios.delete(`${API}/api/friend/remove`, { headers, data: { friendId: id } });
        } else {
          setBusy(false);
          return;
        }
      }

      await load();
    } catch (err) {
      Swal.fire({
        icon: "error", title: "Failed",
        text: err?.response?.data?.message || "Action failed",
        background: "#18181b", color: "#fff", confirmButtonColor: "#f97316",
      });
    } finally {
      setBusy(false);
    }
  };

  const openChat = () => navigate(`/shared-posts?chat=${id}`);

  const handleMessage = async () => {
    if (!requireAuth(navigate, location, "Message")) return;

    if (relation === "friends") {
      openChat();
      return;
    }

    const result = await Swal.fire({
      background: "#111827", color: "#fff", icon: "info", iconColor: "#f97316",
      title: "Make friends first",
      html: `<p style="font-size:14px;color:#a1a1aa;line-height:1.65;margin:0">
        You can message only after becoming friends.<br/><br/>
        Add <b style="color:#fff">${user?.name || "this user"}</b> as a friend, then send a message.
      </p>`,
      showCancelButton: true,
      confirmButtonText: relation === "none" ? "Add Friend" : relation === "incoming" ? "Accept Request" : "Okay",
      cancelButtonText: "Later",
      confirmButtonColor: "#f97316", cancelButtonColor: "#27272a", reverseButtons: true,
    });

    if (!result.isConfirmed) return;
    if (relation === "none") act("add");
    else if (relation === "incoming") act("accept");
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] px-4 py-8 text-white sm:px-6 font-sans">
      <div className="mx-auto max-w-4xl">
        <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {loading && (
          <div className="space-y-4">
            <div className="h-36 animate-pulse rounded-2xl bg-zinc-900" />
            <div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 py-20 text-center">
            <User size={32} className="mx-auto mb-3 text-zinc-600" />
            <p className="font-bold">{error}</p>
            <Link to={isGuest ? "/search" : "/users"} className="mt-4 inline-block text-sm text-indigo-400">
              {isGuest ? "Search people" : "Browse people"}
            </Link>
          </div>
        )}

        {!loading && user && (
          <>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img src={avatarOf(user)} alt={user.name} className="h-20 w-20 rounded-full object-cover ring-2 ring-orange-500/40" />
                  <div>
                    <h1 className="text-2xl font-black">{user.name}</h1>
                    <p className="text-sm text-zinc-500">CareerSphere member</p>
                    <div className="mt-2 flex gap-3 text-[12px] text-zinc-400">
                      <span>{data.postsCount || 0} posts</span>
                      <span>{data.friendsCount || 0} friends</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {relation === "none" && (
                    <button disabled={busy} onClick={() => act("add")}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2.5 text-sm font-bold disabled:opacity-60 hover:opacity-90 active:scale-[0.98] transition-all">
                      <UserPlus size={16} /> {isGuest ? "Login to Add Friend" : "Add Friend"}
                    </button>
                  )}

                  {relation === "outgoing" && (
                    <button disabled={busy} onClick={() => act("cancel")}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-300 hover:bg-amber-500/20 active:scale-[0.98] transition-all">
                      <Clock size={16} /> Requested
                    </button>
                  )}

                  {relation === "incoming" && (
                    <div className="flex gap-2">
                      <button disabled={busy} onClick={() => act("accept")}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold active:scale-[0.98] transition-all">
                        <Check size={16} /> Accept Request
                      </button>
                      <button disabled={busy} onClick={() => act("reject")}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-300 active:scale-[0.98] transition-all">
                        <X size={16} /> Reject
                      </button>
                    </div>
                  )}

                  {relation === "friends" && (
                    <button disabled={busy} onClick={() => act("unfriend")}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 active:scale-[0.98] transition-all">
                      <UserMinus size={16} /> Friends
                    </button>
                  )}

                  <button type="button" disabled={busy} onClick={handleMessage}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
                      relation === "friends"
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-indigo-500/40 hover:text-white"
                    }`}>
                    <MessageCircle size={16} /> Message
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-1.5">
              {[
                { k: "posts", label: `Posts (${data.postsCount || 0})`, icon: FileText },
                { k: "friends", label: `Friends (${data.friendsCount || 0})`, icon: Users },
              ].map((t) => (
                <button key={t.k} onClick={() => setTab(t.k)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                    tab === t.k ? "bg-orange-500/15 text-orange-300" : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  }`}>
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>

            {tab === "posts" && (
              <div className="mt-5">
                {!data.posts?.length ? (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 py-16 text-center text-zinc-500">No posts yet</div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2">
                    {data.posts.map((p) => {
                      const mediaSrc = fileUrl(p.mediaUrl);
                      const isVideo = p.mediaType === "video";
                      return (
                        <Link key={p._id} to={`/post/${p._id}`}
                          className="relative aspect-square overflow-hidden bg-zinc-950 border border-zinc-850 hover:border-orange-500/30 transition-all rounded-lg group">
                          {mediaSrc ? (
                            isVideo ? (
                              <div className="w-full h-full relative">
                                <video src={mediaSrc} className="w-full h-full object-cover pointer-events-none" muted playsInline />
                                <div className="absolute top-2 right-2 p-1 bg-black/50 rounded-md backdrop-blur-sm z-10">
                                  <Play size={10} className="text-white fill-white" />
                                </div>
                              </div>
                            ) : (
                              <img src={mediaSrc} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                            )
                          ) : (
                            <div className="w-full h-full p-2.5 flex items-center justify-center bg-zinc-900 text-zinc-400 text-[10px] sm:text-xs leading-normal font-medium text-center overflow-hidden">
                              <p className="line-clamp-4">{p.caption}</p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 text-white font-black text-xs sm:text-sm">
                            <Heart size={16} className="fill-white text-white" />
                            <span>{p.likesCount || 0}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "friends" && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {!data.friends?.length && (
                  <div className="col-span-full rounded-2xl border border-zinc-800 bg-zinc-900/40 py-16 text-center text-zinc-500">No friends to show</div>
                )}
                {data.friends?.map((f) => (
                  <Link key={f._id} to={`/users/${f._id}`}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3.5 transition hover:border-orange-500/40 hover:bg-zinc-800/20">
                    <img src={avatarOf(f)} alt="" className="h-11 w-11 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{f.name}</p>
                      <p className="text-[11px] text-zinc-500">View profile</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;