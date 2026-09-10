import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate, Link } from "react-router-dom";
import { MessageSquare, ExternalLink, User, Send } from "lucide-react";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";
const socket = io(API);

function SharedPosts() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const token = localStorage.getItem("token");
  const myId = localStorage.getItem("userId");
  const headers = { Authorization: `Bearer ${token}` };

  // ✅ Dynamic URL helper
  const getUrl = (u) => (u?.startsWith("http") ? u : `${API}${u}`);
  const avatar = (img, name) =>
    img
      ? getUrl(img)
      : `https://ui-avatars.com/api/?name=${name || "U"}&background=ff6b00&color=fff&bold=true`;

  // ⬅️ Sidebar — conversations load
  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API}/api/messages/conversations`, { headers });
      const mapped = (res.data.conversations || []).map((c) => ({
        friendId: c.friend._id,
        friendName: c.friend.name,
        friendImage: c.friend.profileImage,
        lastMessage: c.lastMessage,
        unreadCount: c.unreadCount,
      }));
      setFriends(mapped);
      setLoading(false);
      setSelectedFriend((prev) => prev || mapped[0] || null);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 💬 Friend thread fetch
  useEffect(() => {
    if (!selectedFriend) return;
    const fetchThread = async () => {
      try {
        const res = await axios.get(
          `${API}/api/messages/${selectedFriend.friendId}`,
          { headers }
        );
        setMessages(res.data.messages || []);
        fetchConversations();
      } catch (error) {
        console.log(error);
      }
    };
    fetchThread();
  }, [selectedFriend?.friendId]);

  // 🔌 Socket Connection
  useEffect(() => {
    socket.emit("join", myId);
    const handler = (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      if (selectedFriend && senderId === selectedFriend.friendId) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations();
    };
    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, [selectedFriend]);

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 📤 Send message
  const sendMessage = async () => {
    if (!text.trim() || !selectedFriend) return;
    try {
      const res = await axios.post(
        `${API}/api/messages`,
        { receiverId: selectedFriend.friendId, text: text.trim() },
        { headers }
      );
      const msg = res.data.message;
      setMessages((prev) => [...prev, msg]);
      socket.emit("send_message", { receiverId: selectedFriend.friendId, message: msg });
      setText("");
      fetchConversations();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-[#0b0f19] text-white flex overflow-hidden">
      {/* ⬅️ LEFT SIDEBAR */}
      <div className="w-full md:w-80 bg-zinc-900/50 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            Messages <MessageSquare size={20} className="text-orange-500" />
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-zinc-500 text-sm animate-pulse">Loading...</p>
          ) : friends.length === 0 ? (
            <p className="p-4 text-zinc-500 text-sm">No conversations yet.</p>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.friendId}
                className={`flex items-center gap-3 p-4 transition-all duration-200 hover:bg-zinc-800 ${
                  selectedFriend?.friendId === friend.friendId
                    ? "bg-zinc-800 border-l-4 border-orange-500"
                    : ""
                }`}
              >
                <Link to={`/users/${friend.friendId}`} className="shrink-0 active:scale-95 transition-transform">
                  <img
                    src={avatar(friend.friendImage, friend.friendName)}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-700 hover:border-orange-500 transition-colors"
                    alt="avatar"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col cursor-pointer" onClick={() => setSelectedFriend(friend)}>
                  <Link 
                    to={`/users/${friend.friendId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-zinc-200 hover:text-orange-400 transition-colors truncate"
                  >
                    {friend.friendName}
                  </Link>
                  <span className="text-xs text-zinc-500 truncate mt-0.5">
                    {friend.lastMessage?.post ? "📎 Shared a post" : friend.lastMessage?.text || ""}
                  </span>
                </div>

                {friend.unreadCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    {friend.unreadCount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ➡️ RIGHT SIDE: Chat Thread */}
      <div className="hidden md:flex flex-1 flex-col bg-[#0b0f19] overflow-hidden">
        {selectedFriend ? (
          <>
            <div className="p-4 bg-zinc-900/30 border-b border-zinc-800 flex items-center">
              <Link to={`/users/${selectedFriend.friendId}`} className="flex items-center gap-3 group hover:text-orange-400 transition-all duration-200">
                <img
                  src={avatar(selectedFriend.friendImage, selectedFriend.friendName)}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-800 group-hover:border-orange-500 transition-all"
                  alt="avatar"
                />
                <span className="font-bold text-lg">{selectedFriend.friendName}</span>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => {
                const mine = (m.sender?._id || m.sender) === myId;
                return (
                  <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-lg rounded-2xl p-3 shadow-xl ${
                      mine ? "bg-orange-500/90 rounded-br-none" : "bg-zinc-900/60 border border-zinc-800 rounded-tl-none"
                    }`}>
                      {m.post && (
                        <div className="border border-zinc-800 bg-black/40 rounded-xl overflow-hidden mb-1">
                          <Link to={`/users/${m.post.userId?._id || m.post.userId}`} className="p-2 flex items-center gap-2 bg-zinc-950/50 hover:bg-zinc-900/60 transition-colors group">
                            <img
                              src={avatar(m.post.userId?.profileImage, m.post.userId?.name)}
                              className="w-6 h-6 rounded-full object-cover border border-zinc-800 group-hover:border-orange-500 transition-all"
                              alt="author"
                            />
                            <span className="text-[10px] font-medium text-zinc-400 group-hover:text-orange-400 transition-colors">
                              Original Post by {m.post.userId?.name || "User"}
                            </span>
                          </Link>

                          {m.post.caption && (
                            <p className="text-zinc-400 text-xs italic px-3 py-2 m-2 border-l-2 border-orange-500">"{m.post.caption}"</p>
                          )}

                          <div className="aspect-video bg-zinc-800 flex items-center justify-center overflow-hidden">
                            {m.post.mediaType === "video" ? (
                              <video src={getUrl(m.post.mediaUrl)} className="w-full h-full object-cover" controls />
                            ) : (
                              <img src={getUrl(m.post.mediaUrl)} alt="Content" className="w-full h-full object-cover" />
                            )}
                          </div>

                          <button
                            onClick={() => navigate(`/post/${m.post._id}`)}
                            className="w-full py-2 text-xs font-bold text-orange-400 bg-zinc-900/80 hover:bg-zinc-800 border-t border-zinc-800 flex items-center justify-center gap-1"
                          >
                            View Full Post <ExternalLink size={12} />
                          </button>
                        </div>
                      )}

                      {m.text && <p className="text-sm px-1">{m.text}</p>}
                      <span className="text-[9px] opacity-60 block text-right mt-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 text-zinc-200 placeholder-zinc-500"
              />
              <button onClick={sendMessage} className="bg-orange-500 hover:bg-orange-600 p-2.5 rounded-full transition-colors active:scale-95">
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <User size={48} className="mb-4 opacity-20 animate-pulse" />
            <p className="font-semibold text-sm">Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedPosts;