import React, { useState } from "react";
import { X, Send, Search } from "lucide-react";

function FriendShareModal({ postId, friends, onClose, onShare }) {

  const [searchTerm, setSearchTerm] = useState("");

 
  const filteredFriends = (friends || []).filter((friend) => {
    const friendInfo = friend.friendId?._id ? friend.friendId : friend;
    if (!friendInfo || !friendInfo.name) return false;
    
    return (
      friendInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friendInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      
      {/* 🌌 मोडल कंटेनर */}
      <div className="w-full max-w-md bg-[#0e1322] border border-zinc-800/80 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden text-white">
        
        {/* कार्ड बैकग्राउंड ग्लो */}
        <div className="absolute -left-10 -top-10 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* 📑 हेडर */}
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-black tracking-wide bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Share Post</h2>
            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Select a friend to send this post</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

     
        <div className="mb-4 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={15} />
          <input
            type="text"
            placeholder="Search friends by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-orange-500/50 pl-10 pr-4 py-2 rounded-xl text-xs font-medium text-zinc-200 placeholder-zinc-500 outline-none transition-all"
          />
        </div>

        
        <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => {
              const friendInfo = friend.friendId?._id ? friend.friendId : friend;

              return (
                <div 
                  key={friend._id || friendInfo._id} 
                  className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/50 p-3 rounded-2xl transition-all group"
                >
                 
                  <div className="flex items-center gap-3 truncate mr-2">
                    <img 
                      src={friendInfo.profileImage ? friendInfo.profileImage : `https://ui-avatars.com/api/?name=${friendInfo.name}&background=ff6b00&color=fff`} 
                      alt="" 
                      className="w-10 h-10 rounded-full border border-zinc-800 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-zinc-200 truncate">{friendInfo.name}</h4>
                      <p className="text-[10px] text-zinc-500 truncate">{friendInfo.email}</p>
                    </div>
                  </div>

              
                  <button
                    onClick={() => onShare(postId, friendInfo._id)}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-xs font-black tracking-wide shadow-lg shadow-orange-500/5 active:scale-[0.96] transition-all whitespace-nowrap"
                  >
                    <Send size={12} /> Share
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-xs font-medium">
                {friends && friends.length > 0 ? "No matching friends found. 🔍" : "No active connections found to share. 🤝"}
              </p>
            </div>
          )}
        </div>

      
        <div className="mt-5 border-t border-zinc-800/40 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

export default FriendShareModal;