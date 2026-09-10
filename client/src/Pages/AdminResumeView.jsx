import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const AdminResumeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const getProfileImage = (img) => {
    if (!img) return "";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    return `${API}${img.startsWith("/") ? img : `/${img}`}`;
  };

  useEffect(() => {
    const fetchPremiumProfile = async () => {
      try {
        const res = await axios.get(`${API}/api/auth/admin/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const match = res.data.applications.find(app => app.resume?._id === id || app._id === id);
          if (match) setProfile(match);
        }
      } catch (err) {
        console.error("Failed to load profile sheet", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPremiumProfile();
  }, [id, token]);

  if (loading) return <div className="p-10 text-center text-gray-500">Generating PDF Layout...</div>;
  if (!profile) return <div className="p-10 text-center text-red-500">Profile Not Found</div>;

  const resumeData = profile.resume;
  const userData = profile.user;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate("/admin")}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-900 transition-all cursor-pointer"
        >
          ← Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all cursor-pointer"
        >
          🖨️ Save as PDF / Print
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-10 border border-gray-200 min-h-[297mm] print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tight">{userData?.name || "Candidate Profile"}</h1>
            <p className="text-indigo-600 font-bold text-md mt-1">Premium Registered Member</p>
            <p className="text-gray-600 text-sm mt-3 flex flex-col gap-0.5">
              <span>📧 Email: {userData?.email}</span>
              {resumeData?.portfolioUrl && (
                <span>🌐 Portfolio: <a href={resumeData.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">{resumeData.portfolioUrl}</a></span>
              )}
            </p>
          </div>
          {userData?.profileImage && (
            <img
              src={getProfileImage(userData.profileImage)}
              alt="DP"
              className="w-24 h-24 rounded-lg object-cover border-2 border-zinc-950 shadow-sm"
            />
          )}
        </div>

        <div className="space-y-8">
          {resumeData?.skills && resumeData.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">⚡ Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, i) => (
                  <span key={i} className="bg-gray-100 text-zinc-900 px-3 py-1 text-xs font-bold uppercase rounded border border-gray-200">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {resumeData?.education && (
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">🎓 Education Qualifications</h3>
              <p className="text-zinc-800 text-sm font-medium leading-relaxed whitespace-pre-line">{resumeData.education}</p>
            </div>
          )}

          {resumeData?.experience && (
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">💼 Work Experience & Projects</h3>
              <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-100">{resumeData.experience}</p>
            </div>
          )}
        </div>

        <div className="mt-20 pt-5 border-t border-gray-200 text-center text-xs text-gray-400 print:block">
          Generated via CareerSphere Recruitment Pipeline system. Verified Premium Member Profile.
        </div>
      </div>
    </div>
  );
};

export default AdminResumeView;