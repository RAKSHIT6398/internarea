



const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Internship", required: true, index: true },

    /* ───── RESUME ───── */
    isPremium: { type: Boolean, default: false },
    resume: { type: mongoose.Schema.Types.Mixed, default: null }, 
    pdfPath: { type: String, default: "" },                       

   
    screening: {
      readyToJoinImmediately: { type: Boolean, default: false },
      availableFrom: { type: Date },
      availabilityHours: { type: String, default: "" },  
      currentCity: { type: String, default: "" },
      willingToRelocate: { type: Boolean, default: false },
      phone: { type: String, default: "" },
      expectedStipend: { type: String, default: "" },
      coverLetter: { type: String, default: "" },
      portfolioUrl: { type: String, default: "" },
      linkedinUrl: { type: String, default: "" },
      githubUrl: { type: String, default: "" },
      relevantExperience: { type: String, default: "" },
      agreedToTerms: { type: Boolean, default: false },
    },

   status: {
  type: String,
  enum: [
    "Pending",
    "Applied",
    "Shortlisted",
    "Accepted",
    "Selected",
    "Rejected",
  ],
  default: "Pending",
},
    adminNote: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);


applicationSchema.index({ userId: 1, internshipId: 1 }, { unique: true });


applicationSchema.virtual("user", {
  ref: "User", localField: "userId", foreignField: "_id", justOne: true,
});
applicationSchema.virtual("internship", {
  ref: "Internship", localField: "internshipId", foreignField: "_id", justOne: true,
});

module.exports =
  mongoose.models.Application || mongoose.model("Application", applicationSchema);