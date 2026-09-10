const mongoose = require("mongoose");

const sharedPostSchema =
  new mongoose.Schema(
    {
      postId: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Post",
      },

      senderId: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
      },

      receiverId: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "SharedPost",
    sharedPostSchema
  );