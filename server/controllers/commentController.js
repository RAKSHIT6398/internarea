const Comment = require("../models/Comment");

exports.addComment = async (
  req,
  res
) => {
  try {
    const { postId, text } = req.body;

    const comment =
      await Comment.create({
        postId,
        userId: req.user.id,
        text,
      });

    res.status(201).json({
      success: true,
      comment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getComments = async (
  req,
  res
) => {
  try {
    const comments =
      await Comment.find({
        postId: req.params.postId,
      }).populate(
        "userId",
        "name"
      );

    res.status(200).json({
      success: true,
      comments,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

   
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this comment" });
    }

  
    comment.text = text;
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }


    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};