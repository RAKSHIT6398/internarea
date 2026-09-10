// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import axiosInstance from "axios";
// import { useNavigate } from "react-router-dom";
// import {
//   Camera,Trash2,Calendar,FileText,LayoutDashboard,Layers,History,Users,UserPlus,ShieldCheck, Check,X,Sparkles,Zap,ArrowUpRight,
// MoreVertical,  Edit2,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import FriendShareModal from "../components/FriendShareModal";
// import PostShareMenu from "../components/PostShareMenu";
// function Profile() {
//   const [showFriendShare, setShowFriendShare] = useState(false);
//   const [sharePostId, setSharePostId] = useState(null);
//   const [shareFriends, setShareFriends] = useState([]);
//   const [profile, setProfile] = useState(null);
//   const [activeTab, setActiveTab] = useState("posts");
//   const [openMenu, setOpenMenu] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [commentCounts, setCommentCounts] = useState({});
//   const [editingCommentId, setEditingCommentId] = useState(null);
//   const [editingText, setEditingText] = useState("");
//   const navigate = useNavigate();
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [activeComments, setActiveComments] = useState([]);
//   const [newCommentText, setNewCommentText] = useState("");
//   const [appliedInternships, setAppliedInternships] = useState([]);
//   const [showShareMenu, setShowShareMenu] = useState(null);

//   const handleDeleteLog = async (logId) => {
//     let toastId;

//     const confirmDelete = async () => {
//       try {
//         const response = await axios.delete(
//           `http://localhost:5000/api/auth/login-history/${logId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );

//         if (response.data.success) {
//           toast.dismiss(toastId);
//           toast.success("Login activity deleted successfully!", {
//             theme: "dark",
//           });
//         }
//       } catch (error) {
//         console.error("Error deleting log:", error);
//         toast.error(
//           error.response?.data?.message || "Failed to delete activity",
//           { theme: "dark" }
//         );
//       }
//     };
//     toastId = toast.info(
//       <div className="flex flex-col gap-2">
//         <p className="text-xs font-semibold text-zinc-200">
//           Are you sure you want to delete this login activity?
//         </p>
//         <div className="flex gap-2 justify-end mt-1">
//           <button
//             onClick={() => toast.dismiss(toastId)}
//             className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold px-2.5 py-1 rounded transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={confirmDelete}
//             className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors"
//           >
//             Delete
//           </button>
//         </div>
//       </div>,
//       {
//         position: "top-center",
//         autoClose: false,
//         closeOnClick: false,
//         draggable: false,
//         theme: "dark",
//       }
//     );
//   };

//   const handleDeletePost = async (postId, e) => {
//     if (e) e.stopPropagation();

//     let toastId;

//     const confirmDelete = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const response = await axiosInstance.delete(
//           `http://localhost:5000/api/post/${postId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         if (response.data.success) {
//           setProfile((prev) => ({
//             ...prev,
//             posts: (prev.posts || []).filter((p) => p._id !== postId),
//           }));

//           toast.dismiss(toastId);
//           toast.success("🗑️ Post deleted permanently!", {
//             theme: "dark",
//             autoClose: 2000,
//           });

//           if (selectedPost?._id === postId) setSelectedPost(null);
//         }
//       } catch (error) {
//         console.error("Delete Error:", error);
//         toast.dismiss(toastId);
//         toast.error(error.response?.data?.message || "Failed to delete", {
//           theme: "dark",
//         });
//       }
//     };

//     toastId = toast.info(
//       <div className="flex flex-col gap-3 p-2">
//         <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
//           <Trash2 size={16} />
//           <span>Delete this post?</span>
//         </div>
//         <p className="text-[10px] text-zinc-500 pl-7">This cannot be undone.</p>
//         <div className="flex justify-end gap-2 mt-1">
//           <button
//             onClick={() => toast.dismiss(toastId)}
//             className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-bold transition-all"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={confirmDelete}
//             className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-[10px] font-bold text-white shadow-lg shadow-red-600/20"
//           >
//             Yes, Delete
//           </button>
//         </div>
//       </div>,
//       {
//         position: "top-center",
//         autoClose: false,
//         closeOnClick: false,
//         draggable: false,
//         theme: "dark",
//       }
//     );
//   };

//   const shareToFriend = async (postId, receiverId) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/share/send",
//         { postId, receiverId },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (!response.data.success) {
//         throw new Error(response.data.message || "Failed to share post");
//       }

//       toast.success("Post shared successfully!", {
//         theme: "dark",
//         autoClose: 1800,
//       });

//       setShowFriendShare(false);
//       setSharePostId(null);
//     } catch (error) {
//       console.error("Share post error:", error);
//       toast.error(error.response?.data?.message || "Failed to share post", {
//         theme: "dark",
//       });
//     }
//   };

//   const getLoggedInUserId = () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return null;

//       const base64Url = token.split(".")[1];
//       const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//       const jsonPayload = decodeURIComponent(
//         atob(base64)
//           .split("")
//           .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//           .join("")
//       );

//       const decoded = JSON.parse(jsonPayload);
//       return decoded.id || decoded._id;
//     } catch (error) {
//       console.error("Error decoding token:", error);
//       return null;
//     }
//   };

//   const loggedInUserId = getLoggedInUserId();

//   const openPostModal = async (post) => {
//     setSelectedPost(post);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axiosInstance.get(
//         `http://localhost:5000/api/comment/${post._id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setActiveComments(res.data.comments || []);
//     } catch (err) {
//       console.error("Error fetching comments for modal:", err);
//     }
//   };

//   const handleAddCommentFromModal = async () => {
//     if (!newCommentText.trim() || !selectedPost) return;
//     try {
//       const token = localStorage.getItem("token");
//       await axiosInstance.post(
//         "http://localhost:5000/api/comment/add",
//         { postId: selectedPost._id, text: newCommentText },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setNewCommentText("");
//       const res = await axiosInstance.get(
//         `http://localhost:5000/api/comment/${selectedPost._id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setActiveComments(res.data.comments || []);
//       toast.success("Comment added!");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to add comment");
//     }
//   };

//   const handleEditCommentFromModal = async (commentId) => {
//     if (!editingText.trim() || !selectedPost) return;
//     try {
//       const token = localStorage.getItem("token");
//       await axiosInstance.put(
//         `http://localhost:5000/api/comment/edit/${commentId}`,
//         { text: editingText },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setEditingCommentId(null);
//       setEditingText("");

//       const res = await axiosInstance.get(
//         `http://localhost:5000/api/comment/${selectedPost._id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setActiveComments(res.data.comments || []);
//       toast.success("Comment updated!");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to edit comment");
//     }
//   };

//   const handleDeleteCommentFromModal = (commentId) => {
//     let toastId;
//     const confirmDelete = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         await axiosInstance.delete(
//           `http://localhost:5000/api/comment/delete/${commentId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         const res = await axiosInstance.get(
//           `http://localhost:5000/api/comment/${selectedPost._id}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setActiveComments(res.data.comments || []);

//         toast.dismiss(toastId);
//         toast.success("Comment deleted successfully!");
//       } catch (error) {
//         console.error(error);
//         toast.error("Failed to delete comment");
//       }
//     };

//     toastId = toast.info(
//       <div className="flex flex-col gap-2">
//         <p className="text-xs font-semibold text-zinc-200">
//           Are you sure you want to delete this comment?
//         </p>
//         <div className="flex gap-2 justify-end mt-1">
//           <button
//             onClick={() => toast.dismiss(toastId)}
//             className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold px-2.5 py-1 rounded transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={confirmDelete}
//             className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors"
//           >
//             Delete
//           </button>
//         </div>
//       </div>,
//       {
//         position: "top-center",
//         autoClose: false,
//         closeOnClick: false,
//         draggable: false,
//         theme: "dark",
//       }
//     );
//   };

//   const acceptRequest = async (requestId) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axiosInstance.put(
//         "http://localhost:5000/api/friend/accept",
//         { requestId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const res = await axiosInstance.get(
//         "http://localhost:5000/api/auth/profile",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setProfile(res.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };
//   const uploadProfilePhoto = async (e) => {
//     try {
//       setUploading(true);
//       const file = e.target.files[0];
//       if (!file) return;

//       const formData = new FormData();
//       formData.append("profileImage", file);
//       const token = localStorage.getItem("token");

