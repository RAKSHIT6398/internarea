// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Swal from "sweetalert2"; 
// import PremiumProfileModal from "./PremiumProfileModal";
// import PostInternship from "./PostInternship";

// const AdminDashboard = () => {
//   // States for dynamic data
//   const [analytics, setAnalytics] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [applications, setApplications] = useState([]);
//   const [internships, setInternships] = useState([]);
  
//   // UI Control States
//   const [activeTab, setActiveTab] = useState("overview"); // overview, users, applications, internships
//   const [loading, setLoading] = useState(true);

//   const token = localStorage.getItem("token");
//   const [selectedPremiumProfile, setSelectedPremiumProfile] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Fetch Dashboard Meta Data
//  const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [analyticsRes, usersRes, appsRes, internshipsRes] = await Promise.all([
//         axios.get("http://localhost:5000/api/auth/admin/analytics", { headers: { Authorization: `Bearer ${token}` } }),
//         axios.get("http://localhost:5000/api/auth/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
//         axios.get("http://localhost:5000/api/auth/admin/applications", { headers: { Authorization: `Bearer ${token}` } }),
//         axios.get("http://localhost:5000/api/internships/admin/all", { headers: { Authorization: `Bearer ${token}` } })
//       ]);

//       if (analyticsRes.data.success) setAnalytics(analyticsRes.data.summary);
//       if (usersRes.data.success) setUsers(usersRes.data.users);
//       if (Array.isArray(appsRes.data)) setApplications(appsRes.data);
//       else if (appsRes.data.success) setApplications(appsRes.data.applications);
//       if (internshipsRes.data.internships) setInternships(internshipsRes.data.internships);
//     } catch (err) {
//       console.error("Dashboard data fetching failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);
//   // Standalone internship fetch to refresh just the internships stream after operations
//   const fetchInternships = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/internships");
//       setInternships(res.data.internships);
//     } catch (err) { 
//       console.error("Failed to sync internships:", err); 
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Handle User Deletion
//   const handleDeleteUser = async (userId, userName) => {
//   Swal.fire({
//     title: "Are you sure?",
//     text: `You won't be able to revert the profile deletion for ${userName || "this user"}!`,
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#a855f7", // Premium Purple color (Jaise image_d92b5b.png mein hai)
//     cancelButtonColor: "#334155",  // Slate gray cancel button
//     confirmButtonText: "Yes, delete it!",
//     cancelButtonText: "Cancel",
//     background: "#0f172a",         // Tailwind slate-900 background jo aapke card dashboard se match karega
//     color: "#ffffff"               // Text color white
//   }).then(async (result) => {
//     // Jab user "Yes, delete it!" par click karega, tabhi niche ka block chalega
//     if (result.isConfirmed) {
//       try {
//         const res = await axios.delete(`http://localhost:5000/api/auth/admin/user/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (res.data.success) {
//           Swal.fire({
//             title: "Deleted!",
//             text: "User profile has been successfully deleted.",
//             icon: "success",
//             confirmButtonColor: "#a855f7",
//             background: "#0f172a",
//             color: "#ffffff"
//           });
          
//           fetchData(); // UI ko automatic refresh karne ke liye data dubara fetch hoga
//         }
//       } catch (err) {
//         Swal.fire({
//           title: "Failed!",
//           text: err.response?.data?.message || "Failed to delete user",
//           icon: "error",
//           confirmButtonColor: "#a855f7",
//           background: "#0f172a",
//           color: "#ffffff"
//         });
//       }
//     }
//   });
// };
// //delete internship user 
// const handleApplicationDelete = async (applicationId, applicantName) => {
//   Swal.fire({
//     title: "Remove Application?",
//     text: `Are you sure you want to permanently delete ${applicantName}'s application from the system pipeline?`,
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#f43f5e", // Rose/Red color highlight for danger action
//     cancelButtonColor: "#334155",
//     confirmButtonText: "Yes, remove it!",
//     cancelButtonText: "Cancel",
//     background: "#0b1329",         // Aapke table card ka exact background match hex code
//     color: "#ffffff"
//   }).then(async (result) => {
//     if (result.isConfirmed) {
//       try {
//         const token = localStorage.getItem("token");
        
//         // 🚨 Note: Apne backend route ke mutabik is URL ko verify kar lena
//         const res = await axios.delete(`http://localhost:5000/api/application/${applicationId}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (res.status === 200 || res.data.success) {
//           Swal.fire({
//             title: "Removed!",
//             text: "The application has been cleared from the database.",
//             icon: "success",
//             confirmButtonColor: "#a855f7",
//             background: "#0b1329",
//             color: "#ffffff"
//           });
          
