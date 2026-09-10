import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Download, AlertCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/api/resume/my-resume`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResume(response.data.resume);
      } catch (err) {
        console.error("Resume fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm tracking-wide">Loading your ATS resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] text-white py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-2xl shadow-2xl text-center">
          <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold mb-2">No Resume Found</h2>
          <p className="text-zinc-400 text-sm mb-6">
            You haven't built an ATS-friendly resume yet. Create one to fast-track your career.
          </p>
          <Link to="/resume" className="block w-full">
            <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-95 shadow-lg shadow-orange-500/10 transition-all text-sm">
              Create Your Resume Now
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Safe PDF URL resolver for production & dev
  const pdfUrl = resume.pdfPath
    ? `${API}${resume.pdfPath.startsWith("/") ? resume.pdfPath : `/${resume.pdfPath}`}`
    : null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0b0f19] text-white py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-3xl">
        {/* Title Block */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-zinc-400 text-xs mt-1">Manage and access your synced profile documents</p>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full text-purple-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles size={12} /> PRO FEATURE
          </div>
        </div>

        {/* Premium Resume Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Content (User Info) */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
              <FileText size={26} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-zinc-100">
                {resume.fullName}'s Resume
              </h2>
              <p className="text-zinc-400 text-sm font-medium mt-0.5">{resume.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md text-xs font-medium border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ATS Optimized
              </div>
            </div>
          </div>

          {/* Right Content (Download Action) */}
          <div className="w-full md:w-auto border-t md:border-t-0 border-zinc-800/60 pt-4 md:pt-0">
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all text-sm tracking-wide group"
              >
                <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                Download PDF
              </a>
            ) : (
              <div className="text-zinc-500 text-sm bg-zinc-950/40 px-4 py-2 rounded-xl text-center border border-zinc-800">
                PDF not available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;