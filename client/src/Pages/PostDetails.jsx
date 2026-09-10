import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Heart, MessageSquare, ArrowLeft, MessageCircle, Sparkles,
  Edit2, Trash2, Check, X,
} from "lucide-react";
import { toast } from "react-toastify";
import FriendShareModal from "../components/FriendShareModal";
import PostShareMenu from "../components/PostShareMenu";
import { requireAuth } from "../utils/guestGate";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [friends, setFriends] = useState([]);

  const token = localStorage.getItem("token");
  const isGuest = !token;

  const getAuthConfig = () =>
    token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fileUrl = (value) => {
    if (!value) return "";
    const src = String(value).trim();
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("blob:")) return src;
    if (src.startsWith("/")) return `${API}${src}`;
    return `${API}/uploads/${src}`;
  };

  const avatarOf = (person) => {
    if (person?.profileImage) return fileUrl(person.profileImage);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(person?.name || "User")}&background=ff6b00&color=fff&bold=true`;
  };

  const getUserProfileRoute = (targetUserId) => {
    if (!targetUserId) return "/profile";
    return String(targetUserId) === String(loggedInUserId)
      ? "/profile"
      : `/users/${targetUserId}`;
  };

  useEffect(() => {
    if (!token) return;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));
      setLoggedInUserId(payload.id || payload._id);
    } catch (e) {
      console.error("Token parsing error:", e);
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const cfg = getAuthConfig();

      const postRes = await axios.get(`${API}/api/post/${id}`, cfg);
      setPost(postRes.data.post);

      const commentRes = await axios.get(`${API}/api/comment/${id}`, cfg);
      setComments(commentRes.data.comments || []);

      if (token) {
        try {
          const friendsRes = await axios.get(`${API}/api/friend/my-friends`, cfg);
          const incomingData = friendsRes.data;
          if (Array.isArray(incomingData)) setFriends(incomingData);
          else if (incomingData.friends) setFriends(incomingData.friends);
          else if (incomingData.data) setFriends(incomingData.data);
          else setFriends([]);
        } catch {
          setFriends([]);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const likePost = async () => {
    if (!requireAuth(navigate, location, "Like")) return;
    try {
      await axios.put(`${API}/api/post/like/${id}`, {}, getAuthConfig());
      fetchData();
    } catch {
      toast.error("Failed to update like");
    }
  };

  const addComment = async () => {
    if (!requireAuth(navigate, location, "Comment")) return;
    if (!commentText.trim()) return;
    try {
      await axios.post(
        `${API}/api/comment/add`,
        { postId: id, text: commentText },
        getAuthConfig()
      );
      setCommentText("");
      toast.success("Comment added!");
      fetchData();
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingText.trim()) return;
    try {
      await axios.put(
        `${API}/api/comment/edit/${commentId}`,
        { text: editingText },
        getAuthConfig()
      );
      toast.success("Comment updated!");
      setEditingCommentId(null);
      setEditingText("");
      fetchData();
    } catch {
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await axios.delete(`${API}/api/comment/delete/${commentId}`, getAuthConfig());
      toast.success("Comment deleted!");
      fetchData();
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const shareToFriend = async (postId, friendId) => {
    if (!requireAuth(navigate, location, "Share")) return;
    try {
      await axios.post(
        `${API}/api/share/send`,
        { postId, receiverId: friendId },
        getAuthConfig()
      );
      toast.success("Post shared successfully!");
      setShowShare(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share post");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] flex items-center justify-center">
        <p className="text-zinc-500 font-medium animate-pulse text-sm">Loading post details...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 text-sm font-medium">Post not found!</p>
        <button onClick={() => navigate(-1)} className="text-xs bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-orange-400">
          Go Back
        </button>
      </div>
    );
  }

  const authorId = post.userId?._id || post.userId;
  const isLiked = (post.likes || []).some(
    (like) => String(like?._id || like) === String(loggedInUserId)
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] text-white py-12 px-4 flex justify-center items-center">
      <div className="w-full max-w-2xl relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-orange-400 mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Feed
        </button>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 p-4 border-b border-zinc-800/50">
            <Link to={getUserProfileRoute(authorId)} className="shrink-0">
              <img src={avatarOf(post.userId)} alt={post.userId?.name || "User"}
                className="w-10 h-10 rounded-full border border-zinc-700 object-cover hover:border-orange-500 transition-colors" />
            </Link>
            <div>
              <Link to={getUserProfileRoute(authorId)}
                className="font-bold text-sm text-zinc-200 hover:text-orange-400 transition-colors">
                {post.userId?.name || "User"}
              </Link>
              <p className="text-[10px] text-zinc-500 font-medium">Developer Ecosystem</p>
            </div>
            <Sparkles className="text-orange-500/40 ml-auto" size={16} />
          </div>

          <div className="w-full bg-black/40 flex items-center justify-center overflow-hidden border-b border-zinc-800/30">
            {post.mediaType === "video" ? (
              <video src={fileUrl(post.mediaUrl)} controls className="w-full h-auto max-h-[500px] object-contain" />
            ) : (
              <img src={fileUrl(post.mediaUrl)} alt="Post" className="w-full h-auto max-h-[500px] object-contain" />
            )}
          </div>

          <div className="p-5">
            {post.caption && (
              <p className="text-zinc-300 text-sm font-medium leading-relaxed mb-4 pl-1">
                <Link to={getUserProfileRoute(authorId)} className="font-bold text-zinc-100 mr-2 hover:text-orange-400">
                  {post.userId?.name}
                </Link>
                {post.caption}
              </p>
            )}

            <div className="flex items-center gap-4 mb-3">
              <button onClick={likePost}
                className={`flex items-center gap-1.5 group transition-colors text-xs font-bold ${
                  isLiked ? "text-red-500" : "text-zinc-400 hover:text-red-500"
                } ${isGuest ? "opacity-70" : ""}`}>
                <Heart size={18}
                  className={`transition-transform group-hover:scale-110 ${
                    isLiked ? "fill-red-500 text-red-500" : "fill-transparent group-hover:fill-red-500/10"
                  }`} />
                <span>{post.likes?.length || 0} Likes</span>
              </button>

              <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-xs">
                <MessageCircle size={18} />
                <span>{comments.length || 0} Comments</span>
              </div>

              <div className="ml-auto"
                onClickCapture={(e) => {
                  if (isGuest) {
                    e.preventDefault();
                    e.stopPropagation();
                    requireAuth(navigate, location, "Share");
                  }
                }}>
                <PostShareMenu postId={id} onSendToFriend={() => setShowShare(true)} />
              </div>
            </div>

            <div className="bg-zinc-950/40 border border-zinc-800/60 p-4 rounded-2xl mt-4">
              <h4 className="text-xs font-black text-zinc-500 tracking-wider uppercase mb-3 flex items-center gap-1">
                <MessageSquare size={12} /> Conversation ({comments.length})
              </h4>

              {isGuest ? (
                <button
                  onClick={() => requireAuth(navigate, location, "Comment")}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-bold text-orange-400 transition hover:bg-orange-500/20"
                >
                  🔒 Login to join the conversation
                </button>
              ) : (
                <div className="flex gap-2 mb-4">
                  <input
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 outline-none text-xs text-zinc-200 focus:border-orange-500/60 transition-colors"
                    placeholder="Write a professional comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        addComment();
                      }
                    }}
                  />
                  <button onClick={addComment}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 rounded-xl text-xs font-bold transition-colors active:scale-95">
                    Post
                  </button>
                </div>
              )}

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {comments.length > 0 ? (
                  [...comments]
                    .sort((a, b) => {
                      const aIsAuthor = String(a.userId?._id || a.userId) === String(authorId);
                      const bIsAuthor = String(b.userId?._id || b.userId) === String(authorId);
                      return Number(bIsAuthor) - Number(aIsAuthor);
                    })
                    .map((comment) => {
                      const commentUserId = comment.userId?._id || comment.userId;
                      const isMyComment = String(commentUserId) === String(loggedInUserId);
                      const isPostAuthor = String(commentUserId) === String(authorId);

                      return (
                        <div key={comment._id}
                          className={`text-xs p-2 rounded-xl flex items-center justify-between group/comment transition-all ${
                            isPostAuthor
                              ? "bg-orange-500/10 border border-orange-500/30 shadow-[0_0_12px_rgba(234,88,12,0.1)]"
                              : "bg-zinc-900/30 border border-zinc-800/20"
                          }`}>
                          <div className="flex-1 mr-2 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link to={getUserProfileRoute(commentUserId)}
                                className="font-extrabold text-zinc-300 hover:text-orange-400">
                                {comment.userId?.name || "Anonymous"}
                              </Link>
                              {isPostAuthor && (
                                <span className="bg-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-orange-500/30">
                                  Author
                                </span>
                              )}
                            </div>

                            {editingCommentId === comment._id ? (
                              <input type="text" value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleEditComment(comment._id); }}
                                className="bg-zinc-950 border border-zinc-700 px-2 py-0.5 rounded text-zinc-200 outline-none focus:border-orange-500 text-xs w-full mt-1"
                              />
                            ) : (
                              <p className="text-zinc-400 font-medium mt-0.5 break-words">{comment.text}</p>
                            )}
                          </div>

                          {isMyComment && (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover/comment:opacity-100 transition-opacity ml-2 shrink-0">
                              {editingCommentId === comment._id ? (
                                <>
                                  <button onClick={() => handleEditComment(comment._id)} className="text-green-500 hover:text-green-400 p-1"><Check size={14} /></button>
                                  <button onClick={() => { setEditingCommentId(null); setEditingText(""); }} className="text-zinc-500 hover:text-zinc-400 p-1"><X size={14} /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => { setEditingCommentId(comment._id); setEditingText(comment.text); }} className="text-zinc-400 hover:text-orange-400 p-1"><Edit2 size={12} /></button>
                                  <button onClick={() => handleDeleteComment(comment._id)} className="text-zinc-400 hover:text-red-500 p-1"><Trash2 size={12} /></button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <p className="text-xs text-zinc-600 text-center py-1">
                    No comments yet. Be the first to start the conversation!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showShare && (
        <FriendShareModal
          postId={id}
          friends={friends}
          onClose={() => setShowShare(false)}
          onShare={shareToFriend}
        />
      )}
    </div>
  );
}

export default PostDetails;