//       const res = await axiosInstance.put(
//         "http://localhost:5000/api/upload/upload-profile-photo",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       setProfile((prev) => ({
//         ...prev,
//         user: {
//           ...(prev.user || prev),
//           profileImage: res.data.profileImage,
//         },
//       }));
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const removeProfilePhoto = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       await axiosInstance.put(
//         "http://localhost:5000/api/upload/remove-profile-photo",
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       window.location.reload();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const removeFriend = async (friendId) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axiosInstance.delete("http://localhost:5000/api/friend/remove", {
//         headers: { Authorization: `Bearer ${token}` },
//         data: { friendId },
//       });
//       window.location.reload();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const rejectRequest = async (requestId) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axiosInstance.delete("http://localhost:5000/api/friend/reject", {
//         headers: { Authorization: `Bearer ${token}` },
//         data: { requestId },
//       });
//       const res = await axiosInstance.get(
//         "http://localhost:5000/api/auth/profile",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setProfile(res.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     const fetchProfileAndFriends = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const profileRes = await axiosInstance.get(
//           `http://localhost:5000/api/auth/profile`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         const friendsRes = await axiosInstance.get(
//           `http://localhost:5000/api/friend/my-friends`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const friendsList = friendsRes.data?.friends || [];

//         setShareFriends(friendsList);
//         setProfile({
//           ...profileRes.data,
//           friends: friendsList,
//         });
//         setAppliedInternships(
//           profileRes.data?.user?.appliedInternships ||
//             profileRes.data?.applications ||
//             []
//         );

//         const postsList = profileRes.data.posts || [];
//         postsList.forEach(async (post) => {
//           try {
//             const res = await axiosInstance.get(
//               `http://localhost:5000/api/comment/${post._id}`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );

//             setCommentCounts((prev) => ({
//               ...prev,
//               [post._id]: res.data.comments?.length || 0,
//             }));
//           } catch (err) {
//             console.error(
//               `Error fetching comments count for post ${post._id}:`,
//               err
//             );
//           }
//         });
//       } catch (error) {
//         console.error("Error fetching profile or friends:", error);
//       }
//     };

//     fetchProfileAndFriends();
//   }, []);

//   if (!profile)
//     return (
//       <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] text-white flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
//           <p className="text-zinc-400 text-sm tracking-wide">
//             Loading your profile dashboard...
//           </p>
//         </div>
//       </div>
//     );

//   const user = profile.user ?? profile;
//   const totalAllowed = user?.allowedApplications ?? 1;
//   const usedCount = profile.applications?.length ?? 0;
//   const currentPlan = user?.subscription || "Free";
//   const isGold =
//     currentPlan === "Gold" ||
//     String(currentPlan).toLowerCase() === "gold" ||
//     totalAllowed > 1000;
//   const progressPercent = isGold
//     ? 100
//     : Math.min((usedCount / (totalAllowed || 1)) * 100, 100);

//   return (
//     <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] text-white py-8 px-3 sm:px-4 pb-20 flex justify-center">
//       <div className="w-full max-w-4xl">
//         {/* ═══════════ PROFILE HEADER ═══════════ */}
//         <div className="relative z-30 bg-[#121622]/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 sm:p-6 mb-6 shadow-xl flex flex-col md:flex-row items-center gap-5 sm:gap-6">
//           <div className="group relative shrink-0">
//             {uploading && (
//               <div className="absolute inset-0 z-30 flex items-center justify-center rounded-full bg-black/70 backdrop-blur-sm">
//                 <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent sm:h-8 sm:w-8" />
//               </div>
//             )}

//             <img
//               src={
//                 user.profileImage
//                   ? user.profileImage
//                   : `https://ui-avatars.com/api/?name=${user.name || "User"}&background=ff6b00&color=fff&bold=true`
//               }
//               alt="Profile"
//               className="h-20 w-20 rounded-full border-4 border-zinc-800/50 object-cover shadow-2xl transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24 md:h-28 md:w-28"
//             />

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setOpenMenu((o) => !o);
//               }}
//               className="absolute bottom-0 right-0 z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#121622] bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transition-all hover:scale-110 active:scale-95 sm:h-8 sm:w-8"
//               aria-label="Change profile photo"
//             >
//               <Camera size={13} />
//             </button>

//             {openMenu && (
//               <>
//                 <div
//                   className="fixed inset-0 z-40"
//                   onClick={() => setOpenMenu(false)}
//                 />

//                 <div className="animate-fadeIn absolute left-1/2 top-full z-50 mt-3 w-56 max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] md:left-0 md:translate-x-0">
//                   <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
//                     Profile Photo
//                   </p>

//                   <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800/70">
//                     <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
//                       <Camera size={13} />
//                     </span>
//                     Upload New Photo
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => {
//                         uploadProfilePhoto(e);
//                         setOpenMenu(false);
//                       }}
//                       className="hidden"
//                     />
//                   </label>

//                   <button
//                     onClick={() => {
//                       removeProfilePhoto();
//                       setOpenMenu(false);
//                     }}
//                     className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
//                   >
//                     <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
//                       <Trash2 size={13} />
//                     </span>
//                     Remove Photo
//                   </button>

//                   <div className="my-1 h-px bg-zinc-800" />

//                   <button
//                     onClick={() => setOpenMenu(false)}
//                     className="w-full rounded-xl px-3 py-2 text-center text-xs font-medium text-zinc-500 transition hover:bg-zinc-800/50 hover:text-zinc-300"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>

//           <div className="min-w-0 flex-1 text-center md:text-left">
//             <h1 className="truncate bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-xl font-black tracking-wide text-transparent sm:text-2xl">
//               {user.name}
//             </h1>
//             <p className="mt-1 truncate text-xs font-medium text-zinc-400 sm:text-sm">
//               {user.email}
//             </p>
//           </div>

//           <div className="flex w-full shrink-0 gap-2 md:ml-auto md:w-auto">
//             <label className="flex-1 cursor-pointer rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-center text-[11px] font-semibold text-zinc-200 transition-all hover:bg-zinc-700 active:scale-95 md:flex-none">
//               Change Photo
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={uploadProfilePhoto}
//                 className="hidden"
//               />
//             </label>
//             {user.profileImage && (
//               <button
//                 onClick={removeProfilePhoto}
//                 className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[11px] font-semibold text-red-400 transition-all hover:bg-red-500/20 active:scale-95 md:flex-none"
//               >
//                 Remove
//               </button>
//             )}
//           </div>
//         </div>

//         {/* ═══════════ SUBSCRIPTION ═══════════ */}
//         <div className="relative z-0 mb-6 flex flex-col justify-between gap-5 overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl group sm:p-6 md:flex-row md:items-center">
//           <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl transition-all group-hover:bg-orange-500/15" />
//           <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-indigo-500/5 blur-3xl" />

//           <div className="relative z-10 w-full flex-1">
//             <div className="mb-4 flex items-start gap-3.5 sm:items-center sm:gap-4">
//               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/20 to-pink-500/10 text-orange-400 shadow-md shadow-orange-500/5">
//                 <Calendar size={20} />
//               </div>
//               <div className="min-w-0">
//                 <div className="flex flex-wrap items-center gap-2">
//                   <h2 className="text-sm font-black tracking-wide text-zinc-100 sm:text-base">
//                     Subscription Status
//                   </h2>
//                   <span
//                     className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
//                       isGold
//                         ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
//                         : currentPlan !== "Free"
//                         ? "border-purple-500/20 bg-purple-500/10 text-purple-400"
//                         : "border-zinc-700 bg-zinc-800 text-zinc-400"
//                     }`}
//                   >
//                     <Sparkles size={9} /> {currentPlan} Member
//                   </span>
//                 </div>
//                 <p className="mt-1 text-[11px] font-medium text-zinc-400 sm:text-xs">
//                   Expires on:{" "}
//                   <span className="font-semibold text-zinc-200">
//                     {user.subscriptionEndDate
//                       ? new Date(user.subscriptionEndDate).toLocaleDateString(
//                           "en-US",
//                           {
//                             day: "numeric",
//                             month: "short",
//                             year: "numeric",
//                           }
//                         )
//                       : "N/A"}
//                   </span>
//                 </p>
//               </div>
//             </div>

//             <div className="w-full max-w-md rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-3.5">
//               <div className="mb-1.5 flex justify-between text-[11px] font-bold">
//                 <span className="flex items-center gap-1 text-zinc-400">
//                   <Zap size={11} className="text-indigo-400" /> Usage Limit
//                 </span>
//                 <span className="text-zinc-200">
//                   {isGold
//                     ? `${usedCount} Sent / Unlimited`
//                     : `${usedCount} / ${totalAllowed} Applications`}
//                 </span>
//               </div>
//               <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
//                 <div
//                   className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500 transition-all duration-500"
//                   style={{ width: `${progressPercent}%` }}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="relative z-10 flex w-full flex-col justify-end gap-3 self-stretch sm:flex-row md:w-auto md:flex-col md:self-center">
//             <button
//               onClick={() => navigate("/dashboard")}
//               className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-800 px-6 py-3 text-[11px] font-bold tracking-wide text-zinc-200 transition-all hover:bg-zinc-700 active:scale-[0.98] md:w-48"
//             >
//               <LayoutDashboard size={14} /> My Resume
//             </button>

//             {!isGold ? (
//               <button
//                 onClick={() => navigate("/pricing")}
//                 className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-6 py-3 text-[11px] font-black tracking-wide text-white shadow-lg shadow-pink-500/20 transition-all hover:opacity-95 active:scale-[0.98] md:w-48"
//               >
//                 Upgrade Now <ArrowUpRight size={14} />
//               </button>
//             ) : (
//               <div className="w-full rounded-xl border border-amber-500/10 bg-amber-500/5 px-6 py-3 text-center text-[11px] font-bold text-amber-500/80 md:w-48">
//                 ⭐ Premium Active
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ═══════════ TABS ═══════════ */}
//         <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//           {[
//             {
//               key: "posts",
//               icon: <Layers size={14} />,
//               label: `Posts (${profile.posts?.length || 0})`,
//             },
//             {
//               key: "internships",
//               icon: <FileText size={14} />,
//               label: `Applications (${profile.applications?.length || 0})`,
//             },
//             { key: "history", icon: <History size={14} />, label: "History" },
//             {
//               key: "friends",
//               icon: <Users size={14} />,
//               label: `Friends (${profile.friends?.length || 0})`,
//             },
//             {
//               key: "friend-requests",
//               icon: <UserPlus size={14} />,
//               label: `Requests (${profile.friendRequests?.length || 0})`,
//             },
//           ].map((tab) => (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-[11px] font-bold transition-all ${
//                 activeTab === tab.key
//                   ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-pink-500/20"
//                   : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
//               }`}
//             >
//               {tab.icon}
//               {tab.label.toUpperCase()}
//             </button>
//           ))}
//         </div>

//         {/* ═══════════ CONTENT ═══════════ */}
//         <div className="min-h-[250px] overflow-visible rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-xl sm:p-6">
//           {activeTab === "posts" && (
//             <div className="grid animate-fadeIn grid-cols-1 gap-4 overflow-visible sm:grid-cols-2 lg:grid-cols-3">
//               {profile.posts?.length > 0 ? (
//                 profile.posts.map((p) => (
//                   <div
//                     key={p._id}
//                     onClick={() => openPostModal(p)}
//                     className="group relative z-0 cursor-pointer overflow-visible rounded-2xl border border-zinc-800/50 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-xl"
//                   >
//                     <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-zinc-950">
//                       {p.mediaUrl || p.image || p.imageUrl || p.postImage ? (
//                         <img
//                           src={
//                             p.mediaUrl || p.image || p.imageUrl || p.postImage
//                           }
//                           alt="Post"
//                           className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
//                           loading="lazy"
//                         />
//                       ) : (
//                         <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-900/30 text-zinc-600">
//                           <Layers size={30} strokeWidth={1} />
//                           <span className="mt-2 text-[10px] uppercase tracking-widest opacity-70">
//                             No Media
//                           </span>
//                         </div>
//                       )}

//                       <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
//                         <div className="flex gap-4 text-xs font-bold text-white drop-shadow-lg">
//                           <span>❤️ {p.likes?.length || 0}</span>
//                           <span>💬 {commentCounts[p._id] || 0}</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div
//                       className="absolute right-3 top-3 z-40"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setShowShareMenu(
//                             showShareMenu === p._id ? null : p._id
//                           );
//                         }}
//                         className={`rounded-full border border-white/10 bg-black/50 p-2 text-white backdrop-blur-md transition-transform hover:bg-black/70 ${
//                           showShareMenu === p._id ? "rotate-90" : ""
//                         }`}
//                         title="Options"
//                       >
//                         <MoreVertical size={14} strokeWidth={2.5} />
//                       </button>

//                       {showShareMenu === p._id && (
//                         <div
//                           className="absolute right-0 top-10 z-[60] max-h-[min(70vh,420px)] w-64 overflow-y-auto rounded-2xl border border-zinc-700/50 bg-zinc-950 p-3 shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <PostShareMenu
//                             embedded
//                             postId={p._id}
//                             onSendToFriend={() => {
//                               setSharePostId(p._id);
//                               setShowFriendShare(true);
//                               setShowShareMenu(null);
//                             }}
//                           />
//                           <div className="my-2 h-px bg-zinc-800" />
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setShowShareMenu(null);
//                               handleDeletePost(p._id, e);
//                             }}
//                             className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10"
//                           >
//                             <Trash2 size={14} /> Delete post
//                           </button>
//                         </div>
//                       )}
//                     </div>

//                     <div className="space-y-3 p-4">
//                       <h3 className="line-clamp-2 min-h-[40px] text-[13px] font-semibold leading-relaxed text-zinc-100">
//                         {p.caption || "No caption added..."}
//                       </h3>
//                       <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3">
//                         <span className="font-mono text-[10px] text-zinc-500">
//                           {new Date(p.createdAt).toLocaleDateString("en-IN", {
//                             day: "numeric",
//                             month: "short",
//                           })}
//                         </span>
//                         <ArrowUpRight
//                           size={14}
//                           className="text-zinc-600 transition-colors group-hover:text-orange-500"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="col-span-full flex flex-col items-center py-16 text-center text-zinc-500">
//                   <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-800/50 bg-zinc-900/50 transition-transform duration-500 hover:rotate-3">
//                     <Camera size={32} className="text-zinc-700" />
//                   </div>
//                   <h3 className="mb-2 font-bold text-zinc-300">No Posts Yet</h3>
//                   <p className="max-w-[250px] text-xs leading-relaxed text-zinc-600">
//                     Start sharing your journey. Your first upload will appear
//                     here.
//                   </p>
//                   <button
//                     onClick={() => navigate("/create-post")}
//                     className="mt-5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-pink-500/20 transition hover:opacity-90 active:scale-95"
//                   >
//                     Create your first post
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === "internships" && (
//             <div className="animate-fadeIn space-y-3">
//               {profile.applications?.length > 0 ? (
//                 profile.applications.map((app) => (
//                   <div
//                     key={app._id}
//                     className="flex flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-md transition-all hover:border-purple-500/25 sm:flex-row sm:items-center sm:justify-between"
//                   >
//                     <div className="flex min-w-0 items-center gap-3">
//                       <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
//                         <FileText size={16} />
//                       </div>
//                       <div className="min-w-0">
//                         <p className="truncate text-[13px] font-bold tracking-tight text-white">
//                           {app.internship?.title || "Internship Role"}
//                         </p>
//                         <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-500">
//                           {app.internship?.companyName ||
//                             "CareerSphere Partner"}
//                         </p>
//                         <span
//                           className={`mt-1.5 inline-block rounded border px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider ${
//                             app.isPremium
//                               ? "border-purple-500/20 bg-purple-500/10 text-purple-400"
//                               : "border-zinc-700 bg-zinc-800 text-zinc-400"
//                           }`}
//                         >
//                           {app.isPremium
//                             ? "⭐ Premium Resume"
//                             : "Standard Resume"}
//                         </span>
//                       </div>
//                     </div>

//                     <span
//                       className={`shrink-0 self-start rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider sm:self-auto ${
//                         app.status === "Accepted"
//                           ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
//                           : app.status === "Rejected"
//                           ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
//                           : app.status === "Shortlisted"
//                           ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
//                           : "border-blue-500/20 bg-blue-500/10 text-blue-400"
//                       }`}
//                     >
//                       {app.status || "Pending"}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="flex flex-col items-center py-16 text-center">
//                   <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-800/50 bg-zinc-900/50">
//                     <FileText size={30} className="text-zinc-700" />
//                   </div>
//                   <h3 className="mb-1.5 text-sm font-bold text-zinc-300">
//                     No Applications Yet
//                   </h3>
//                   <p className="max-w-[280px] text-xs text-zinc-600">
//                     Browse internships and apply — they'll show up here.
//                   </p>
//                   <button
//                     onClick={() => navigate("/internships")}
//                     className="mt-5 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-[11px] font-bold text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
//                   >
//                     Explore Internships
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === "history" && (
//             <div className="animate-fadeIn">
//               {profile.loginHistory?.length > 0 ? (
//                 <>
//                   <div className="hidden overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/40 lg:block">
//                     <div className="grid grid-cols-6 gap-2 border-b border-zinc-800/60 bg-zinc-900/40 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
//                       <div>Browser</div>
//                       <div>OS</div>
//                       <div>Device</div>
//                       <div>IP Address</div>
//                       <div>Login Time</div>
//                       <div className="text-right">Action</div>
//                     </div>
//                     <div className="divide-y divide-zinc-800/40">
//                       {profile.loginHistory.map((log) => (
//                         <div
//                           key={log._id}
//                           className="grid grid-cols-6 items-center gap-2 px-4 py-3.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-900/40"
//                         >
//                           <div className="flex items-center gap-2">
//                             <ShieldCheck
//                               size={13}
//                               className="shrink-0 text-emerald-500"
//                             />
//                             <span className="truncate">
//                               {log.browser || "Unknown"}
//                             </span>
//                           </div>
//                           <div className="truncate text-zinc-400">
//                             {log.os || "Unknown"}
//                           </div>
//                           <div className="capitalize text-zinc-400">
//                             {log.device || "desktop"}
//                           </div>
//                           <div className="truncate font-mono text-[10px] text-zinc-500">
//                             {log.ipAddress || "—"}
//                           </div>
//                           <div className="text-[10px] text-zinc-500">
//                             {new Date(log.loginTime).toLocaleString("en-IN", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                               hour: "2-digit",
//                               minute: "2-digit",
//                               hour12: true,
//                             })}
//                           </div>
//                           <div className="text-right">
//                             <button
//                               onClick={() => handleDeleteLog(log._id)}
//                               className="rounded-lg px-2 py-1 text-[10px] font-bold text-red-400 transition-all hover:bg-red-500/10"
//                               title="Delete Activity"
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="space-y-3 lg:hidden">
//                     {profile.loginHistory.map((log) => (
//                       <div
//                         key={log._id}
//                         className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-4"
//                       >
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="flex min-w-0 items-center gap-2.5">
//                             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
//                               <ShieldCheck size={15} />
//                             </div>
//                             <div className="min-w-0">
//                               <p className="truncate text-xs font-bold text-zinc-200">
//                                 {log.browser || "Unknown"}
//                               </p>
//                               <p className="truncate text-[10px] text-zinc-500">
//                                 {log.os || "Unknown"} ·{" "}
//                                 <span className="capitalize">
//                                   {log.device || "desktop"}
//                                 </span>
//                               </p>
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => handleDeleteLog(log._id)}
//                             className="shrink-0 rounded-lg bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400 transition hover:bg-red-500/20"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                         <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-[10px] text-zinc-500">
//                           <span className="truncate font-mono">
//                             {log.ipAddress || "—"}
//                           </span>
//                           <span>
//                             {new Date(log.loginTime).toLocaleString("en-IN", {
//                               day: "2-digit",
//                               month: "short",
//                               hour: "2-digit",
//                               minute: "2-digit",
//                               hour12: true,
//                             })}
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               ) : (
//                 <p className="py-12 text-center text-sm text-zinc-500">
//                   No login logs found.
//                 </p>
//               )}
//             </div>
//           )}

//           {activeTab === "friends" && (
//             <div className="grid animate-fadeIn grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//               {profile.friends?.length > 0 ? (
//                 profile.friends.map((friend) => {
//                   const friendInfo = friend.friendId?._id
//                     ? friend.friendId
//                     : friend;
//                   if (!friendInfo || !friendInfo.name) return null;

//                   return (
//                     <div
//                       key={friend._id || friendInfo._id}
//                       onClick={() => navigate(`/users/${friendInfo._id}`)}
//                       className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/40 hover:bg-zinc-800/40 hover:shadow-lg hover:shadow-orange-500/5"
//                     >
//                       <div className="flex min-w-0 items-center gap-3">
//                         <div className="relative shrink-0">
//                           <img
//                             src={
//                               friendInfo.profileImage
//                                 ? friendInfo.profileImage
//                                 : `https://ui-avatars.com/api/?name=${friendInfo.name}&background=ff6b00&color=fff&bold=true`
//                             }
//                             alt={friendInfo.name}
//                             className="h-12 w-12 rounded-full border-2 border-zinc-700 object-cover transition group-hover:border-orange-500/50"
//                           />
//                           <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0b0f19] bg-emerald-500" />
//                         </div>
//                         <div className="min-w-0">
//                           <h3 className="truncate text-[13px] font-bold text-zinc-200 transition-colors group-hover:text-orange-300">
//                             {friendInfo.name}
//                           </h3>
//                           <p className="truncate text-[10px] text-zinc-500">
//                             {friendInfo.email}
//                           </p>
//                           <p className="mt-0.5 text-[10px] font-semibold text-zinc-600 transition-colors group-hover:text-orange-400/80">
//                             View profile →
//                           </p>
//                         </div>
//                       </div>

//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           removeFriend(friendInfo._id);
//                         }}
//                         className="shrink-0 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
//                         title="Remove friend"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="col-span-full flex flex-col items-center py-16 text-center">
//                   <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-800/50 bg-zinc-900/50">
//                     <Users size={30} className="text-zinc-700" />
//                   </div>
//                   <h3 className="mb-1.5 text-sm font-bold text-zinc-300">
//                     No Friends Connected Yet 🤝
//                   </h3>
//                   <p className="max-w-[260px] text-xs text-zinc-600">
//                     Start building your network today.
//                   </p>
//                   <button
//                     onClick={() => navigate("/users")}
//                     className="mt-5 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-[11px] font-bold text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
//                   >
//                     Find People
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === "friend-requests" && (
//             <div className="animate-fadeIn space-y-3">
//               {profile.friendRequests?.length > 0 ? (
//                 profile.friendRequests.map((request) => (
//                   <div
//                     key={request._id}
//                     className="flex flex-col justify-between gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-800/20 p-4 transition-all hover:border-zinc-700 sm:flex-row sm:items-center"
//                   >
//                     <div className="flex min-w-0 items-center gap-3">
//                       <img
//                         src={
//                           request.userId?.profileImage
//                             ? `http://localhost:5000${request.userId.profileImage}`
//                             : `https://ui-avatars.com/api/?name=${request.userId?.name}&background=ff6b00&color=fff&bold=true`
//                         }
//                         alt={request.userId?.name}
//                         className="h-12 w-12 shrink-0 rounded-full border-2 border-orange-500/30 object-cover"
//                       />
//                       <div className="min-w-0">
//                         <h3 className="truncate text-[13px] font-bold text-zinc-200">
//                           {request.userId?.name}
//                         </h3>
//                         <p className="truncate text-[10px] text-zinc-500">
//                           {request.userId?.email}
//                         </p>
//                         <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-400/80">
//                           Wants to connect
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex shrink-0 gap-2 self-end sm:self-auto">
//                       <button
//                         onClick={() => acceptRequest(request._id)}
//                         className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-[11px] font-bold text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-95"
//                         title="Accept Request"
//                       >
//                         <Check size={14} /> Accept
//                       </button>
//                       <button
//                         onClick={() => rejectRequest(request._id)}
//                         className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-[11px] font-bold text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
//                         title="Reject Request"
//                       >
//                         <X size={14} /> Reject
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="flex flex-col items-center py-16 text-center">
//                   <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-800/50 bg-zinc-900/50">
//                     <UserPlus size={30} className="text-zinc-700" />
//                   </div>
//                   <h3 className="mb-1.5 text-sm font-bold text-zinc-300">
//                     No Pending Friend Requests
//                   </h3>
//                   <p className="text-xs text-zinc-600">
//                     You're all caught up! 🎉
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {selectedPost && (
//           <div className="fixed inset-0 z-[80] flex animate-fadeIn items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-4">
//             <div
//               className="absolute inset-0"
//               onClick={() => setSelectedPost(null)}
//             />

//             <div className="relative z-10 flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl md:h-[76vh] md:flex-row">
//               <button
//                 onClick={() => setSelectedPost(null)}
//                 className="absolute right-3 top-3 z-30 rounded-xl border border-zinc-800 bg-zinc-900/90 p-2 text-zinc-400 backdrop-blur-md transition hover:bg-zinc-800 hover:text-white"
//               >
//                 <X size={16} />
//               </button>

//               <div className="flex h-[38%] w-full items-center justify-center border-b border-zinc-800 bg-black md:h-full md:w-[55%] md:border-b-0 md:border-r">
//                 {selectedPost.mediaType === "video" ? (
//                   <video
//                     src={selectedPost.mediaUrl}
//                     controls
//                     className="h-full w-full object-contain"
//                   />
//                 ) : (
//                   <img
//                     src={
//                       selectedPost.mediaUrl ||
//                       selectedPost.image ||
//                       selectedPost.imageUrl
//                     }
//                     alt=""
//                     className="h-full w-full object-contain"
//                   />
//                 )}
//               </div>

//               <div className="flex h-[62%] w-full flex-col bg-zinc-900/20 md:h-full md:w-[45%]">
//                 <div className="flex items-center gap-3 border-b border-zinc-800 p-4">
//                   <img
//                     src={`https://ui-avatars.com/api/?name=${
//                       selectedPost.userId?.name || user?.name || "Developer"
//                     }&background=ff6b00&color=fff&bold=true`}
//                     alt=""
//                     className="h-9 w-9 rounded-full border border-zinc-700 object-cover"
//                   />
//                   <div className="min-w-0 flex-1">
//                     <h4 className="truncate text-[13px] font-bold text-zinc-200">
//                       {selectedPost?.userId?.name ||
//                         user?.name ||
//                         "Developer Ecosystem"}
//                     </h4>
//                     <p className="truncate text-[10px] font-medium text-zinc-500">
//                       @
//                       {selectedPost?.userId?.username ||
//                         selectedPost?.userId?.email?.split("@")[0] ||
//                         selectedPost?.userId?.name
//                           ?.toLowerCase()
//                           .replace(/\s+/g, "") ||
//                         "developer"}
//                     </p>
//                   </div>

//                   <div onClick={(e) => e.stopPropagation()}>
//                     <PostShareMenu
//                       postId={selectedPost._id}
//                       placement="bottom"
//                       onSendToFriend={() => {
//                         setSharePostId(selectedPost._id);
//                         setShowFriendShare(true);
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <div className="flex-1 space-y-4 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
//                   <div className="flex gap-3 border-b border-zinc-800/50 pb-4 text-xs">
//                     <span className="shrink-0 font-bold text-zinc-200">
//                       {selectedPost.userId?.name || user?.name}
//                     </span>
//                     <p className="leading-relaxed text-zinc-400">
//                       {selectedPost.caption}
//                     </p>
//                   </div>

//                   <div className="space-y-2.5">
//                     {activeComments.length > 0 ? (
//                       activeComments.map((comment) => {
//                         const isMyComment =
//                           comment.userId?._id === loggedInUserId ||
//                           comment.userId === loggedInUserId;

//                         return (
//                           <div
//                             key={comment._id}
//                             className="group/comment flex items-start justify-between rounded-xl border border-zinc-800/40 bg-zinc-900/50 p-3 text-xs transition-all"
//                           >
//                             <div className="mr-2 min-w-0 flex-1">
//                               <div className="flex flex-wrap items-center gap-1.5">
//                                 <span className="text-[11px] font-extrabold text-zinc-300">
//                                   {comment.userId?.name || "Anonymous"}
//                                 </span>
//                                 {(comment.userId?._id === selectedPost.userId ||
//                                   comment.userId === selectedPost.userId) && (
//                                   <span className="rounded border border-orange-500/20 bg-orange-500/10 px-1 text-[8px] font-black uppercase tracking-wider text-orange-400">
//                                     Author
//                                   </span>
//                                 )}
//                               </div>

//                               {editingCommentId === comment._id ? (
//                                 <input
//                                   type="text"
//                                   value={editingText}
//                                   onChange={(e) =>
//                                     setEditingText(e.target.value)
//                                   }
//                                   autoFocus
//                                   className="mt-1.5 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-orange-500"
//                                 />
//                               ) : (
//                                 <p className="mt-0.5 break-words text-[11px] font-medium text-zinc-400">
//                                   {comment.text}
//                                 </p>
//                               )}
//                             </div>

//                             {isMyComment && (
//                               <div className="ml-1 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/comment:opacity-100">
//                                 {editingCommentId === comment._id ? (
//                                   <>
//                                     <button
//                                       onClick={() =>
//                                         handleEditCommentFromModal(comment._id)
//                                       }
//                                       className="rounded p-1.5 text-emerald-500 hover:bg-emerald-500/10"
//                                       title="Save Changes"
//                                     >
//                                       <Check size={13} />
//                                     </button>
//                                     <button
//                                       onClick={() => {
//                                         setEditingCommentId(null);
//                                         setEditingText("");
//                                       }}
//                                       className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800"
//                                       title="Cancel"
//                                     >
//                                       <X size={13} />
//                                     </button>
//                                   </>
//                                 ) : (
//                                   <>
//                                     <button
//                                       onClick={() => {
//                                         setEditingCommentId(comment._id);
//                                         setEditingText(comment.text);
//                                       }}
//                                       className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-orange-400"
//                                       title="Edit Comment"
//                                     >
//                                       <Edit2 size={12} />
//                                     </button>
//                                     <button
//                                       onClick={() =>
//                                         handleDeleteCommentFromModal(
//                                           comment._id
//                                         )
//                                       }
//                                       className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
//                                       title="Delete Comment"
//                                     >
//                                       <Trash2 size={12} />
//                                     </button>
//                                   </>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <p className="py-8 text-center text-xs text-zinc-600">
//                         No comments yet.
//                       </p>
//                     )}
//                   </div></div>
//                 <div className="flex gap-2 border-t border-zinc-800 bg-zinc-950/60 p-3.5">
//                   <input
//                     type="text" placeholder="Add a comment..." value={newCommentText}
//                    onChange={(e) => setNewCommentText(e.target.value)}
//                     onKeyDown={(e) =>
//                       e.key === "Enter" && handleAddCommentFromModal()}
//                     className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs text-zinc-200 outline-none transition-colors focus:border-orange-500/50"
//                   />
//                   <button
//                     onClick={handleAddCommentFromModal}
//                     disabled={!newCommentText.trim()}
//                     className="rounded-xl bg-orange-500 px-4 text-xs font-bold text-white transition-colors hover:bg-orange-600 active:scale-95 disabled:opacity-40"
//                   >
//                     Post
//                   </button></div></div></div></div>)}
//         {showFriendShare && sharePostId && (
//           <FriendShareModal
//             postId={sharePostId}
//             friends={shareFriends}
//             onClose={() => {
//               setShowFriendShare(false);
//               setSharePostId(null);}}
//             onShare={shareToFriend}/> )} </div>    </div> );}
// export default Profile;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Camera, Trash2, Calendar, FileText, LayoutDashboard, Layers, History,
  Users, UserPlus, ShieldCheck, Check, X, Sparkles, Zap, ArrowUpRight,
  MoreVertical, Edit2,
} from "lucide-react";
import { toast } from "react-toastify";
import FriendShareModal from "../components/FriendShareModal";
import PostShareMenu from "../components/PostShareMenu";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

function Profile() {
  const [showFriendShare, setShowFriendShare] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [shareFriends, setShareFriends] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [openMenu, setOpenMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeComments, setActiveComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [appliedInternships, setAppliedInternships] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState(null);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const handleDeleteLog = async (logId) => {
    let toastId;
    const confirmDelete = async () => {
      try {
        const response = await axios.delete(`${API}/api/auth/login-history/${logId}`, getAuthHeaders());
        if (response.data.success) {
          toast.dismiss(toastId);
          toast.success("Login activity deleted successfully!", { theme: "dark" });
        }
      } catch (error) {
        console.error("Error deleting log:", error);
        toast.error(error.response?.data?.message || "Failed to delete activity", { theme: "dark" });
      }
    };

    toastId = toast.info(
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-zinc-200">Are you sure you want to delete this login activity?</p>
        <div className="flex gap-2 justify-end mt-1">
          <button onClick={() => toast.dismiss(toastId)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold px-2.5 py-1 rounded transition-colors">Cancel</button>
          <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded transition-colors">Delete</button>
        </div>
      </div>,
      { position: "top-center", autoClose: false, closeOnClick: false, draggable: false, theme: "dark" }
    );
  };

  const handleDeletePost = async (postId, e) => {
    if (e) e.stopPropagation();
    let toastId;
    const confirmDelete = async () => {
      try {
        const response = await axios.delete(`${API}/api/post/${postId}`, getAuthHeaders());
        if (response.data.success) {
          setProfile((prev) => ({ ...prev, posts: (prev.posts || []).filter((p) => p._id !== postId) }));
          toast.dismiss(toastId);
          toast.success("🗑️ Post deleted permanently!", { theme: "dark", autoClose: 2000 });
          if (selectedPost?._id === postId) setSelectedPost(null);
        }
      } catch (error) {
        console.error("Delete Error:", error);
        toast.dismiss(toastId);
        toast.error(error.response?.data?.message || "Failed to delete", { theme: "dark" });
      }
    };

    toastId = toast.info(
      <div className="flex flex-col gap-3 p-2">
        <div className="flex items-center gap-2 text-red-400 font-bold text-xs"><Trash2 size={16} /><span>Delete this post?</span></div>
        <p className="text-[10px] text-zinc-500 pl-7">This cannot be undone.</p>
        <div className="flex justify-end gap-2 mt-1">
          <button onClick={() => toast.dismiss(toastId)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-bold transition-all">Cancel</button>
          <button onClick={confirmDelete} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-[10px] font-bold text-white shadow-lg shadow-red-600/20">Yes, Delete</button>
        </div>
      </div>,
      { position: "top-center", autoClose: false, closeOnClick: false, draggable: false, theme: "dark" }
    );
  };

  const shareToFriend = async (postId, receiverId) => {
    try {
      const response = await axios.post(`${API}/api/share/send`, { postId, receiverId }, getAuthHeaders());
      if (!response.data.success) throw new Error(response.data.message || "Failed to share post");
      toast.success("Post shared successfully!", { theme: "dark", autoClose: 1800 });
      setShowFriendShare(false);
      setSharePostId(null);
    } catch (error) {
      console.error("Share post error:", error);
      toast.error(error.response?.data?.message || "Failed to share post", { theme: "dark" });
    }
  };

  const getLoggedInUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.id || decoded._id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const loggedInUserId = getLoggedInUserId();

  const openPostModal = async (post) => {
    setSelectedPost(post);
    try {
      const res = await axios.get(`${API}/api/comment/${post._id}`, getAuthHeaders());
      setActiveComments(res.data.comments || []);
    } catch (err) {
      console.error("Error fetching comments for modal:", err);
    }
  };

  const handleAddCommentFromModal = async () => {
    if (!newCommentText.trim() || !selectedPost) return;
    try {
      await axios.post(`${API}/api/comment/add`, { postId: selectedPost._id, text: newCommentText }, getAuthHeaders());
      setNewCommentText("");
      const res = await axios.get(`${API}/api/comment/${selectedPost._id}`, getAuthHeaders());
      setActiveComments(res.data.comments || []);
      toast.success("Comment added!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add comment");
    }
  };

  const handleEditCommentFromModal = async (commentId) => {
    if (!editingText.trim() || !selectedPost) return;
    try {
      await axios.put(`${API}/api/comment/edit/${commentId}`, { text: editingText }, getAuthHeaders());
      setEditingCommentId(null);
      setEditingText("");
      const res = await axios.get(`${API}/api/comment/${selectedPost._id}`, getAuthHeaders());
      setActiveComments(res.data.comments || []);
      toast.success("Comment updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to edit comment");
    }
  };

  const handleDeleteCommentFromModal = (commentId) => {
    let toastId;
    const confirmDelete = async () => {
      try {
        await axios.delete(`${API}/api/comment/delete/${commentId}`, getAuthHeaders());
        const res = await axios.get(`${API}/api/comment/${selectedPost._id}`, getAuthHeaders());
        setActiveComments(res.data.comments || []);
        toast.dismiss(toastId);
        toast.success("Comment deleted successfully!");
      } catch (error) {
        console.error(error);
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

  const acceptRequest = async (requestId) => {
    try {
      await axios.put(`${API}/api/friend/accept`, { requestId }, getAuthHeaders());
      const res = await axios.get(`${API}/api/auth/profile`, getAuthHeaders());
      setProfile(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const uploadProfilePhoto = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("profileImage", file);
      const res = await axios.put(`${API}/api/upload/upload-profile-photo`, formData, {
        ...getAuthHeaders(),
        headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, user: { ...(prev.user || prev), profileImage: res.data.profileImage } }));
    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePhoto = async () => {
    try {
      await axios.put(`${API}/api/upload/remove-profile-photo`, {}, getAuthHeaders());
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await axios.delete(`${API}/api/friend/remove`, { ...getAuthHeaders(), data: { friendId } });
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await axios.delete(`${API}/api/friend/reject`, { ...getAuthHeaders(), data: { requestId } });
      const res = await axios.get(`${API}/api/auth/profile`, getAuthHeaders());
      setProfile(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchProfileAndFriends = async () => {
      try {
        const profileRes = await axios.get(`${API}/api/auth/profile`, getAuthHeaders());
        const friendsRes = await axios.get(`${API}/api/friend/my-friends`, getAuthHeaders());
        const friendsList = friendsRes.data?.friends || [];

        setShareFriends(friendsList);
        setProfile({ ...profileRes.data, friends: friendsList });
        setAppliedInternships(profileRes.data?.user?.appliedInternships || profileRes.data?.applications || []);

        const postsList = profileRes.data.posts || [];
        postsList.forEach(async (post) => {
          try {
            const res = await axios.get(`${API}/api/comment/${post._id}`, getAuthHeaders());
            setCommentCounts((prev) => ({ ...prev, [post._id]: res.data.comments?.length || 0 }));
          } catch (err) {
            console.error(`Error fetching comments count for post ${post._id}:`, err);
          }
        });
      } catch (error) {
        console.error("Error fetching profile or friends:", error);
      }
    };
    fetchProfileAndFriends();
  }, []);

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm tracking-wide">Loading your profile dashboard...</p>
        </div>
      </div>
    );
  }

  const user = profile.user ?? profile;
  const totalAllowed = user?.allowedApplications ?? 1;
  const usedCount = profile.applications?.length ?? 0;
  const currentPlan = user?.subscription || "Free";
  const isGold = currentPlan === "Gold" || String(currentPlan).toLowerCase() === "gold" || totalAllowed > 1000;
  const progressPercent = isGold ? 100 : Math.min((usedCount / (totalAllowed || 1)) * 100, 100);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] text-white py-8 px-3 sm:px-4 pb-20 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* ═══════════ PROFILE HEADER ═══════════ */}
        <div className="relative z-30 bg-[#121622]/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 sm:p-6 mb-6 shadow-xl flex flex-col md:flex-row items-center gap-5 sm:gap-6">
          <div className="group relative shrink-0">
            {uploading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center rounded-full bg-black/70 backdrop-blur-sm">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent sm:h-8 sm:w-8" />
              </div>
            )}
            <img
              src={user.profileImage ? user.profileImage : `https://ui-avatars.com/api/?name=${user.name || "User"}&background=ff6b00&color=fff&bold=true`}
              alt="Profile"
              className="h-20 w-20 rounded-full border-4 border-zinc-800/50 object-cover shadow-2xl transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24 md:h-28 md:w-28"
            />
            <button onClick={(e) => { e.stopPropagation(); setOpenMenu((o) => !o); }} className="absolute bottom-0 right-0 z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#121622] bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transition-all hover:scale-110 active:scale-95 sm:h-8 sm:w-8" aria-label="Change profile photo">
              <Camera size={13} />
            </button>
            {openMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(false)} />
                <div className="animate-fadeIn absolute left-1/2 top-full z-50 mt-3 w-56 max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] md:left-0 md:translate-x-0">
                  <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Profile Photo</p>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800/70">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400"><Camera size={13} /></span>
                    Upload New Photo
                    <input type="file" accept="image/*" onChange={(e) => { uploadProfilePhoto(e); setOpenMenu(false); }} className="hidden" />
                  </label>
                  <button onClick={() => { removeProfilePhoto(); setOpenMenu(false); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/15"><Trash2 size={13} /></span>Remove Photo
                  </button>
                  <div className="my-1 h-px bg-zinc-800" />
                  <button onClick={() => setOpenMenu(false)} className="w-full rounded-xl px-3 py-2 text-center text-xs font-medium text-zinc-500 transition hover:bg-zinc-800/50 hover:text-zinc-300">Cancel</button>
                </div>
              </>
            )}
          </div>
          <div className="min-w-0 flex-1 text-center md:text-left">
            <h1 className="truncate bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-xl font-black tracking-wide text-transparent sm:text-2xl">{user.name}</h1>
            <p className="mt-1 truncate text-xs font-medium text-zinc-400 sm:text-sm">{user.email}</p>
          </div>
          <div className="flex w-full shrink-0 gap-2 md:ml-auto md:w-auto">
            <label className="flex-1 cursor-pointer rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-center text-[11px] font-semibold text-zinc-200 transition-all hover:bg-zinc-700 active:scale-95 md:flex-none">
              Change Photo<input type="file" accept="image/*" onChange={uploadProfilePhoto} className="hidden" />
            </label>
            {user.profileImage && (
              <button onClick={removeProfilePhoto} className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[11px] font-semibold text-red-400 transition-all hover:bg-red-500/20 active:scale-95 md:flex-none">Remove</button>
            )}
          </div>
        </div>

        {/* ═══════════ SUBSCRIPTION ═══════════ */}
        <div className="relative z-0 mb-6 flex flex-col justify-between gap-5 overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl group sm:p-6 md:flex-row md:items-center">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl transition-all group-hover:bg-orange-500/15" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-indigo-500/5 blur-3xl" />
          <div className="relative z-10 w-full flex-1">
            <div className="mb-4 flex items-start gap-3.5 sm:items-center sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/20 to-pink-500/10 text-orange-400 shadow-md shadow-orange-500/5"><Calendar size={20} /></div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black tracking-wide text-zinc-100 sm:text-base">Subscription Status</h2>
                  <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${isGold ? "border-amber-500/20 bg-amber-500/10 text-amber-400" : currentPlan !== "Free" ? "border-purple-500/20 bg-purple-500/10 text-purple-400" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}>
                    <Sparkles size={9} /> {currentPlan} Member
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-zinc-400 sm:text-xs">
                  Expires on: <span className="font-semibold text-zinc-200">{user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</span>
                </p>
              </div>
            </div>
            <div className="w-full max-w-md rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-3.5">
              <div className="mb-1.5 flex justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1 text-zinc-400"><Zap size={11} className="text-indigo-400" /> Usage Limit</span>
                <span className="text-zinc-200">{isGold ? `${usedCount} Sent / Unlimited` : `${usedCount} / ${totalAllowed} Applications`}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
          <div className="relative z-10 flex w-full flex-col justify-end gap-3 self-stretch sm:flex-row md:w-auto md:flex-col md:self-center">
            <button onClick={() => navigate("/dashboard")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-800 px-6 py-3 text-[11px] font-bold tracking-wide text-zinc-200 transition-all hover:bg-zinc-700 active:scale-[0.98] md:w-48">
              <LayoutDashboard size={14} /> My Resume
            </button>
            {!isGold ? (
              <button onClick={() => navigate("/pricing")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-6 py-3 text-[11px] font-black tracking-wide text-white shadow-lg shadow-pink-500/20 transition-all hover:opacity-95 active:scale-[0.98] md:w-48">
                Upgrade Now <ArrowUpRight size={14} />
              </button>
            ) : (
              <div className="w-full rounded-xl border border-amber-500/10 bg-amber-500/5 px-6 py-3 text-center text-[11px] font-bold text-amber-500/80 md:w-48">⭐ Premium Active</div>
            )}
          </div>
        </div>

        {/* ═══════════ TABS ═══════════ */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { key: "posts", icon: <Layers size={14} />, label: `Posts (${profile.posts?.length || 0})` },
            { key: "internships", icon: <FileText size={14} />, label: `Applications (${profile.applications?.length || 0})` },
            { key: "history", icon: <History size={14} />, label: "History" },
            { key: "friends", icon: <Users size={14} />, label: `Friends (${profile.friends?.length || 0})` },
            { key: "friend-requests", icon: <UserPlus size={14} />, label: `Requests (${profile.friendRequests?.length || 0})` },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-[11px] font-bold transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-pink-500/20" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"}`}>
              {tab.icon}{tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ═══════════ CONTENT ═══════════ */}
        <div className="min-h-[250px] overflow-visible rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-xl sm:p-6">
          {activeTab === "posts" && (
            <div className="grid animate-fadeIn grid-cols-1 gap-4 overflow-visible sm:grid-cols-2 lg:grid-cols-3">
              {profile.posts?.length > 0 ? (
                profile.posts.map((p) => (
                  <div key={p._id} onClick={() => openPostModal(p)} className="group relative z-0 cursor-pointer overflow-visible rounded-2xl border border-zinc-800/50 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-xl">
                    <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-zinc-950">
                      {p.mediaUrl || p.image || p.imageUrl || p.postImage ? (
                        <img src={p.mediaUrl || p.image || p.imageUrl || p.postImage} alt="Post" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-900/30 text-zinc-600"><Layers size={30} strokeWidth={1} /><span className="mt-2 text-[10px] uppercase tracking-widest opacity-70">No Media</span></div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <div className="flex gap-4 text-xs font-bold text-white drop-shadow-lg"><span>❤️ {p.likes?.length || 0}</span><span>💬 {commentCounts[p._id] || 0}</span></div>
                      </div>
                    </div>
                    <div className="absolute right-3 top-3 z-40" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setShowShareMenu(showShareMenu === p._id ? null : p._id); }} className={`rounded-full border border-white/10 bg-black/50 p-2 text-white backdrop-blur-md transition-transform hover:bg-black/70 ${showShareMenu === p._id ? "rotate-90" : ""}`} title="Options">
                        <MoreVertical size={14} strokeWidth={2.5} />
                      </button>
                      {showShareMenu === p._id && (
                        <div className="absolute right-0 top-10 z-[60] max-h-[min(70vh,420px)] w-64 overflow-y-auto rounded-2xl border border-zinc-700/50 bg-zinc-950 p-3 shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" onClick={(e) => e.stopPropagation()}>
                          <PostShareMenu embedded postId={p._id} onSendToFriend={() => { setSharePostId(p._id); setShowFriendShare(true); setShowShareMenu(null); }} />
                          <div className="my-2 h-px bg-zinc-800" />
                          <button type="button" onClick={(e) => { e.stopPropagation(); setShowShareMenu(null); handleDeletePost(p._id, e); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10">
                            <Trash2 size={14} /> Delete post
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <h3 className="line-clamp-2 min-h-[40px] text-[13px] font-semibold leading-relaxed text-zinc-100">{p.caption || "No caption added..."}</h3>
                      <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3">
                        <span className="font-mono text-[10px] text-zinc-500">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        <ArrowUpRight size={14} className="text-zinc-600 transition-colors group-hover:text-orange-500" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center py-16 text-center text-zinc-500">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-800/50 bg-zinc-900/50 transition-transform duration-500 hover:rotate-3"><Camera size={32} className="text-zinc-700" /></div>
                  <h3 className="mb-2 font-bold text-zinc-300">No Posts Yet</h3>
                  <p className="max-w-[250px] text-xs leading-relaxed text-zinc-600">Start sharing your journey. Your first upload will appear here.</p>
                  <button onClick={() => navigate("/create-post")} className="mt-5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-pink-500/20 transition hover:opacity-90 active:scale-95">Create your first post</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "internships" && (
            <div className="animate-fadeIn space-y-3">
              {profile.applications?.length > 0 ? (
                profile.applications.map((app) => (
                  <div key={app._id} className="flex flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-md transition-all hover:border-purple-500/25 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400"><FileText size={16} /></div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold tracking-tight text-white">{app.internship?.title || "Internship Role"}</p>
                        <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-500">{app.internship?.companyName || "CareerSphere Partner"}</p>
                        <span className={`mt-1.5 inline-block rounded border px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider ${app.isPremium ? "border-purple-500/20 bg-purple-500/10 text-purple-400" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}>
                          {app.isPremium ? "⭐ Premium Resume" : "Standard Resume"}
                        </span>
                      </div>
                    </div>
                    <span className={`shrink-0 self-start rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider sm:self-auto ${app.status === "Accepted" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : app.status === "Rejected" ? "border-rose-500/20 bg-rose-500/10 text-rose-400" : app.status === "Shortlisted" ? "border-amber-500/20 bg-amber-500/10 text-amber-400" : "border-blue-500/20 bg-blue-500/10 text-blue-400"}`}>
                      {app.status || "Pending"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-800/50 bg-zinc-900/50"><FileText size={30} className="text-zinc-700" /></div>
                  <h3 className="mb-1.5 text-sm font-bold text-zinc-300">No Applications Yet</h3>
                  <p className="max-w-[280px] text-xs text-zinc-600">Browse internships and apply — they'll show up here.</p>
                  <button onClick={() => navigate("/internships")} className="mt-5 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-[11px] font-bold text-zinc-200 transition hover:bg-zinc-700 active:scale-95">Explore Internships</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="animate-fadeIn">
              {profile.loginHistory?.length > 0 ? (
                <>
                  <div className="hidden overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/40 lg:block">
                    <div className="grid grid-cols-6 gap-2 border-b border-zinc-800/60 bg-zinc-900/40 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <div>Browser</div><div>OS</div><div>Device</div><div>IP Address</div><div>Login Time</div><div className="text-right">Action</div>
                    </div>
                    <div className="divide-y divide-zinc-800/40">
                      {profile.loginHistory.map((log) => (
                        <div key={log._id} className="grid grid-cols-6 items-center gap-2 px-4 py-3.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-900/40">
                          <div className="flex items-center gap-2"><ShieldCheck size={13} className="shrink-0 text-emerald-500" /><span className="truncate">{log.browser || "Unknown"}</span></div>
                          <div className="truncate text-zinc-400">{log.os || "Unknown"}</div>
                          <div className="capitalize text-zinc-400">{log.device || "desktop"}</div>
                          <div className="truncate font-mono text-[10px] text-zinc-500">{log.ipAddress || "—"}</div>
                          <div className="text-[10px] text-zinc-500">{new Date(log.loginTime).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                          <div className="text-right"><button onClick={() => handleDeleteLog(log._id)} className="rounded-lg px-2 py-1 text-[10px] font-bold text-red-400 transition-all hover:bg-red-500/10" title="Delete Activity">Delete</button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 lg:hidden">
                    {profile.loginHistory.map((log) => (
                      <div key={log._id} className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"><ShieldCheck size={15} /></div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-zinc-200">{log.browser || "Unknown"}</p>
                              <p className="truncate text-[10px] text-zinc-500">{log.os || "Unknown"} · <span className="capitalize">{log.device || "desktop"}</span></p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteLog(log._id)} className="shrink-0 rounded-lg bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400 transition hover:bg-red-500/20">Delete</button>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-[10px] text-zinc-500">
                          <span className="truncate font-mono">{log.ipAddress || "—"}</span>
                          <span>{new Date(log.loginTime).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="py-12 text-center text-sm text-zinc-500">No login logs found.</p>}
            </div>
          )}

          {activeTab === "friends" && (
            <div className="grid animate-fadeIn grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.friends?.length > 0 ? (
                profile.friends.map((friend) => {
                  const friendInfo = friend.friendId?._id ? friend.friendId : friend;
                  if (!friendInfo || !friendInfo.name) return null;
                  return (
                    <div key={friend._id || friendInfo._id} onClick={() => navigate(`/users/${friendInfo._id}`)} className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/40 hover:bg-zinc-800/40 hover:shadow-lg hover:shadow-orange-500/5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={friendInfo.profileImage ? friendInfo.profileImage : `https://ui-avatars.com/api/?name=${friendInfo.name}&background=ff6b00&color=fff&bold=true`} alt={friendInfo.name} className="h-12 w-12 rounded-full border-2 border-zinc-700 object-cover transition group-hover:border-orange-500/50" />
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0b0f19] bg-emerald-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-[13px] font-bold text-zinc-200 transition-colors group-hover:text-orange-300">{friendInfo.name}</h3>
                          <p className="truncate text-[10px] text-zinc-500">{friendInfo.email}</p>
                          <p className="mt-0.5 text-[10px] font-semibold text-zinc-600 transition-colors group-hover:text-orange-400/80">View profile →</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeFriend(friendInfo._id); }} className="shrink-0 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold text-red-400 transition-all hover:bg-red-500/20 active:scale-95" title="Remove friend">Remove</button>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center py-16 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-800/50 bg-zinc-900/50"><Users size={30} className="text-zinc-700" /></div>
                  <h3 className="mb-1.5 text-sm font-bold text-zinc-300">No Friends Connected Yet 🤝</h3>
                  <p className="max-w-[260px] text-xs text-zinc-600">Start building your network today.</p>
                  <button onClick={() => navigate("/users")} className="mt-5 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-[11px] font-bold text-zinc-200 transition hover:bg-zinc-700 active:scale-95">Find People</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "friend-requests" && (
            <div className="animate-fadeIn space-y-3">
              {profile.friendRequests?.length > 0 ? (
                profile.friendRequests.map((request) => (
                  <div key={request._id} className="flex flex-col justify-between gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-800/20 p-4 transition-all hover:border-zinc-700 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={request.userId?.profileImage ? `${API}${request.userId.profileImage}` : `https://ui-avatars.com/api/?name=${request.userId?.name}&background=ff6b00&color=fff&bold=true`}
                        alt={request.userId?.name}
                        className="h-12 w-12 shrink-0 rounded-full border-2 border-orange-500/30 object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="truncate text-[13px] font-bold text-zinc-200">{request.userId?.name}</h3>
                        <p className="truncate text-[10px] text-zinc-500">{request.userId?.email}</p>
                        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-400/80">Wants to connect</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2 self-end sm:self-auto">
                      <button onClick={() => acceptRequest(request._id)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-[11px] font-bold text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-95" title="Accept Request"><Check size={14} /> Accept</button>
                      <button onClick={() => rejectRequest(request._id)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-[11px] font-bold text-red-400 transition-all hover:bg-red-500/20 active:scale-95" title="Reject Request"><X size={14} /> Reject</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-800/50 bg-zinc-900/50"><UserPlus size={30} className="text-zinc-700" /></div>
                  <h3 className="mb-1.5 text-sm font-bold text-zinc-300">No Pending Friend Requests</h3>
                  <p className="text-xs text-zinc-600">You're all caught up! 🎉</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════ POST MODAL ═══════════ */}
        {selectedPost && (
          <div className="fixed inset-0 z-[80] flex animate-fadeIn items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-4">
            <div className="absolute inset-0" onClick={() => setSelectedPost(null)} />
            <div className="relative z-10 flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl md:h-[76vh] md:flex-row">
              <button onClick={() => setSelectedPost(null)} className="absolute right-3 top-3 z-30 rounded-xl border border-zinc-800 bg-zinc-900/90 p-2 text-zinc-400 backdrop-blur-md transition hover:bg-zinc-800 hover:text-white"><X size={16} /></button>
              <div className="flex h-[38%] w-full items-center justify-center border-b border-zinc-800 bg-black md:h-full md:w-[55%] md:border-b-0 md:border-r">
                {selectedPost.mediaType === "video" ? (
                  <video src={selectedPost.mediaUrl} controls className="h-full w-full object-contain" />
                ) : (
                  <img src={selectedPost.mediaUrl || selectedPost.image || selectedPost.imageUrl} alt="" className="h-full w-full object-contain" />
                )}
              </div>
              <div className="flex h-[62%] w-full flex-col bg-zinc-900/20 md:h-full md:w-[45%]">
                <div className="flex items-center gap-3 border-b border-zinc-800 p-4">
                  <img src={`https://ui-avatars.com/api/?name=${selectedPost.userId?.name || user?.name || "Developer"}&background=ff6b00&color=fff&bold=true`} alt="" className="h-9 w-9 rounded-full border border-zinc-700 object-cover" />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-[13px] font-bold text-zinc-200">{selectedPost?.userId?.name || user?.name || "Developer Ecosystem"}</h4>
                    <p className="truncate text-[10px] font-medium text-zinc-500">@{selectedPost?.userId?.username || selectedPost?.userId?.email?.split("@")[0] || selectedPost?.userId?.name?.toLowerCase().replace(/\s+/g, "") || "developer"}</p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <PostShareMenu postId={selectedPost._id} placement="bottom" onSendToFriend={() => { setSharePostId(selectedPost._id); setShowFriendShare(true); }} />
                  </div>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-3 border-b border-zinc-800/50 pb-4 text-xs">
                    <span className="shrink-0 font-bold text-zinc-200">{selectedPost.userId?.name || user?.name}</span>
                    <p className="leading-relaxed text-zinc-400">{selectedPost.caption}</p>
                  </div>
                  <div className="space-y-2.5">
                    {activeComments.length > 0 ? (
                      activeComments.map((comment) => {
                        const isMyComment = comment.userId?._id === loggedInUserId || comment.userId === loggedInUserId;
                        return (
                          <div key={comment._id} className="group/comment flex items-start justify-between rounded-xl border border-zinc-800/40 bg-zinc-900/50 p-3 text-xs transition-all">
                            <div className="mr-2 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] font-extrabold text-zinc-300">{comment.userId?.name || "Anonymous"}</span>
                                {(comment.userId?._id === selectedPost.userId || comment.userId === selectedPost.userId) && (
                                  <span className="rounded border border-orange-500/20 bg-orange-500/10 px-1 text-[8px] font-black uppercase tracking-wider text-orange-400">Author</span>
                                )}
                              </div>
                              {editingCommentId === comment._id ? (
                                <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} autoFocus className="mt-1.5 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-orange-500" />
                              ) : (
                                <p className="mt-0.5 break-words text-[11px] font-medium text-zinc-400">{comment.text}</p>
                              )}
                            </div>
                            {isMyComment && (
                              <div className="ml-1 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/comment:opacity-100">
                                {editingCommentId === comment._id ? (
                                  <>
                                    <button onClick={() => handleEditCommentFromModal(comment._id)} className="rounded p-1.5 text-emerald-500 hover:bg-emerald-500/10" title="Save Changes"><Check size={13} /></button>
                                    <button onClick={() => { setEditingCommentId(null); setEditingText(""); }} className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800" title="Cancel"><X size={13} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => { setEditingCommentId(comment._id); setEditingText(comment.text); }} className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-orange-400" title="Edit Comment"><Edit2 size={12} /></button>
                                    <button onClick={() => handleDeleteCommentFromModal(comment._id)} className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-500" title="Delete Comment"><Trash2 size={12} /></button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : <p className="py-8 text-center text-xs text-zinc-600">No comments yet.</p>}
                  </div>
                </div>
                <div className="flex gap-2 border-t border-zinc-800 bg-zinc-950/60 p-3.5">
                  <input type="text" placeholder="Add a comment..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCommentFromModal()} className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs text-zinc-200 outline-none transition-colors focus:border-orange-500/50" />
                  <button onClick={handleAddCommentFromModal} disabled={!newCommentText.trim()} className="rounded-xl bg-orange-500 px-4 text-xs font-bold text-white transition-colors hover:bg-orange-600 active:scale-95 disabled:opacity-40">Post</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showFriendShare && sharePostId && (
          <FriendShareModal
            postId={sharePostId}
            friends={shareFriends}
            onClose={() => { setShowFriendShare(false); setSharePostId(null); }}
            onShare={shareToFriend}
          />
        )}
      </div>
    </div>
  );
}

export default Profile;