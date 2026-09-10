import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Send, ExternalLink, Search, ArrowLeft, MoreVertical, Smile, Check, CheckCheck,
  MessageSquare, ChevronDown, X, Loader2, Phone, Video, UserX, Trash2, BellOff,
  Bell, User, Reply, Copy, Pencil, Star, Info, Mail, Calendar,
  Image as ImageIcon, ShieldOff, CornerUpLeft,
} from "lucide-react";

import ConfirmModal from "../components/ConfirmModal";
import CallScreen from "../components/CallScreen";
import useWebRTC from "../hooks/useWebRTC";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";
const NAVBAR_H = 64;
const EMOJIS = ["😀","😂","🥹","😍","😎","🤝","👍","🙏","🔥","🎉","💯","❤️","👏","🚀","✅","💡"];

const socket = io(API, { autoConnect: true, transports: ["websocket", "polling"] });

const getUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API}${u}`);
const avatar = (u) =>
  u?.profileImage
    ? getUrl(u.profileImage)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || "U")}&background=ff6b00&color=fff&bold=true`;
const timeOf = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const dayKey = (d) => new Date(d).toDateString();
const dayLabel = (d) => {
  const t = new Date(), y = new Date(Date.now() - 864e5), k = dayKey(d);
  if (k === t.toDateString()) return "Today";
  if (k === y.toDateString()) return "Yesterday";
  return new Date(d).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};