//           // Data ko re-fetch karne ke liye aapka state trigger (e.g., fetchApplications)
//           if (typeof fetchApplications === "function") fetchApplications();
//           else if (typeof fetchData === "function") fetchData();
//           else window.location.reload();
//         }
//       } catch (err) {
//         Swal.fire({
//           title: "Failed!",
//           text: err.response?.data?.message || "Could not delete the application request.",
//           icon: "error",
//           confirmButtonColor: "#a855f7",
//           background: "#0b1329",
//           color: "#ffffff"
//         });
//       }
//     }
//   });
// };
//   // Handle Internship Deletion via SweetAlert2
//  const handleInternshipDelete = async (internshipId, internshipTitle) => {
//   Swal.fire({
//     title: "Are you sure?",
//     text: `You won't be able to revert this internship posting for "${internshipTitle}"!`,
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#a855f7", // Premium Purple color (Jaise image_d92b5b.png mein hai)
//     cancelButtonColor: "#334155",  // Slate gray cancel button
//     confirmButtonText: "Yes, delete it!",
//     cancelButtonText: "Cancel",
//     background: "#0f172a",         // Slate-900 Dark background theme match ke liye
//     color: "#ffffff"               // Text color white
//   }).then(async (result) => {
//     // Jab user "Yes, delete it!" par click karega, tabhi delete process chalega
//     if (result.isConfirmed) {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await axios.delete(`http://localhost:5000/api/internships/${internshipId}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         // Aapki API response ke hisab se condition check (res.data.success ya status)
//         if (res.status === 200 || res.data.success) {
//           Swal.fire({
//             title: "Deleted!",
//             text: "The internship posting has been successfully deleted.",
//             icon: "success",
//             confirmButtonColor: "#a855f7",
//             background: "#0f172a",
//             color: "#ffffff"
//           });
          
//           // UI refresh karne ke liye aapka state refresh function (jaise fetchInternships ya fetchData)
//           if (typeof fetchInternships === "function") fetchInternships();
//           else if (typeof fetchData === "function") fetchData();
//           else window.location.reload(); // Fallback reload
//         }
//       } catch (err) {
//         Swal.fire({
//           title: "Failed!",
//           text: err.response?.data?.message || "Something went wrong while deleting the internship.",
//           icon: "error",
//           confirmButtonColor: "#a855f7",
//           background: "#0f172a",
//           color: "#ffffff"
//         });
//       }
//     }
//   });
// };

 
//  //handle user application
//  const handleStatusUpdate = async (applicationId, newStatus) => {
//   try {
//     // 1. Token nikalna (Kyunki request bhejne ke liye zaroori hai)
//     const token = localStorage.getItem("token");
    
//     // 2. Backend API hit karna (Exact vahi route jo app.js se matched hai)
//     const res = await axios.put(
//       `http://localhost:5000/api/application/status/${applicationId}`, 
//       { status: newStatus },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     // 3. Agar backend par status successfully change ho gaya
//     if (res.data.success) {
      
//       // ✨ Premium Dark-Themed Success Notification popup dikhao
//       Swal.fire({
//         title: "Status Updated!",
//         text: `Application has been marked as ${newStatus}.`,
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false,
//         background: "#0b1329", // Aapke dashboard ka dark background color
//         color: "#ffffff"
//       });

//       // 🔥 INSTANT REFLECTION FIX: 
//       // UI par state ko turant update karo bina page refresh kiye
//       setApplications((prevApps) => 
//         prevApps.map((app) => 
//           app._id === applicationId ? { ...app, status: newStatus } : app
//         )
//       );

//       // Agar aapke component mein data refresh karne ka function pehle se bana hai,
//       // toh safety ke liye use bhi trigger kar dete hain background sync ke liye:
//       if (typeof fetchData === "function") fetchData();
//     }
//   } catch (err) {
//     // ❌ Agar API fail ho jaye toh error popup dikhao
//     Swal.fire({
//       title: "Error",
//       text: err.response?.data?.message || "Failed to update status",
//       icon: "error",
//       background: "#0b1329",
//       color: "#ffffff"
//     });
//   }
// };

