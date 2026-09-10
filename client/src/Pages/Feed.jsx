import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { requireAuth } from "../utils/guestGate";
import axios from "axios";
import FriendShareModal from "../components/FriendShareModal";
import PostShareMenu from "../components/PostShareMenu";
import { toast } from "react-toastify";
import {
  Heart, MessageCircle, Sparkles, Edit2, Trash2, Check, X, MessageSquare, Share2,
} from "lucide-react";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function Feed() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isGuest = !token;

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [friends, setFriends] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const getLoggedInUserId = () => {
    try {
      const t = localStorage.getItem("token");
      if (!t) return null;
      const base64Url = t.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.id || decoded._id || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const loggedInUserId = getLoggedInUserId();

  const getUserProfileRoute = (targetUserId) => {
    if (!targetUserId) return "/profile";
    return String(targetUserId) === String(loggedInUserId) ? "/profile" : `/users/${targetUserId}`;
  };

  const getAuthConfig = () => {
    const t = localStorage.getItem("token");
    return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
  };

  const getProfileImage = (user) => {
    if (user?.profileImage) {
      if (user.profileImage.startsWith("http")) return user.profileImage;
      return `${API}${user.profileImage.startsWith("/") ? user.profileImage : `/${user.profileImage}`}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=ff6b00&color=fff&bold=true`;
  };

  const fetchFriends = async () => {
    if (isGuest) return;
    try {
      const res = await axios.get(`${API}/api/friend/my-friends`, getAuthConfig());
      setFriends(res.data.friends || []);
    } catch (error) {
      console.error("Fetch friends error:", error);
    }
  };

  const fetchFeed = async () => {
    try {
      const config = getAuthConfig();
      const requests = [axios.get(`${API}/api/post/feed`, config)];
      if (!isGuest) {
        requests.push(axios.get(`${API}/api/share/received`, config));
      }
      const [feedResult, sharedResult] = await Promise.allSettled(requests);

      let normalPosts = [];
      if (feedResult.status === "fulfilled") {
        normalPosts = (feedResult.value.data.posts || []).map((post) => ({
          ...post, isShared: false, feedKey: `normal-${post._id}`,
        }));
      }

      let sharedPosts = [];
      if (sharedResult?.status === "fulfilled") {
        sharedPosts = (sharedResult.value.data.posts || []).map((post, index) => ({
          ...post, isShared: true, feedKey: `shared-${post._id}-${post.sharedAt || index}`,
        }));
      }

      const allPosts = [...normalPosts, ...sharedPosts].sort((a, b) => {
        const dateA = new Date(a.isShared ? a.sharedAt || a.createdAt : a.createdAt).getTime();
        const dateB = new Date(b.isShared ? b.sharedAt || b.createdAt : b.createdAt).getTime();
        return dateB - dateA;
      });

      setPosts(allPosts);
    } catch (error) {
      console.error("Fetch feed error:", error);
      toast.error("Failed to load feed");
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`${API}/api/comment/${postId}`, getAuthConfig());
      setComments((prev) => ({ ...prev, [postId]: res.data.comments || [] }));
    } catch (error) {
      console.error(`Fetch comments error (${postId}):`, error);
    }
  };

  const likePost = async (postId) => {
    if (!requireAuth(navigate, location, "Like")) return;
    try {
      await axios.put(`${API}/api/post/like/${postId}`, {}, getAuthConfig());
      await fetchFeed();
    } catch (error) {
      console.error("Like error:", error);
      toast.error("Unable to update like");
    }
  };

  const addComment = async (postId) => {
    if (!requireAuth(navigate, location, "Comment")) return;
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      await axios.post(`${API}/api/comment/add`, { postId, text: text.trim() }, getAuthConfig());
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      await fetchComments(postId);
      toast.success("Comment added!");
    } catch (error) {
      console.error("Add comment error:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleEditComment = async (commentId, postId) => {
    if (!editingText.trim()) return;
    try {
      await axios.put(`${API}/api/comment/edit/${commentId}`, { text: editingText.trim() }, getAuthConfig());
      setEditingCommentId(null);
      setEditingText("");
      await fetchComments(postId);
      toast.success("Comment updated!");
    } catch (error) {
      console.error("Edit comment error:", error);
      toast.error("Failed to edit comment");
    }
  };

  const handleDeleteComment = (commentId, postId) => {
    let toastId;
    const confirmDelete = async () => {
      try {
        await axios.delete(`${API}/api/comment/delete/${commentId}`, getAuthConfig());
        await fetchComments(postId);
        toast.dismiss(toastId);
        toast.success("Comment deleted successfully!");
      } catch (error) {
        console.error("Delete comment error:", error);
        toast.error("Failed to delete comment");
      }
    };

    toastId = toast.info(
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-zinc-200">Are you sure you want to delete this comment?</p>
        <div className="flex gap-2 justify-end mt-1">
          <button onClick={() => toast.dismiss(toastId)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold px-2.5 py-1 rounded transition-colors">Cancel</button>
          <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors">Delete</button>
        </div>
      </div>,
      { position: "top-center", autoClose: false, closeOnClick: false, draggable: false, theme: "dark" }
    );
  };

  const shareToFriend = async (postId, receiverId) => {
    try {
      await axios.post(`${API}/api/share/send`, { postId, receiverId }, getAuthConfig());
      toast.success("Post Shared");
      setShowShare(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("Share error:", error);
      toast.error(error.response?.data?.message || "Failed to share post");
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!posts.length) return;
    const uniquePostIds = [...new Set(posts.map((post) => post._id).filter(Boolean))];
    uniquePostIds.forEach((postId) => fetchComments(postId));
  }, [posts]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] text-white py-12 px-4 pb-20 flex justify-center">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-3xl md:text-4xl font-black tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            CareerSphere Feed
            <Sparkles className="text-orange-500 animate-pulse" size={24} />
          </h1>
          <p className="text-zinc-500 text-xs font-medium mt-1">
            See what professionals and creators are sharing across your network
          </p>
        </div>

        {posts.length > 0 ? (
          posts.map((post) => {
            const likes = post.likes || [];
            const isLiked = likes.some((id) => String(id?._id || id) === String(loggedInUserId));
            const postComments = comments[post._id] || [];
            const displayUser = post.isShared && post.sharedBy ? post.sharedBy : post.userId;
            const originalAuthor = post.userId;

            return (
              <div key={post.feedKey || post._id} className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl mb-8 overflow-hidden hover:border-zinc-700/60 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-3 p-4 border-b border-zinc-800/50">
                  <Link to={getUserProfileRoute(displayUser?._id)}>
                    <img src={getProfileImage(displayUser)} alt={displayUser?.name || "User"} className="w-10 h-10 rounded-full border border-zinc-800 object-cover shadow-md hover:border-orange-500 transition-colors" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={getUserProfileRoute(displayUser?._id)} className="font-bold text-sm text-zinc-200 hover:text-orange-400 cursor-pointer transition-colors">
                        {displayUser?.name || "Unknown User"}
                      </Link>
                      {post.isShared && <Share2 size={12} className="text-orange-400 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {post.isShared ? "Shared a post with you" : "Developer Ecosystem"}
                    </p>
                    {post.isShared && originalAuthor?.name && (
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        Original post by{" "}
                        <Link to={getUserProfileRoute(originalAuthor?._id)} className="text-zinc-400 font-semibold hover:text-orange-400 transition-colors">
                          {originalAuthor.name}
                        </Link>
                      </p>
                    )}
                  </div>
                </div>

                {post.mediaUrl && (
                  <div className="w-full bg-black/40 flex items-center justify-center max-h-[500px] overflow-hidden">
                    {post.mediaType === "video" ? (
                      <video src={post.mediaUrl} controls className="w-full h-auto max-h-[500px] object-contain" />
                    ) : (
                      <img src={post.mediaUrl} alt={post.caption || "Post"} className="w-full h-auto max-h-[500px] object-contain" />
                    )}
                  </div>
                )}

                <div className="p-4">
                  {post.caption && (
                    <p className="text-zinc-300 text-sm font-medium leading-relaxed mb-4">
                      <Link to={getUserProfileRoute(originalAuthor?._id)} className="font-bold text-zinc-100 mr-2 hover:text-orange-400 transition-colors">
                        {originalAuthor?.name || "Unknown User"}
                      </Link>
                      {post.caption}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mb-3 border-t border-zinc-800/30 pt-3">
                    <button onClick={() => likePost(post._id)} className={`flex items-center gap-1.5 group transition-colors ${isLiked ? "text-red-500" : "text-zinc-400 hover:text-red-500"}`}>
                      <Heart className={`w-5 h-5 group-hover:scale-110 transition-transform ${isLiked ? "fill-red-500 text-red-500" : "fill-transparent group-hover:fill-red-500/10"}`} />
                      <span className="text-xs font-bold">{likes.length}</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs font-bold">{postComments.length}</span>
                    </div>

                    <div className="ml-auto" onClickCapture={(e) => {
                      if (isGuest) { e.preventDefault(); e.stopPropagation(); requireAuth(navigate, location, "Share"); }
                    }}>
                      <PostShareMenu postId={post._id} onSendToFriend={() => { setSelectedPost(post._id); setShowShare(true); }} />
                    </div>
                  </div>

                  <div className="bg-zinc-950/40 border border-zinc-800/60 p-4 rounded-2xl mt-4">
                    <h4 className="text-xs font-black text-zinc-500 tracking-wider uppercase mb-3 flex items-center gap-1">
                      <MessageSquare size={12} /> Conversation ({postComments.length})
                    </h4>

                    {isGuest ? (
                      <button onClick={() => requireAuth(navigate, location, "Comment")} className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-bold text-orange-400 transition hover:bg-orange-500/20">
                        🔒 Login to join the conversation
                      </button>
                    ) : (
                      <div className="flex gap-2 mb-4">
                        <input
                          className="flex-1 min-w-0 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 outline-none text-xs text-zinc-200 focus:border-orange-500/60 transition-colors"
                          placeholder="Write a professional comment..."
                          value={commentText[post._id] || ""}
                          onChange={(e) => setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(post._id); } }}
                        />
                        <button onClick={() => addComment(post._id)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 rounded-xl text-xs font-bold transition-colors active:scale-95">Post</button>
                      </div>
                    )}

                    <div className="max-h-40 overflow-y-auto space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {postComments.length > 0 ? (
                        [...postComments]
                          .sort((a, b) => {
                            const authorId = String(post.userId?._id || post.userId || "");
                            const aId = String(a.userId?._id || a.userId || "");
                            const bId = String(b.userId?._id || b.userId || "");
                            return Number(bId === authorId) - Number(aId === authorId);
                          })
                          .map((comment) => {
                            const commentUserId = String(comment.userId?._id || comment.userId || "");
                            const authorId = String(post.userId?._id || post.userId || "");
                            const isMyComment = commentUserId === String(loggedInUserId);
                            const isPostAuthor = commentUserId === authorId;

                            return (
                              <div key={comment._id} className={`text-xs p-2 rounded-xl flex items-center justify-between group/comment transition-all ${isPostAuthor ? "bg-orange-500/10 border border-orange-500/30 shadow-[0_0_12px_rgba(234,88,12,0.1)]" : "bg-zinc-900/30 border border-zinc-800/20"}`}>
                                <div className="flex-1 mr-2 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <Link to={getUserProfileRoute(comment.userId?._id)} className="font-extrabold text-zinc-300 hover:text-orange-400 transition-colors">
                                      {comment.userId?.name || "Anonymous"}
                                    </Link>
                                    {isPostAuthor && (
                                      <span className="bg-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border border-orange-500/30">Author</span>
                                    )}
                                  </div>
                                  {editingCommentId === comment._id ? (
                                    <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleEditComment(comment._id, post._id); }} className="bg-zinc-950 border border-zinc-700 px-2 py-1 rounded text-zinc-200 outline-none focus:border-orange-500 text-xs w-full mt-1" autoFocus />
                                  ) : (
                                    <p className="text-zinc-400 font-medium mt-0.5 break-words">{comment.text}</p>
                                  )}
                                </div>
                                {isMyComment && (
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover/comment:opacity-100 transition-opacity ml-2 shrink-0">
                                    {editingCommentId === comment._id ? (
                                      <>
                                        <button onClick={() => handleEditComment(comment._id, post._id)} className="text-green-500 hover:text-green-400 p-1" title="Save"><Check size={14} /></button>
                                        <button onClick={() => { setEditingCommentId(null); setEditingText(""); }} className="text-zinc-500 hover:text-zinc-400 p-1" title="Cancel"><X size={14} /></button>
                                      </>
                                    ) : (
                                      <>
                                        <button onClick={() => { setEditingCommentId(comment._id); setEditingText(comment.text); }} className="text-zinc-400 hover:text-orange-400 p-1 transition-colors" title="Edit"><Edit2 size={12} /></button>
                                        <button onClick={() => handleDeleteComment(comment._id, post._id)} className="text-zinc-400 hover:text-red-500 p-1 transition-colors" title="Delete"><Trash2 size={12} /></button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-xs text-zinc-600 text-center py-1">No comments yet. Be the first to start the conversation!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl max-w-md mx-auto">
            <p className="text-zinc-500 text-sm font-medium">Your network is quiet. Add friends to populate your feed!</p>
          </div>
        )}

        {showShare && (
          <FriendShareModal
            postId={selectedPost}
            friends={friends}
            onClose={() => { setShowShare(false); setSelectedPost(null); }}
            onShare={shareToFriend}
          />
        )}
      </div>
    </div>
  );
}

export default Feed;