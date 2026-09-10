import React from "react";

const PremiumProfileModal = ({ isOpen, onClose, profile }) => {
  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transform transition-all animate-fadeIn">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h3 className="font-bold text-lg tracking-wide">Premium Talent Profile</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl font-bold bg-zinc-700/50 hover:bg-zinc-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Modal Body / Profile Metadata Fields */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Education Asset Block */}
          {profile.education && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold uppercase text-amber-600 tracking-wider mb-2">🎓 Education Details</h4>
              <p className="text-gray-800 font-medium text-sm">{profile.education}</p>
            </div>
          )}

          {/* Experience Tracker Section */}
          {profile.experience && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold uppercase text-indigo-600 tracking-wider mb-2">💼 Professional Experience</h4>
              <p className="text-gray-800 text-sm whitespace-pre-line">{profile.experience}</p>
            </div>
          )}

          {/* Skills Tag Cloud */}
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">⚡ Core Competencies</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-md text-xs font-semibold border border-zinc-200 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extra Links/Portfolio Route */}
          {profile.portfolioUrl && (
            <div className="pt-2 border-t border-gray-100">
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 underline"
              >
                🌐 Visit External Portfolio Website →
              </a>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-900 text-white hover:bg-gray-800 text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Close Review
          </button>
        </div>

      </div>
    </div>
  );
};

export default PremiumProfileModal;