//   // Helper trigger to preview high value applicant profiles inside your Modal hook
//   const openPremiumView = (resumeData) => {
//     setSelectedPremiumProfile(resumeData);
//     setIsModalOpen(true);
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col justify-center items-center h-screen bg-[#060b13]">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//         <span className="ml-3 mt-4 text-gray-400 font-medium tracking-wide">Syncing Core Analytics...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 bg-[#060b13] text-gray-100 min-h-screen font-sans">
      
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800/60 pb-6">
//         <div>
//           <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Control Management Center</span>
//           <h1 className="text-3xl font-extrabold mt-1 tracking-tight text-white">
//             CAREER<span className="text-purple-500">SPHERE</span> Console
//           </h1>
//         </div>
//         <div className="mt-4 md:mt-0 bg-[#0f172a] px-4 py-2 rounded-xl border border-gray-800 text-xs font-mono text-gray-400">
//           Status: <span className="text-emerald-400 animate-pulse">● Live Engine Connected</span>
//         </div>
//       </div>
      
//       {/* Dynamic Nav Tabs Bar */}
//       <div className="flex flex-wrap border-b border-gray-800 mb-8 gap-2 md:space-x-4">
//         {[
//           { id: "overview", label: "Overview Insights", count: null },
//           { id: "users", label: "Registered Profiles", count: users.length },
//           { id: "applications", label: "Submissions Pipeline", count: applications.length },
//           { id: "internships", label: "Manage Internships", count: internships.length },
//         ].map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`pb-3 px-4 font-semibold text-sm capitalize border-b-2 transition-all duration-200 ${
//               activeTab === tab.id
//                 ? "border-purple-500 text-white shadow-[0_4px_12px_rgba(168,85,247,0.15)]"
//                 : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
//             }`}
//           >
//             {tab.label} {tab.count !== null && `(${tab.count})`}
//           </button>
//         ))}
//       </div>

//      {/* 📊 TAB 1: OVERVIEW METRICS */}
// {activeTab === "overview" && (
//   <div className="animate-fadeIn">
//     {/* Core Stats Grid */}
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//       {/* Card 1 */}
//       <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
//         <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
//         <div>
//           <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Database State</span>
//           <h3 className="text-sm font-medium text-gray-400 mt-1">Total Active Applications</h3>
//         </div>
//         <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-blue-400 mt-6">
//           {analytics ? analytics.totalApplications : 0}
//         </p>
//       </div>

//       {/* Card 2 */}
//       <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
//         <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
//         <div>
//           <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Feed Stream</span>
//           <h3 className="text-sm font-medium text-gray-400 mt-1">Active Pipeline Jobs</h3>
//         </div>
//         <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-pink-400 mt-6">
//           {analytics ? analytics.activeJobs : 0}
//         </p>
//       </div>

//       {/* Card 3 */}
//       <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
//         <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-all"></div>
//         <div>
//           <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">System Check</span>
//           <h3 className="text-sm font-medium text-gray-400 mt-1">Active Internships Metrics</h3>
//         </div>
//         <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-purple-400 mt-6">
//           {analytics ? analytics.activeInternships : 0}
//         </p>
//       </div>
//     </div>

//     {/* Financial Analytics Section */}
//     <div className="mt-8">
//       <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//         💰 Revenue & Transactions
//       </h2>
      
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         {/* Total Revenue Card */}
//         <div className="bg-[#0b1329] p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
//           <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Total Revenue</p>
//           <p className="text-3xl font-black text-white mt-2">₹{analytics?.totalRevenue?.toLocaleString() || 0}</p>
//         </div>

//         {/* Transaction Counts */}
//         <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl">
//           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Transactions</p>
//           <p className="text-3xl font-black text-white mt-2">{analytics?.totalPayments || 0}</p>
//         </div>

//         {/* Product Breakdown */}
//         <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl">
//           <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Subscriptions</p>
//           <p className="text-xl font-bold text-white mt-2">{analytics?.subscriptionPayments || 0}</p>
//         </div>

//         <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl">
//           <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Resume Services</p>
//           <p className="text-xl font-bold text-white mt-2">{analytics?.premiumResumePayments || 0}</p>
//         </div>
//       </div>

//       {/* Plan Wise Sales Progress Bars */}
//       <div className="mt-6 bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl">
//         <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Plan Performance</h3>
//         <div className="space-y-4">
//           {[
//             { label: 'Bronze', count: analytics?.bronzeSales || 0, color: 'bg-amber-700' },
//             { label: 'Silver', count: analytics?.silverSales || 0, color: 'bg-slate-400' },
//             { label: 'Gold', count: analytics?.goldSales || 0, color: 'bg-yellow-500' }
//           ].map((plan) => (
//             <div key={plan.label}>
//               <div className="flex justify-between text-xs mb-1">
//                 <span>{plan.label} Plan</span>
//                 <span>{plan.count} Sales</span>
//               </div>
//               <div className="w-full bg-gray-800 rounded-full h-2">
//                 <div 
//                   className={`${plan.color} h-2 rounded-full`} 
//                  style={{ width: `${Math.min((plan.count / Math.max(analytics?.totalPayments || 1, 1)) * 100, 100)}%` }}
//                 ></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   </div>
// )}
     
//       {/* 👥 TAB 2: USER PROFILE CONTROL MATRIX */}
//       {activeTab === "users" && (
//         <div className="bg-[#0b1329] rounded-2xl shadow-xl border border-gray-800/80 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-800 text-left">
//               <thead className="bg-[#0f1935]">
//                 <tr>
//                   <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Profile Candidate</th>
//                   <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">System Role</th>
//                   <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Enrolled On</th>
//                   <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider text-right uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-800/60 bg-transparent">
//                 {users.map((u) => (
//                   <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="font-bold text-white">{u.name}</div>
//                       <div className="text-sm text-gray-400 mt-0.5">{u.email}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-3 py-1 text-[11px] font-bold tracking-wide rounded-full ${
//                         u.role === "admin" 
//                           ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
//                           : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
//                       }`}>
//                         {u.role}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
//                       {new Date(u.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
//                       {u.role !== "admin" ? (
//                         <button
//                           onClick={() => handleDeleteUser(u._id, u.name)}
//                           className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
//                         >
//                           Revoke & Delete
//                         </button>
//                       ) : (
//                         <span className="text-xs text-gray-500 italic font-mono bg-gray-800/40 px-2.5 py-1 rounded-md">Root Secure</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* 📩 TAB 3: APPLICANTS DATA */}
//       {activeTab === "applications" && (
//         <div className="bg-[#0b1329] rounded-2xl shadow-xl border border-gray-800/80 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-800 text-left">
//               <thead className="bg-[#0f1935]">
//                 <tr>
//                   <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Applicant Details</th>
//                   <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Target Post</th>
//                   <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Resume Profile</th>
//                   <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Current Status</th>
//                   <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider text-right uppercase">Evaluation Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-800/60 bg-transparent">
//                 {applications.length > 0 ? (
                  
//                   applications.map((app) => (
               
//                     <tr key={app._id} className="hover:bg-white/[0.02] transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center space-x-3">
//                           <img
//                             className="h-10 w-10 rounded-full object-cover border border-gray-800 shadow-inner"
//                             src={
//                               app.user?.profileImage
//                                 ? app.user.profileImage.startsWith("http")
//                                   ? app.user.profileImage
//                                   : `http://localhost:5000${app.user.profileImage}`
//                                 : `https://ui-avatars.com/api/?name=${app.user?.name || "User"}&background=a855f7&color=fff`
//                             }
//                             alt={app.user?.name}
//                             onError={(e) => { 
//                               e.target.src = `https://ui-avatars.com/api/?name=${app.user?.name || "User"}&background=a855f7&color=fff`; 
//                             }}
//                           />
                          
//                           <div>
//                             <div className="font-bold text-white">{app.user?.name || "Anonymous"}</div>
//                             <div className="text-xs text-gray-400 mt-0.5">{app.user?.email || "No email"}</div>
//                           </div>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-white font-semibold">{app.internship?.title || "Archived Job"}</div>
//                     <div className="text-xs text-purple-400 mt-0.5">
//   🏢 {app.internship?.companyName || app.internship?.company || "NA"}
// </div>
//                         <div className="text-[11px] text-gray-500 mt-0.5">
//     Stipend: ₹{app.internship?.stipend || "N/A"}
//   </div>
//                       </td>

//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//   {app.isPremium ? (
//     app.resume ? (
//       <button 
//         onClick={() => {
//           // ✅ Open AdminResumeView page in new tab using application ID
//           window.open(`/admin/resume-view/${app._id}`, "_blank");
//         }}
//         className="text-purple-400 font-bold hover:text-purple-300 transition-colors flex items-center gap-1 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20"
//       >
//         ⭐ View Premium Profile
//       </button>
//     ) : (
//       <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-xs font-mono">
//         ⚠️ Premium Missing
//       </span>
//     )
//   ) : (
//     (() => {
//       const rawPath = app.pdfPath || app.resumePath || app.file;
//       if (rawPath) {
//         const fullUrl = rawPath.startsWith("http") 
//           ? rawPath 
//           : `http://localhost:5000/${rawPath.replace(/\\/g, "/")}`;
//         return (
//           <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-medium hover:text-blue-300 transition-colors flex items-center gap-1">
//             📄 View Uploaded PDF
//           </a>
//         );
//       } else {
//         return <span className="text-gray-500 italic font-mono">🚫 No PDF Attached</span>;
//       }
//     })()
//   )}
// </td>

//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
//                           app.status === "Accepted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
//                           app.status === "Rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
//                           app.status === "Shortlisted" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
//                           "bg-gray-500/10 text-gray-400 border border-gray-500/20"
//                         }`}>
//                           {app.status || "Pending"}
//                         </span>
//                       </td>
// <td className="px-6 py-4 whitespace-nowrap text-xs text-right space-x-2">
//   {/* 🟡 SHORTLIST BUTTON */}
//   <button
//     disabled={app.status === "Accepted" || app.status === "Rejected"}
//     onClick={() => handleStatusUpdate(app._id, "Shortlisted")}
//     className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${
//       app.status === "Shortlisted"
//         ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20"
//         : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-black disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
//     }`}
//   >
//     {app.status === "Shortlisted" ? "✓ Shortlisted" : "Shortlist"}
//   </button>

//   {/* 🟢 ACCEPT BUTTON */}
//   <button
//     disabled={app.status === "Accepted" || app.status === "Rejected"}
//     onClick={() => handleStatusUpdate(app._id, "Accepted")}
//     className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${
//       app.status === "Accepted"
//         ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
//         : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
//     }`}
//   >
//     {app.status === "Accepted" ? "✓ Accepted" : "Accept"}
//   </button>

//   {/* 🔴 REJECT BUTTON */}
//   <button
//     disabled={app.status === "Accepted" || app.status === "Rejected"}
//     onClick={() => handleStatusUpdate(app._id, "Rejected")}
//     className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${
//       app.status === "Rejected"
//         ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20"
//         : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
//     }`}
//   >
//     {app.status === "Rejected" ? "✕ Rejected" : "Reject"}
//   </button>

//   {/* 🗑️ DELETE BUTTON */}
//   <button
//     onClick={() => handleApplicationDelete(app._id, app.user?.name || "this candidate")}
//     className="bg-slate-800 text-slate-400 border border-slate-700/80 hover:bg-rose-600 hover:text-white hover:border-rose-600 p-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center align-middle"
//     title="Delete Application"
//   >
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
//       <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
//     </svg>
//   </button>
// </td>
                   
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="5" className="text-center py-12 text-gray-500 text-sm font-medium tracking-wide">
//                       No recruitment requests submitted in the database pipeline yet.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* 💼 TAB 4: INTERNSHIPS MANAGE SECTION */}
//       {activeTab === "internships" && (
//         <div className="space-y-8 animate-fadeIn">
//           {/* Post New Internship Form Container Wrapper */}
//           <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl">
//             <PostInternship onPostSuccess={fetchInternships} />
//           </div>
          
//           {/* Active Postings Datatable */}
//           <div className="bg-[#0b1329] p-6 rounded-2xl shadow-xl border border-gray-800/80">
//             <h3 className="text-lg font-bold mb-4 text-white tracking-tight">Manage Active Internships</h3>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left divide-y divide-gray-800">
//                 <thead className="bg-[#0f1935]">
//                   <tr>
//                     <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
//                     <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Company</th>
//                     <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-800/60 bg-transparent">
//                   {internships.length > 0 ? (
//                     internships.map((job) => (
//                       <tr key={job._id} className="hover:bg-white/[0.01] transition-colors">
//                         <td className="p-4 font-bold text-white text-sm">{job.title}</td>
//                         <td className="p-4 text-sm text-gray-400">{job.companyName || job.company}</td>
//                         <td className="p-4 text-right">
//                       <button 
//   onClick={() => handleInternshipDelete(job._id, job.title || "this internship")} 
//   className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
// >
//   Delete
// </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="3" className="text-center py-8 text-gray-500 text-sm font-mono">
//                         No active internships tracked. Post one above!
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🌟 PREMIUM CANDIDATE PROFILE MODAL INSTANCE */}
//       <PremiumProfileModal 
//         isOpen={isModalOpen}
//         onClose={() => { setIsModalOpen(false); setSelectedPremiumProfile(null); }}
//         profile={selectedPremiumProfile}
//       />
//     </div>
//   );
// };

