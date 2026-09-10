const mongoose = require("mongoose");

const chatSettingsSchema = new mongoose.Schema(
  {
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

  
    peer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

 
    muted: {
      type: Boolean,
      default: false,
    },

    // Block this user
    blocked: {
      type: Boolean,
      default: false,
    },

    // Messages before this time are hidden for this user
    clearedAt: {
      type: Date,
      default: null,
    },

    // Conversation hidden from chat list
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One settings document per user + peer combination
chatSettingsSchema.index(
  { user: 1, peer: 1 },
  { unique: true }
);

module.exports = mongoose.model("ChatSettings", chatSettingsSchema);