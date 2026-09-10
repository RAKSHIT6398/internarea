const mongoose = require("mongoose");

const appliedInternshipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
  type: String,
  enum: ["Pending", "Shortlisted", "Accepted", "Rejected"],
  default: "Pending"
},
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true
    },
   
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume" 
      
    
    },
   
    resumePath: {
      type: String 
    },
    isPremium: {
      type: Boolean,
      default: false
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AppliedInternship ||
  mongoose.model(
    "AppliedInternship",
    appliedInternshipSchema
  );