// export default AdminDashboard;



import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PremiumProfileModal from "./PremiumProfileModal";
import PostInternship from "./PostInternship";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const resolveUrl = (url) => {
  if (!url) return "";
  const clean = String(url).replace(/\\/g, "/");
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  return `${API}${clean.startsWith("/") ? clean : `/${clean}`}`;
};

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [selectedPremiumProfile, setSelectedPremiumProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const [analyticsRes, usersRes, appsRes, internshipsRes] = await Promise.all([
        axios.get(`${API}/api/auth/admin/analytics`, headers),
        axios.get(`${API}/api/auth/admin/users`, headers),
        axios.get(`${API}/api/auth/admin/applications`, headers),
        axios.get(`${API}/api/internships/admin/all`, headers)
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.summary);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (Array.isArray(appsRes.data)) setApplications(appsRes.data);
      else if (appsRes.data.success) setApplications(appsRes.data.applications);
      if (internshipsRes.data.internships) setInternships(internshipsRes.data.internships);
    } catch (err) {
      console.error("Dashboard data fetching failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInternships = async () => {
    try {
      const res = await axios.get(`${API}/api/internships`);
      setInternships(res.data.internships);
    } catch (err) {
      console.error("Failed to sync internships:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (userId, userName) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert the profile deletion for ${userName || "this user"}!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#a855f7",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#0f172a",
      color: "#ffffff"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`${API}/api/auth/admin/user/${userId}`, getAuthHeaders());
          if (res.data.success) {
            Swal.fire({ title: "Deleted!", text: "User profile has been successfully deleted.", icon: "success", confirmButtonColor: "#a855f7", background: "#0f172a", color: "#ffffff" });
            fetchData();
          }
        } catch (err) {
          Swal.fire({ title: "Failed!", text: err.response?.data?.message || "Failed to delete user", icon: "error", confirmButtonColor: "#a855f7", background: "#0f172a", color: "#ffffff" });
        }
      }
    });
  };

  const handleApplicationDelete = async (applicationId, applicantName) => {
    Swal.fire({
      title: "Remove Application?",
      text: `Are you sure you want to permanently delete ${applicantName}'s application from the system pipeline?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
      background: "#0b1329",
      color: "#ffffff"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`${API}/api/application/${applicationId}`, getAuthHeaders());
          if (res.status === 200 || res.data.success) {
            Swal.fire({ title: "Removed!", text: "The application has been cleared from the database.", icon: "success", confirmButtonColor: "#a855f7", background: "#0b1329", color: "#ffffff" });
            if (typeof fetchData === "function") fetchData();
            else window.location.reload();
          }
        } catch (err) {
          Swal.fire({ title: "Failed!", text: err.response?.data?.message || "Could not delete the application request.", icon: "error", confirmButtonColor: "#a855f7", background: "#0b1329", color: "#ffffff" });
        }
      }
    });
  };

  const handleInternshipDelete = async (internshipId, internshipTitle) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this internship posting for "${internshipTitle}"!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#a855f7",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#0f172a",
      color: "#ffffff"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`${API}/api/internships/${internshipId}`, getAuthHeaders());
          if (res.status === 200 || res.data.success) {
            Swal.fire({ title: "Deleted!", text: "The internship posting has been successfully deleted.", icon: "success", confirmButtonColor: "#a855f7", background: "#0f172a", color: "#ffffff" });
            if (typeof fetchInternships === "function") fetchInternships();
            else if (typeof fetchData === "function") fetchData();
            else window.location.reload();
          }
        } catch (err) {
          Swal.fire({ title: "Failed!", text: err.response?.data?.message || "Something went wrong while deleting the internship.", icon: "error", confirmButtonColor: "#a855f7", background: "#0f172a", color: "#ffffff" });
        }
      }
    });
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const res = await axios.put(`${API}/api/application/status/${applicationId}`, { status: newStatus }, getAuthHeaders());
      if (res.data.success) {
        Swal.fire({ title: "Status Updated!", text: `Application has been marked as ${newStatus}.`, icon: "success", timer: 1500, showConfirmButton: false, background: "#0b1329", color: "#ffffff" });
        setApplications((prevApps) => prevApps.map((app) => app._id === applicationId ? { ...app, status: newStatus } : app));
        if (typeof fetchData === "function") fetchData();
      }
    } catch (err) {
      Swal.fire({ title: "Error", text: err.response?.data?.message || "Failed to update status", icon: "error", background: "#0b1329", color: "#ffffff" });
    }
  };

  const openPremiumView = (resumeData) => {
    setSelectedPremiumProfile(resumeData);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#060b13]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3 mt-4 text-gray-400 font-medium tracking-wide">Syncing Core Analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#060b13] text-gray-100 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800/60 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Control Management Center</span>
          <h1 className="text-3xl font-extrabold mt-1 tracking-tight text-white">CAREER<span className="text-purple-500">SPHERE</span> Console</h1>
        </div>
        <div className="mt-4 md:mt-0 bg-[#0f172a] px-4 py-2 rounded-xl border border-gray-800 text-xs font-mono text-gray-400">
          Status: <span className="text-emerald-400 animate-pulse">● Live Engine Connected</span>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-gray-800 mb-8 gap-2 md:space-x-4">
        {[
          { id: "overview", label: "Overview Insights", count: null },
          { id: "users", label: "Registered Profiles", count: users.length },
          { id: "applications", label: "Submissions Pipeline", count: applications.length },
          { id: "internships", label: "Manage Internships", count: internships.length },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 px-4 font-semibold text-sm capitalize border-b-2 transition-all duration-200 ${activeTab === tab.id ? "border-purple-500 text-white shadow-[0_4px_12px_rgba(168,85,247,0.15)]" : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"}`}>
            {tab.label} {tab.count !== null && `(${tab.count})`}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
              <div><span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Database State</span><h3 className="text-sm font-medium text-gray-400 mt-1">Total Active Applications</h3></div>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-blue-400 mt-6">{analytics ? analytics.totalApplications : 0}</p>
            </div>
            <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
              <div><span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Feed Stream</span><h3 className="text-sm font-medium text-gray-400 mt-1">Active Pipeline Jobs</h3></div>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-pink-400 mt-6">{analytics ? analytics.activeJobs : 0}</p>
            </div>
            <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-all"></div>
              <div><span className="text-xs font-bold text-pink-400 uppercase tracking-wider">System Check</span><h3 className="text-sm font-medium text-gray-400 mt-1">Active Internships Metrics</h3></div>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-purple-400 mt-6">{analytics ? analytics.activeInternships : 0}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">💰 Revenue & Transactions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#0b1329] p-6 rounded-2xl border border-emerald-500/20 shadow-xl"><p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Total Revenue</p><p className="text-3xl font-black text-white mt-2">₹{analytics?.totalRevenue?.toLocaleString() || 0}</p></div>
              <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Transactions</p><p className="text-3xl font-black text-white mt-2">{analytics?.totalPayments || 0}</p></div>
              <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl"><p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Subscriptions</p><p className="text-xl font-bold text-white mt-2">{analytics?.subscriptionPayments || 0}</p></div>
              <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl"><p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Resume Services</p><p className="text-xl font-bold text-white mt-2">{analytics?.premiumResumePayments || 0}</p></div>
            </div>

            <div className="mt-6 bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl">
              <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Plan Performance</h3>
              <div className="space-y-4">
                {[
                  { label: 'Bronze', count: analytics?.bronzeSales || 0, color: 'bg-amber-700' },
                  { label: 'Silver', count: analytics?.silverSales || 0, color: 'bg-slate-400' },
                  { label: 'Gold', count: analytics?.goldSales || 0, color: 'bg-yellow-500' }
                ].map((plan) => (
                  <div key={plan.label}>
                    <div className="flex justify-between text-xs mb-1"><span>{plan.label} Plan</span><span>{plan.count} Sales</span></div>
                    <div className="w-full bg-gray-800 rounded-full h-2"><div className={`${plan.color} h-2 rounded-full`} style={{ width: `${Math.min((plan.count / Math.max(analytics?.totalPayments || 1, 1)) * 100, 100)}%` }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-[#0b1329] rounded-2xl shadow-xl border border-gray-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-left">
              <thead className="bg-[#0f1935]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Profile Candidate</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">System Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Enrolled On</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider text-right uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 bg-transparent">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-white">{u.name}</div><div className="text-sm text-gray-400 mt-0.5">{u.email}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 text-[11px] font-bold tracking-wide rounded-full ${u.role === "admin" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>{u.role}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {u.role !== "admin" ? (
                        <button onClick={() => handleDeleteUser(u._id, u.name)} className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">Revoke & Delete</button>
                      ) : (
                        <span className="text-xs text-gray-500 italic font-mono bg-gray-800/40 px-2.5 py-1 rounded-md">Root Secure</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "applications" && (
        <div className="bg-[#0b1329] rounded-2xl shadow-xl border border-gray-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-left">
              <thead className="bg-[#0f1935]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Applicant Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Target Post</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Resume Profile</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Current Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider text-right uppercase">Evaluation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 bg-transparent">
                {applications.length > 0 ? applications.map((app) => (
                  <tr key={app._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          className="h-10 w-10 rounded-full object-cover border border-gray-800 shadow-inner"
                          src={resolveUrl(app.user?.profileImage) || `https://ui-avatars.com/api/?name=${app.user?.name || "User"}&background=a855f7&color=fff`}
                          alt={app.user?.name}
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${app.user?.name || "User"}&background=a855f7&color=fff`; }}
                        />
                        <div><div className="font-bold text-white">{app.user?.name || "Anonymous"}</div><div className="text-xs text-gray-400 mt-0.5">{app.user?.email || "No email"}</div></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-semibold">{app.internship?.title || "Archived Job"}</div>
                      <div className="text-xs text-purple-400 mt-0.5">🏢 {app.internship?.companyName || app.internship?.company || "NA"}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">Stipend: ₹{app.internship?.stipend || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {app.isPremium ? (
                        app.resume ? (
                          <button onClick={() => window.open(`/admin/resume-view/${app._id}`, "_blank")} className="text-purple-400 font-bold hover:text-purple-300 transition-colors flex items-center gap-1 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">⭐ View Premium Profile</button>
                        ) : (
                          <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-xs font-mono">⚠️ Premium Missing</span>
                        )
                      ) : (
                        (() => {
                          const rawPath = app.pdfPath || app.resumePath || app.file;
                          if (rawPath) {
                            return <a href={resolveUrl(rawPath)} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-medium hover:text-blue-300 transition-colors flex items-center gap-1">📄 View Uploaded PDF</a>;
                          }
                          return <span className="text-gray-500 italic font-mono">🚫 No PDF Attached</span>;
                        })()
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${app.status === "Accepted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : app.status === "Rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" : app.status === "Shortlisted" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-gray-500/10 text-gray-400 border border-gray-500/20"}`}>{app.status || "Pending"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-right space-x-2">
                      <button disabled={app.status === "Accepted" || app.status === "Rejected"} onClick={() => handleStatusUpdate(app._id, "Shortlisted")} className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${app.status === "Shortlisted" ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-black disabled:opacity-30 disabled:pointer-events-none cursor-pointer"}`}>{app.status === "Shortlisted" ? "✓ Shortlisted" : "Shortlist"}</button>
                      <button disabled={app.status === "Accepted" || app.status === "Rejected"} onClick={() => handleStatusUpdate(app._id, "Accepted")} className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${app.status === "Accepted" ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"}`}>{app.status === "Accepted" ? "✓ Accepted" : "Accept"}</button>
                      <button disabled={app.status === "Accepted" || app.status === "Rejected"} onClick={() => handleStatusUpdate(app._id, "Rejected")} className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${app.status === "Rejected" ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"}`}>{app.status === "Rejected" ? "✕ Rejected" : "Reject"}</button>
                      <button onClick={() => handleApplicationDelete(app._id, app.user?.name || "this candidate")} className="bg-slate-800 text-slate-400 border border-slate-700/80 hover:bg-rose-600 hover:text-white hover:border-rose-600 p-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center align-middle" title="Delete Application">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-500 text-sm font-medium tracking-wide">No recruitment requests submitted in the database pipeline yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "internships" && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-[#0b1329] p-6 rounded-2xl border border-gray-800 shadow-xl"><PostInternship onPostSuccess={fetchInternships} /></div>
          <div className="bg-[#0b1329] p-6 rounded-2xl shadow-xl border border-gray-800/80">
            <h3 className="text-lg font-bold mb-4 text-white tracking-tight">Manage Active Internships</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left divide-y divide-gray-800">
                <thead className="bg-[#0f1935]">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Company</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 bg-transparent">
                  {internships.length > 0 ? internships.map((job) => (
                    <tr key={job._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-bold text-white text-sm">{job.title}</td>
                      <td className="p-4 text-sm text-gray-400">{job.companyName || job.company}</td>
                      <td className="p-4 text-right"><button onClick={() => handleInternshipDelete(job._id, job.title || "this internship")} className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer">Delete</button></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="text-center py-8 text-gray-500 text-sm font-mono">No active internships tracked. Post one above!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <PremiumProfileModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedPremiumProfile(null); }} profile={selectedPremiumProfile} />
    </div>
  );
};

export default AdminDashboard;