const relTime = (d) => {
  if (!d) return "";
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(d).toLocaleDateString([], { day: "numeric", month: "short" });
};
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" }) : "—";
const sameId = (a, b) => a && b && String(a) === String(b);
const resolveMyId = () => {
  const d = localStorage.getItem("userId");
  if (d) return String(d);
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (u?._id) return String(u._id);
  } catch {}
  try {
    const t = localStorage.getItem("token");
    if (t) return String(JSON.parse(atob(t.split(".")[1]))?.id || "");
  } catch {}
  return null;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState([]);
  const [typing, setTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [msgMenu, setMsgMenu] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);

  const [infoOpen, setInfoOpen] = useState(false);
  const [info, setInfo] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [inChatSearch, setInChatSearch] = useState(false);
  const [chatQ, setChatQ] = useState("");

  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const activeRef = useRef(null);
  const typingTO = useRef(null);
  const emojiRef = useRef(null);
  const menuRef = useRef(null);
  const msgMenuRef = useRef(null);
  const openedQueryRef = useRef(null);
  const conversationsRef = useRef([]);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const chatFromProfile = searchParams.get("chat");

  const token = localStorage.getItem("token");
  const myId = useMemo(resolveMyId, []);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const {
    call, localStream, remoteStream, error: callError,
    startCall, acceptCall, endCall, toggleMic, toggleCam,
  } = useWebRTC(socket, myId);

  useEffect(() => {
    activeRef.current = activeFriend;
  }, [activeFriend]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const askConfirm = (cfg) => setConfirm(cfg);
  const runConfirm = async () => {
    if (!confirm?.action) return;
    setConfirmLoading(true);
    try {
      await confirm.action();
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmLoading(false);
      setConfirm(null);
    }
  };

  useEffect(() => {
    if (!myId) return;
    socket.emit("join", myId);

    const onReceive = (msg) => {
      const sid = msg.sender?._id || msg.sender;
      const isActive = sameId(sid, activeRef.current?._id);

      if (isActive) {
        const readMsg = { ...msg, read: true, readAt: new Date() };
        setMessages((p) => (p.some((m) => m._id === msg._id) ? p : [...p, readMsg]));
        setTyping(false);
        socket.emit("messages:read", { to: sid, from: myId });
      }

      setConversations((prev) => {
        const i = prev.findIndex((c) => sameId(c.friend?._id, sid));
        if (i === -1) return prev;
        const c = [...prev];
        c[i] = {
          ...c[i],
          lastMessage: msg,
          unreadCount: isActive ? 0 : (c[i].unreadCount || 0) + 1,
        };
        const [row] = c.splice(i, 1);
        return [row, ...c];
      });
    };

    const onEdited = (msg) => setMessages((p) => p.map((m) => (m._id === msg._id ? msg : m)));

    const onDeleted = ({ messageId }) =>
      setMessages((p) =>
        p.map((m) =>
          m._id === messageId ? { ...m, deletedForEveryone: true, text: "", post: null } : m
        )
      );

    const onDelivered = ({ messageId }) => {
      setMessages((p) =>
        p.map((m) => (m._id === messageId ? { ...m, delivered: true, deliveredAt: new Date() } : m))
      );
    };

    const onReadFromPeer = ({ by, messageIds }) => {
      if (!messageIds?.length) return;
      setMessages((p) =>
        p.map((m) => (messageIds.includes(m._id) ? { ...m, read: true, readAt: new Date() } : m))
      );
      setConversations((prev) =>
        prev.map((c) =>
          sameId(c.friend?._id, by) ? { ...c, lastMessage: { ...c.lastMessage, read: true } } : c
        )
      );
    };

    const onTyping = ({ from }) => {
      if (sameId(from, activeRef.current?._id)) {
        setTyping(true);
        clearTimeout(typingTO.current);
        typingTO.current = setTimeout(() => setTyping(false), 2500);
      }
    };
    const onStop = ({ from }) => {
      if (sameId(from, activeRef.current?._id)) setTyping(false);
    };
    const onOnline = (ids) => setOnline(Array.isArray(ids) ? ids.map(String) : []);

    socket.on("receive_message", onReceive);
    socket.on("message:edited", onEdited);
    socket.on("message:deleted", onDeleted);
    socket.on("message:delivered", onDelivered);
    socket.on("message:read", onReadFromPeer);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStop);
    socket.on("online_users", onOnline);

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("message:edited", onEdited);
      socket.off("message:deleted", onDeleted);
      socket.off("message:delivered", onDelivered);
      socket.off("message:read", onReadFromPeer);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStop);
      socket.off("online_users", onOnline);
      clearTimeout(typingTO.current);
    };
  }, [myId]);

  const loadConversations = useCallback(() => {
    return axios
      .get(`${API}/api/messages/conversations`, { headers })
      .then((r) => {
        const list = r.data.conversations || [];
        setConversations(list);
        return list;
      })
      .catch((e) => {
        console.error(e);
        return [];
      });
  }, [headers]);

  useEffect(() => {
    loadConversations().finally(() => setLoadingList(false));
  }, [loadConversations]);

  const openChat = useCallback(
    async (convo) => {
      setActiveFriend(convo.friend);
      setMessages([]);
      setTyping(false);
      setNewCount(0);
      setLoadingChat(true);
      setInChatSearch(false);
      setChatQ("");
      setReplyTo(null);
      setEditing(null);
      setInfoOpen(false);
      setMuted(!!convo.muted);
      setBlocked(!!convo.blocked);
      if (window.innerWidth < 768) setSidebarOpen(false);

      setConversations((p) =>
        p.map((c) =>
          sameId(c.friend?._id, convo.friend._id) ? { ...c, unreadCount: 0 } : c
        )
      );

      try {
        const r = await axios.get(`${API}/api/messages/${convo.friend._id}`, { headers });
        setMessages(r.data.messages || []);
        socket.emit("messages:read", { to: convo.friend._id, from: myId });
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingChat(false);
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView());
        inputRef.current?.focus();
      }
    },
    [headers, myId]
  );

  /* Profile Message → ?chat=userId */
  useEffect(() => {
    if (!chatFromProfile || loadingList) return;
    if (openedQueryRef.current === String(chatFromProfile)) return;

    let cancelled = false;
    const targetId = String(chatFromProfile);

    const run = async () => {
      const existing = conversationsRef.current.find((c) =>
        sameId(c.friend?._id, targetId)
      );

      if (existing) {
        if (cancelled) return;
        openedQueryRef.current = targetId;
        await openChat(existing);
        setSearchParams({}, { replace: true });
        return;
      }

      let friend = { _id: targetId, name: "User", profileImage: "" };

      try {
        const r = await axios.get(`${API}/api/user/${targetId}`, { headers });
        const u = r.data?.user || r.data;
        if (u && (u._id || u.name)) {
          friend = {
            _id: String(u._id || targetId),
            name: u.name || "User",
            profileImage: u.profileImage || "",
            email: u.email || "",
          };
        }
      } catch (e) {
        console.error("Open chat from profile:", e);
      }

      if (cancelled) return;

      openedQueryRef.current = targetId;

      const convo = {
        _id: `open-${targetId}`,
        friend,
        lastMessage: null,
        unreadCount: 0,
        muted: false,
        blocked: false,
      };

      setConversations((prev) =>
        prev.some((c) => sameId(c.friend?._id, targetId)) ? prev : [convo, ...prev]
      );

      await openChat(convo);
      setSearchParams({}, { replace: true });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [chatFromProfile, loadingList, openChat, headers, setSearchParams]);

  const sendMessage = async () => {
    const body = text.trim();
    if (!body || !activeFriend || sending) return;

    if (editing) {
      const id = editing._id;
      setEditing(null);
      setText("");
      setMessages((p) => p.map((m) => (m._id === id ? { ...m, text: body, edited: true } : m)));
      try {
        const r = await axios.put(`${API}/api/messages/edit/${id}`, { text: body }, { headers });
        setMessages((p) => p.map((m) => (m._id === id ? r.data.message : m)));
        socket.emit("message:edit", { to: activeFriend._id, message: r.data.message });
      } catch (e) {
        console.error(e);
      }
      return;
    }

    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      text: body,
      sender: myId,
      createdAt: new Date().toISOString(),
      pending: true,
      replyTo: replyTo || null,
    };
    setMessages((p) => [...p, optimistic]);
    setText("");
    setShowEmoji(false);
    setSending(true);
    const rid = replyTo?._id || null;
    setReplyTo(null);
    socket.emit("stop_typing", { to: activeFriend._id, from: myId });
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));

    try {
      const r = await axios.post(
        `${API}/api/messages`,
        { receiverId: activeFriend._id, text: body, replyTo: rid },
        { headers }
      );
      const saved = r.data.message;
      setMessages((p) => p.map((m) => (m._id === tempId ? saved : m)));
      socket.emit("send_message", { receiverId: activeFriend._id, message: saved });

      setConversations((prev) => {
        const i = prev.findIndex((c) => sameId(c.friend?._id, activeFriend._id));
        if (i === -1) {
          return [
            {
              _id: saved._id || `open-${activeFriend._id}`,
              friend: activeFriend,
              lastMessage: saved,
              unreadCount: 0,
            },
            ...prev,
          ];
        }
        const c = [...prev];
        c[i] = { ...c[i], lastMessage: saved };
        const [row] = c.splice(i, 1);
        return [row, ...c];
      });
    } catch (e) {
      setMessages((p) =>
        p.map((m) => (m._id === tempId ? { ...m, failed: true, pending: false } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const onChangeText = (v) => {
    setText(v);
    if (!activeFriend) return;
    socket.emit("typing", { to: activeFriend._id, from: myId });
    clearTimeout(typingTO.current);
    typingTO.current = setTimeout(
      () => socket.emit("stop_typing", { to: activeFriend._id, from: myId }),
      1500
    );
  };

  const openMsgMenu = (e, msg) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const up = window.innerHeight - r.bottom < 260;
    setMsgMenu({
      msg,
      top: up ? r.top - 8 : r.bottom + 8,
      left: Math.min(Math.max(8, r.left - 100), window.innerWidth - 220),
      up,
    });
  };

  const doReply = (m) => {
    setReplyTo(m);
    setMsgMenu(null);
    inputRef.current?.focus();
  };
  const doCopy = (m) => {
    navigator.clipboard?.writeText(m.text || "");
    setMsgMenu(null);
  };
  const doEdit = (m) => {
    setEditing(m);
    setText(m.text || "");
    setMsgMenu(null);
    inputRef.current?.focus();
  };

  const doStar = async (m) => {
    setMsgMenu(null);
    const isS = m.starredBy?.some((u) => sameId(u, myId));
    setMessages((p) =>
      p.map((x) =>
        x._id === m._id
          ? {
              ...x,
              starredBy: isS
                ? x.starredBy.filter((u) => !sameId(u, myId))
                : [...(x.starredBy || []), myId],
            }
          : x
      )
    );
    try {
      await axios.put(`${API}/api/messages/star/${m._id}`, {}, { headers });
    } catch (e) {
      console.error(e);
    }
  };

  const doDeleteMe = (m) => {
    setMsgMenu(null);
    askConfirm({
      title: "Delete for you?",
      message: "This message will be removed from your chat only.",
      note: `${activeFriend.name} will still see it.`,
      confirmText: "Delete",
      icon: "delete",
      tone: "warn",
      action: async () => {
        setMessages((p) => p.filter((x) => x._id !== m._id));
        await axios.delete(`${API}/api/messages/me/${m._id}`, { headers });
      },
    });
  };

  const doDeleteAll = (m) => {
    setMsgMenu(null);
    askConfirm({
      title: "Delete for everyone?",
      message: "This message will be deleted for both of you.",
      note: "This cannot be undone.",
      confirmText: "Delete",
      icon: "delete",
      tone: "danger",
      action: async () => {
        setMessages((p) =>
          p.map((x) =>
            x._id === m._id ? { ...x, deletedForEveryone: true, text: "", post: null } : x
          )
        );
        await axios.delete(`${API}/api/messages/everyone/${m._id}`, { headers });
        socket.emit("message:delete", { to: activeFriend._id, messageId: m._id });
      },
    });
  };

  const toggleMute = async () => {
    setMenuOpen(false);
    try {
      const r = await axios.put(`${API}/api/messages/mute/${activeFriend._id}`, {}, { headers });
      setMuted(r.data.muted);
      setConversations((p) =>
        p.map((c) =>
          sameId(c.friend?._id, activeFriend._id) ? { ...c, muted: r.data.muted } : c
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBlock = () => {
    setMenuOpen(false);
    setInfoOpen(false);
    askConfirm({
      title: blocked ? `Unblock ${activeFriend.name}?` : `Block ${activeFriend.name}?`,
      message: blocked
        ? "You'll message and call them again."
        : "They won't message or call you.",
      note: blocked ? null : "Unblock anytime from chat info.",
      confirmText: blocked ? "Unblock" : "Block",
      icon: "block",
      tone: blocked ? "warn" : "danger",
      action: async () => {
        const r = await axios.put(
          `${API}/api/messages/block/${activeFriend._id}`,
          {},
          { headers }
        );
        setBlocked(r.data.blocked);
        setConversations((p) =>
          p.map((c) =>
            sameId(c.friend?._id, activeFriend._id) ? { ...c, blocked: r.data.blocked } : c
          )
        );
      },
    });
  };

  const clearChat = () => {
    setMenuOpen(false);
    setInfoOpen(false);
    askConfirm({
      title: "Clear all messages?",
      message: `Clear chat with ${activeFriend.name}?`,
      note: "They keep their copy.",
      confirmText: "Clear chat",
      icon: "delete",
      tone: "warn",
      action: async () => {
        await axios.delete(`${API}/api/messages/clear/${activeFriend._id}`, { headers });
        setMessages([]);
        loadConversations();
      },
    });
  };

  const deleteChat = () => {
    setMenuOpen(false);
    setInfoOpen(false);
    askConfirm({
      title: "Delete conversation?",
      message: `Delete chat with ${activeFriend.name}?`,
      note: "Cannot be undone.",
      confirmText: "Delete chat",
      icon: "delete",
      tone: "danger",
      action: async () => {
        await axios.delete(`${API}/api/messages/chat/${activeFriend._id}`, { headers });
        setConversations((p) => p.filter((c) => !sameId(c.friend?._id, activeFriend._id)));
        setActiveFriend(null);
        setMessages([]);
      },
    });
  };

  const openInfo = async () => {
    setMenuOpen(false);
    setInfoOpen(true);
    setInfoLoading(true);
    try {
      const r = await axios.get(`${API}/api/messages/info/${activeFriend._id}`, { headers });
      setInfo(r.data.info);
    } catch (e) {
      console.error(e);
    } finally {
      setInfoLoading(false);
    }
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setAtBottom(near);
    if (near) setNewCount(0);
    if (msgMenu) setMsgMenu(null);
  };

  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (atBottom || sameId(last.sender?._id || last.sender, myId))
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    else setNewCount((c) => c + 1);
    // eslint-disable-next-line
  }, [messages.length]);

  useEffect(() => {
    const h = (e) => {
      if (showEmoji && !emojiRef.current?.contains(e.target)) setShowEmoji(false);
      if (menuOpen && !menuRef.current?.contains(e.target)) setMenuOpen(false);
      if (msgMenu && !msgMenuRef.current?.contains(e.target)) setMsgMenu(null);
    };
    const k = (e) => {
      if (e.key === "Escape" && !confirm) {
        setMsgMenu(null);
        setMenuOpen(false);
        setInfoOpen(false);
        setReplyTo(null);
        setEditing(null);
      }
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, [showEmoji, menuOpen, msgMenu, confirm]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [text]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return !s
      ? conversations
      : conversations.filter((c) => c.friend?.name?.toLowerCase().includes(s));
  }, [conversations, q]);

  const visibleMsgs = useMemo(() => {
    const s = chatQ.trim().toLowerCase();
    return !s ? messages : messages.filter((m) => m.text?.toLowerCase().includes(s));
  }, [messages, chatQ]);

  const isOnline = (id) => online.includes(String(id));
  const totalUnread = conversations.reduce((a, c) => a + (c.unreadCount || 0), 0);

  const rows = useMemo(() => {
    const out = [];
    let lastDay = null;
    visibleMsgs.forEach((m, i) => {
      const k = dayKey(m.createdAt);
      if (k !== lastDay) {
        out.push({ type: "day", id: `d-${k}-${i}`, date: m.createdAt });
        lastDay = k;
      }
      const prev = visibleMsgs[i - 1];
      const same = prev && sameId(prev.sender?._id || prev.sender, m.sender?._id || m.sender);
      const close = prev && new Date(m.createdAt) - new Date(prev.createdAt) < 3 * 60000;
      out.push({
        type: "msg",
        id: m._id,
        msg: m,
        grouped: !!(same && close && prev && dayKey(prev.createdAt) === k && !m.replyTo),
      });
    });
    return out;
  }, [visibleMsgs]);

  return (
    <>
      <div
        className="relative flex w-full overflow-hidden bg-[#0b0f19] text-white"
        style={{ height: `calc(100vh - ${NAVBAR_H}px)` }}
      >
        <aside
          className={`${
            sidebarOpen ? "flex" : "hidden"
          } absolute inset-y-0 left-0 z-20 w-full shrink-0 flex-col border-r border-zinc-800/70 bg-[#070a11] md:relative md:flex md:w-[320px]`}
        >
          <div className="border-b border-zinc-800/70 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[17px] font-black">
                Messages <MessageSquare size={15} className="text-orange-500" />
              </h2>
              {totalUnread > 0 && (
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="group relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search chats…"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2 pl-9 pr-8 text-[12.5px] outline-none placeholder:text-zinc-600 focus:border-orange-500/50"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-0.5 overflow-y-auto p-2 [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar]:w-1.5">
            {loadingList ? (
              Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="h-11 w-11 animate-pulse rounded-full bg-zinc-800" />
                  <div className="flex-1">
                    <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
                    <div className="mt-2 h-2.5 w-36 animate-pulse rounded bg-zinc-800/60" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <MessageSquare size={26} className="mx-auto mb-3 text-zinc-700" />
                <p className="text-[12.5px] font-bold text-zinc-400">
                  {q ? "No chats found" : "No conversations yet"}
                </p>
              </div>
            ) : (
              filtered.map((c) => {
                const active = sameId(activeFriend?._id, c.friend?._id);
                const unread = c.unreadCount || 0;
                const mineLast = sameId(
                  c.lastMessage?.sender?._id || c.lastMessage?.sender,
                  myId
                );
                return (
                  <button
                    key={c._id}
                    onClick={() => openChat(c)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                      active
                        ? "bg-orange-500/[0.1] ring-1 ring-orange-500/30"
                        : "hover:bg-zinc-900/70"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={avatar(c.friend)}
                        alt=""
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      {isOnline(c.friend?._id) && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#070a11] bg-emerald-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`flex items-center gap-1 truncate text-[13px] ${
                            unread ? "font-black text-white" : "font-bold text-zinc-200"
                          }`}
                        >
                          {c.friend?.name}
                          {c.muted && <BellOff size={10} className="shrink-0 text-zinc-600" />}
                          {c.blocked && (
                            <ShieldOff size={10} className="shrink-0 text-rose-500" />
                          )}
                        </p>
                        <span className="shrink-0 text-[10px] text-zinc-600">
                          {relTime(c.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-[11.5px] ${
                            unread ? "font-semibold text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          {mineLast && <span className="text-zinc-600">You: </span>}
                          {c.lastMessage?.deletedForEveryone
                            ? "🚫 Message deleted"
                            : c.lastMessage?.post
                            ? "📎 Shared a post"
                            : c.lastMessage?.text || "Say hi 👋"}
                        </p>
                        {unread > 0 && (
                          <span className="shrink-0 rounded-full bg-orange-500 px-1.5 py-px text-[9.5px] font-black">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-[#0b0f19]">
          {!activeFriend ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
                <MessageSquare size={34} className="text-zinc-700" />
              </div>
              <h3 className="text-base font-black text-zinc-300">Your Messages</h3>
              <p className="mt-1.5 max-w-xs text-[12.5px] text-zinc-600">
                Select a conversation to start chatting.
              </p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="mt-5 rounded-xl bg-orange-500 px-4 py-2 text-[12px] font-bold md:hidden"
              >
                Open chats
              </button>
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center gap-1.5 border-b border-zinc-800/70 bg-[#0d1220] px-3 py-2.5 sm:gap-2 sm:px-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-1 text-zinc-400 hover:text-white md:hidden"
                >
                  <ArrowLeft size={18} />
                </button>

                <button onClick={openInfo} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <div className="relative shrink-0">
                    <img
                      src={avatar(activeFriend)}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    {isOnline(activeFriend._id) && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d1220] bg-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[13.5px] font-black">
                      {activeFriend.name}
                      {muted && <BellOff size={11} className="text-zinc-600" />}
                      {blocked && <ShieldOff size={11} className="text-rose-500 shrink-0" />}
                    </p>
                    <p className="text-[10.5px] font-medium">
                      {typing ? (
                        <span className="text-orange-400">typing…</span>
                      ) : isOnline(activeFriend._id) ? (
                        <span className="text-emerald-500">Online</span>
                      ) : (
                        <span className="text-zinc-600">Offline</span>
                      )}
                    </p>
                  </div>
                </button>

                {blocked && (
                  <button
                    onClick={toggleBlock}
                    className="shrink-0 rounded-full bg-rose-500 px-3 py-1 text-[10.5px] font-black text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 hover:scale-105 active:scale-95"
                  >
                    Unblock
                  </button>
                )}

                <button
                  onClick={() => {
                    setInChatSearch((s) => !s);
                    setChatQ("");
                  }}
                  title="Search in chat"
                  className={`rounded-full p-2 transition ${
                    inChatSearch
                      ? "bg-orange-500/15 text-orange-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <Search size={16} />
                </button>

                <button
                  onClick={() => startCall(activeFriend, "voice")}
                  disabled={blocked || !!call}
                  title="Voice call"
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-emerald-500/15 hover:text-emerald-400 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Phone size={16} />
                </button>
                <button
                  onClick={() => startCall(activeFriend, "video")}
                  disabled={blocked || !!call}
                  title="Video call"
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-sky-500/15 hover:text-sky-400 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Video size={17} />
                </button>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className={`rounded-full p-2 transition ${
                      menuOpen
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl shadow-black/70">
                      <MI icon={<Info size={14} />} label="Chat info" onClick={openInfo} />
                      <MI
                        icon={<User size={14} />}
                        label="View Profile"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate(`/users/${activeFriend._id}`);
                        }}
                      />
                      <MI
                        icon={<Search size={14} />}
                        label="Search in chat"
                        onClick={() => {
                          setMenuOpen(false);
                          setInChatSearch(true);
                        }}
                      />
                      <MI
                        icon={muted ? <Bell size={14} /> : <BellOff size={14} />}
                        label={muted ? "Unmute notifications" : "Mute notifications"}
                        onClick={toggleMute}
                      />
                      <div className="my-1.5 h-px bg-zinc-900" />
                      <MI icon={<Trash2 size={14} />} label="Clear messages" onClick={clearChat} />
                      <MI
                        icon={<UserX size={14} />}
                        label={blocked ? "Unblock user" : "Block user"}
                        danger
                        onClick={toggleBlock}
                      />
                      <MI icon={<Trash2 size={14} />} label="Delete chat" danger onClick={deleteChat} />
                    </div>
                  )}
                </div>
              </div>

              {inChatSearch && (
                <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800/70 bg-zinc-900/30 px-4 py-2">
                  <Search size={13} className="text-zinc-500" />
                  <input
                    autoFocus
                    value={chatQ}
                    onChange={(e) => setChatQ(e.target.value)}
                    placeholder="Search messages…"
                    className="flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-zinc-600"
                  />
                  <span className="text-[10.5px] text-zinc-600">
                    {chatQ ? `${visibleMsgs.length} found` : ""}
                  </span>
                  <button
                    onClick={() => {
                      setInChatSearch(false);
                      setChatQ("");
                    }}
                    className="text-zinc-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {blocked && (
                <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-rose-900/40 to-zinc-900/60 px-4 py-2.5">
                  <ShieldOff size={16} className="shrink-0 text-rose-400" />
                  <p className="min-w-0 flex-1 text-[11.5px] font-bold text-rose-300">
                    You blocked this user. Unblock to send messages.
                  </p>
                  <button
                    onClick={toggleBlock}
                    className="shrink-0 rounded-full bg-rose-500 px-3 py-1 text-[10.5px] font-black text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 hover:scale-105 active:scale-95"
                  >
                    Unblock
                  </button>
                </div>
              )}

              <div
                ref={scrollRef}
                onScroll={onScroll}
                className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar]:w-1.5"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,.028) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              >
                {loadingChat ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 size={22} className="animate-spin text-zinc-700" />
                  </div>
                ) : rows.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <img
                      src={avatar(activeFriend)}
                      alt=""
                      className="mb-3 h-16 w-16 rounded-full object-cover opacity-60"
                    />
                    <p className="text-[13px] font-bold text-zinc-400">{activeFriend.name}</p>
                    <p className="mt-1 text-[11.5px] text-zinc-600">
                      {chatQ ? "No messages match" : "No messages yet — say hello 👋"}
                    </p>
                  </div>
                ) : (
                  <div className="mx-auto max-w-3xl">
                    {rows.map((r) =>
                      r.type === "day" ? (
                        <div key={r.id} className="flex items-center gap-3 py-4">
                          <div className="h-px flex-1 bg-zinc-800/70" />
                          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-zinc-500">
                            {dayLabel(r.date)}
                          </span>
                          <div className="h-px flex-1 bg-zinc-800/70" />
                        </div>
                      ) : (
                        <Bubble
                          key={r.id}
                          m={r.msg}
                          mine={sameId(r.msg.sender?._id || r.msg.sender, myId)}
                          grouped={r.grouped}
                          friend={activeFriend}
                          myId={myId}
                          navigate={navigate}
                          highlight={chatQ}
                          onMenu={openMsgMenu}
                          onReply={doReply}
                        />
                      )
                    )}

                    {typing && (
                      <div className="mt-3 flex items-end gap-2">
                        <img
                          src={avatar(activeFriend)}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-zinc-800 bg-zinc-900 px-3.5 py-2.5">
                          {[0, 150, 300].map((d) => (
                            <span
                              key={d}
                              className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500"
                              style={{ animationDelay: `${d}ms` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={bottomRef} className="h-1" />
              </div>

              {!atBottom && (
                <button
                  onClick={() => {
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                    setNewCount(0);
                  }}
                  className="absolute bottom-[92px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-[11px] font-bold shadow-2xl hover:bg-zinc-800"
                >
                  {newCount > 0 && (
                    <span className="rounded-full bg-orange-500 px-1.5 text-[9.5px] font-black">
                      {newCount}
                    </span>
                  )}
                  New messages <ChevronDown size={13} />
                </button>
              )}

              <div className="relative shrink-0 border-t border-zinc-800/70 bg-[#0d1220] px-3 py-3 sm:px-6">
                {(replyTo || editing) && (
                  <div className="mx-auto mb-2 flex max-w-3xl items-center gap-2 rounded-xl border-l-[3px] border-orange-500 bg-zinc-900/80 px-3 py-2">
                    {editing ? (
                      <Pencil size={13} className="shrink-0 text-orange-400" />
                    ) : (
                      <CornerUpLeft size={13} className="shrink-0 text-orange-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] font-black text-orange-400">
                        {editing
                          ? "Editing message"
                          : `Replying to ${
                              sameId(replyTo.sender?._id || replyTo.sender, myId)
                                ? "yourself"
                                : activeFriend.name
                            }`}
                      </p>
                      <p className="truncate text-[11.5px] text-zinc-400">
                        {(editing || replyTo)?.post
                          ? "📎 Shared post"
                          : (editing || replyTo)?.text}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setReplyTo(null);
                        if (editing) {
                          setEditing(null);
                          setText("");
                        }
                      }}
                      className="text-zinc-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {showEmoji && (
                  <div
                    ref={emojiRef}
                    className="absolute bottom-[76px] left-3 z-20 grid w-[248px] grid-cols-8 gap-1 rounded-2xl border border-zinc-800 bg-zinc-950 p-2.5 shadow-2xl sm:left-6"
                  >
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          setText((t) => t + e);
                          inputRef.current?.focus();
                        }}
                        className="rounded-lg p-1 text-lg transition hover:scale-125 hover:bg-zinc-900"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mx-auto flex max-w-3xl items-end gap-2">
                  <button
                    onClick={() => setShowEmoji((s) => !s)}
                    disabled={blocked}
                    className={`shrink-0 rounded-full p-2.5 transition disabled:opacity-40 ${
                      showEmoji
                        ? "bg-orange-500/15 text-orange-400"
                        : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    }`}
                  >
                    <Smile size={18} />
                  </button>
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={text}
                    disabled={blocked}
                    onChange={(e) => onChangeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={
                      blocked
                        ? "Unblock to send messages"
                        : editing
                        ? "Edit message…"
                        : "Type a message…"
                    }
                    className="max-h-[120px] flex-1 resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-[13px] outline-none placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!text.trim() || sending || blocked}
                    className="shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 p-3 shadow-lg shadow-orange-500/20 transition hover:scale-105 active:scale-95 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
                  >
                    {sending ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : editing ? (
                      <Check size={17} />
                    ) : (
                      <Send size={17} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>

        {infoOpen && activeFriend && (
          <>
            <div
              onClick={() => setInfoOpen(false)}
              className="absolute inset-0 z-30 bg-black/50 lg:hidden"
            />
            <aside className="absolute inset-y-0 right-0 z-40 w-full overflow-y-auto border-l border-zinc-800/70 bg-[#070a11] sm:w-[360px]">
              <div className="relative bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 px-6 pb-8 pt-10 text-center">
                <button
                  onClick={() => setInfoOpen(false)}
                  className="absolute right-4 top-4 rounded-full bg-black/25 p-2 backdrop-blur hover:bg-black/40"
                >
                  <X size={16} />
                </button>
                <img
                  src={avatar(activeFriend)}
                  alt=""
                  className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-white/30"
                />
                <h3 className="mt-3 text-xl font-black">{activeFriend.name}</h3>
                <p className="mt-1 text-[11.5px] font-bold text-white/80">
                  {isOnline(activeFriend._id) ? "🟢 Online" : "⚪ Offline"}
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setInfoOpen(false);
                      startCall(activeFriend, "video");
                    }}
                    disabled={blocked || !!call}
                    className="rounded-full bg-white/20 p-2.5 backdrop-blur transition hover:bg-white/30 active:scale-95 disabled:opacity-30"
                  >
                    <Video size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setInfoOpen(false);
                      startCall(activeFriend, "voice");
                    }}
                    disabled={blocked || !!call}
                    className="rounded-full bg-white/20 p-2.5 backdrop-blur transition hover:bg-white/30 active:scale-95 disabled:opacity-30"
                  >
                    <Phone size={16} />
                  </button>
                </div>
              </div>

              {infoLoading ? (
                <div className="flex justify-center py-14">
                  <Loader2 size={22} className="animate-spin text-zinc-700" />
                </div>
              ) : info ? (
                <div className="space-y-4 p-4">
                  <div className="space-y-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                    <Row icon={<Mail size={13} />} label="Email" value={info.user?.email || "—"} />
                    <Row
                      icon={<Calendar size={13} />}
                      label="Member since"
                      value={fmtDate(info.user?.createdAt)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Stat
                      icon={<MessageSquare size={13} />}
                      label="Messages"
                      value={info.totalMessages ?? 0}
                      color="text-orange-400"
                    />
                    <Stat
                      icon={<Star size={13} />}
                      label="Starred"
                      value={info.starredCount ?? 0}
                      color="text-amber-400"
                    />
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-zinc-600">
                      Chat started
                    </p>
                    <p className="text-[13px] font-bold text-emerald-400">
                      {fmtDate(info.startedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-600">
                      <ImageIcon size={11} /> Shared media
                    </p>
                    {info.sharedMedia?.length ? (
                      <div className="grid grid-cols-3 gap-1.5">
                        {info.sharedMedia.map((m, i) => (
                          <button
                            key={i}
                            onClick={() => navigate(`/post/${m._id}`)}
                            className="aspect-square overflow-hidden rounded-lg border border-zinc-800 bg-white transition hover:ring-2 hover:ring-orange-500"
                          >
                            <img
                              src={getUrl(m.mediaUrl)}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-zinc-800 py-8 text-center">
                        <ImageIcon size={20} className="mx-auto mb-2 text-zinc-700" />
                        <p className="text-[11px] text-zinc-600">No shared media yet</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 border-t border-zinc-800 pt-4">
                    <MI
                      icon={<User size={14} />}
                      label="View full profile"
                      onClick={() => navigate(`/users/${activeFriend._id}`)}
                    />
                    <MI
                      icon={muted ? <Bell size={14} /> : <BellOff size={14} />}
                      label={muted ? "Unmute notifications" : "Mute notifications"}
                      onClick={toggleMute}
                    />
                    <MI icon={<Trash2 size={14} />} label="Clear messages" onClick={clearChat} />
                    <MI
                      icon={<UserX size={14} />}
                      label={blocked ? "Unblock user" : "Block user"}
                      danger
                      onClick={toggleBlock}
                    />
                    <MI icon={<Trash2 size={14} />} label="Delete chat" danger onClick={deleteChat} />
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <Loader2 size={22} className="mb-3 animate-spin text-zinc-700" />
                  <p className="text-[11.5px] text-zinc-600">Loading info…</p>
                </div>
              )}
            </aside>
          </>
        )}
      </div>

      {msgMenu &&
        createPortal(
          <div
            ref={msgMenuRef}
            style={{
              position: "fixed",
              top: msgMenu.top,
              left: msgMenu.left,
              transform: msgMenu.up ? "translateY(-100%)" : "none",
              zIndex: 300,
            }}
            className="w-[208px] rounded-2xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl shadow-black/70"
          >
            {(() => {
              const m = msgMenu.msg;
              const mine = sameId(m.sender?._id || m.sender, myId);
              const starred = m.starredBy?.some((u) => sameId(u, myId));
              const gone = m.deletedForEveryone;
              return (
                <>
                  {!gone && <MI icon={<Reply size={14} />} label="Reply" onClick={() => doReply(m)} />}
                  {!gone && m.text && (
                    <MI icon={<Copy size={14} />} label="Copy text" onClick={() => doCopy(m)} />
                  )}
                  {!gone && mine && m.text && !m.post && (
                    <MI icon={<Pencil size={14} />} label="Edit message" onClick={() => doEdit(m)} />
                  )}
                  {!gone && (
                    <MI
                      icon={
                        <Star
                          size={14}
                          className={starred ? "fill-amber-400 text-amber-400" : ""}
                        />
                      }
                      label={starred ? "Unstar message" : "Star message"}
                      onClick={() => doStar(m)}
                    />
                  )}
                  <div className="my-1.5 h-px bg-zinc-900" />
                  <MI icon={<Trash2 size={14} />} label="Delete for me" onClick={() => doDeleteMe(m)} />
                  {mine && !gone && (
                    <MI
                      icon={<Trash2 size={14} />}
                      label="Delete for everyone"
                      danger
                      onClick={() => doDeleteAll(m)}
                    />
                  )}
                </>
              );
            })()}
          </div>,
          document.body
        )}

      <CallScreen
        call={call}
        localStream={localStream}
        remoteStream={remoteStream}
        error={callError}
        avatar={avatar}
        onAccept={acceptCall}
        onEnd={endCall}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
      />

      <ConfirmModal
        open={!!confirm}
        loading={confirmLoading}
        title={confirm?.title}
        message={confirm?.message}
        note={confirm?.note}
        confirmText={confirm?.confirmText}
        icon={confirm?.icon}
        tone={confirm?.tone}
        onConfirm={runConfirm}
        onCancel={() => !confirmLoading && setConfirm(null)}
      />
    </>
  );
}

function MI({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12.5px] font-bold transition active:scale-[0.98] ${
        danger
          ? "text-rose-400 hover:bg-rose-500/10"
          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
          danger ? "bg-rose-500/10" : "bg-zinc-800/70"
        }`}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">{label}</p>
        <p className="truncate text-[12.5px] font-semibold text-zinc-200">{value}</p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3.5">
      <p className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${color}`}>
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Bubble({ m, mine, grouped, friend, myId, navigate, highlight, onMenu, onReply }) {
  const hl = (t) => {
    if (!highlight?.trim() || !t) return t;
    const parts = t.split(
      new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    );
    return parts.map((p, i) =>
      p.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="rounded bg-yellow-400/90 px-0.5 text-black">
          {p}
        </mark>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  };

  const gone = m.deletedForEveryone;
  const starred = m.starredBy?.some((u) => sameId(u, myId));
  const isVideo = m.post?.mediaType === "video";

  return (
    <div
      className={`group/msg flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} ${
        grouped ? "mt-1" : "mt-3"
      }`}
    >
      {!mine &&
        (grouped ? (
          <span className="w-6 shrink-0" />
        ) : (
          <img src={avatar(friend)} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
        ))}

      {mine && !gone && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover/msg:opacity-100">
          <button
            onClick={() => onReply(m)}
            title="Reply"
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"
          >
            <Reply size={13} />
          </button>
          <button
            onClick={(e) => onMenu(e, m)}
            title="More"
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"
          >
            <ChevronDown size={13} />
          </button>
        </div>
      )}

      <div
        className={`overflow-hidden shadow-md ${
          m.post ? "max-w-[240px]" : "max-w-[80%] sm:max-w-[60%]"
        } ${
          gone
            ? "border border-zinc-800 bg-zinc-900/40 text-zinc-500 rounded-2xl"
            : mine
            ? `bg-gradient-to-br from-orange-500 to-orange-600 text-white ${
                grouped ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-br-sm"
              }`
            : `border border-zinc-800 bg-zinc-900 text-zinc-100 ${
                grouped ? "rounded-2xl rounded-bl-md" : "rounded-2xl rounded-bl-sm"
              }`
        } ${m.failed ? "opacity-60 ring-1 ring-rose-500/50" : ""}`}
      >
        {gone ? (
          <p className="flex items-center gap-1.5 px-3.5 py-2.5 text-[12.5px] italic">
            <Trash2 size={12} /> This message was deleted
          </p>
        ) : (
          <>
            {m.replyTo && (
              <div
                className={`mx-1.5 mt-1.5 rounded-lg border-l-[3px] px-2 py-1.5 ${
                  mine ? "border-white/60 bg-black/20" : "border-orange-500 bg-black/30"
                }`}
              >
                <p
                  className={`text-[9.5px] font-black ${
                    mine ? "text-white/80" : "text-orange-400"
                  }`}
                >
                  {sameId(m.replyTo.sender?._id || m.replyTo.sender, myId)
                    ? "You"
                    : m.replyTo.sender?.name || "User"}
                </p>
                <p className="truncate text-[11px] opacity-75">
                  {m.replyTo.deletedForEveryone
                    ? "Message deleted"
                    : m.replyTo.post
                    ? "📎 Shared post"
                    : m.replyTo.text}
                </p>
              </div>
            )}
            {m.post && (
              <div
                className={`m-1.5 overflow-hidden rounded-xl border ${
                  mine ? "border-white/20 bg-black/25" : "border-zinc-800 bg-black/40"
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 border-b px-2 py-1.5 ${
                    mine ? "border-white/15" : "border-zinc-800"
                  }`}
                >
                  <img
                    src={avatar(m.post.userId)}
                    alt=""
                    className="h-4 w-4 rounded-full object-cover"
                  />
                  <span className="truncate text-[9.5px] font-bold opacity-90">
                    {m.post.userId?.name}
                  </span>
                </div>
                {m.post.mediaUrl && (
                  <div className="flex h-[135px] items-center justify-center bg-white p-1.5">
                    {isVideo ? (
                      <video
                        src={getUrl(m.post.mediaUrl)}
                        className="h-full w-full object-contain"
                        controls
                      />
                    ) : (
                      <img
                        src={getUrl(m.post.mediaUrl)}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                )}
                {m.post.caption && (
                  <p className="line-clamp-2 px-2 py-1.5 text-[10px] leading-snug opacity-85">
                    {m.post.caption}
                  </p>
                )}
                <button
                  onClick={() => navigate(`/post/${m.post._id}`)}
                  className={`flex w-full items-center justify-center gap-1 border-t py-1.5 text-[9.5px] font-black transition ${
                    mine
                      ? "border-white/15 text-white/90 hover:bg-white/10"
                      : "border-zinc-800 text-orange-400 hover:bg-orange-500/10"
                  }`}
                >
                  View Post <ExternalLink size={9} />
                </button>
              </div>
            )}
            {m.text && (
              <p className="whitespace-pre-wrap break-words px-3.5 pb-1 pt-2 text-[13px] leading-relaxed">
                {hl(m.text)}
              </p>
            )}
          </>
        )}

        <div className={`flex items-center justify-end gap-1 px-3 pb-1.5 ${m.text || gone ? "" : "pt-1"}`}>
          {starred && !gone && <Star size={9} className="fill-amber-400 text-amber-400" />}
          {m.edited && !gone && (
            <span className={`text-[8.5px] italic ${mine ? "text-white/50" : "text-zinc-600"}`}>
              edited
            </span>
          )}

          {mine &&
            !gone &&
            (m.failed ? (
              <span className="text-[9px] font-bold text-rose-300">failed</span>
            ) : m.pending ? (
              <Loader2 size={10} className="animate-spin text-white/50" />
            ) : m.read ? (
              <CheckCheck size={11} className="text-sky-400" />
            ) : m.delivered ? (
              <CheckCheck size={11} className="text-zinc-300" />
            ) : (
              <Check size={11} className="text-zinc-500" />
            ))}

          <span className={`text-[9px] ${mine ? "text-white/60" : "text-zinc-600"}`}>
            {timeOf(m.createdAt)}
          </span>
        </div>
      </div>

      {!mine && !gone && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover/msg:opacity-100">
          <button
            onClick={() => onReply(m)}
            title="Reply"
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"
          >
            <Reply size={13} />
          </button>
          <button
            onClick={(e) => onMenu(e, m)}
            title="More"
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"
          >
            <ChevronDown size={13} />
          </button>
        </div>
      )}
    </div>
  );
}