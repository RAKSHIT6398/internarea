const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    caption: String,

    mediaUrl: String,
    mediaType: {
  type: String,
  enum: ["image", "video"],
  default: "image"
  
},

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    shares: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }

);

module.exports = mongoose.model(
  "Post",
  postSchema
);
