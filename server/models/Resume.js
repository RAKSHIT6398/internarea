const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ═══════ 💎 PREMIUM / PAYMENT (NEW) ═══════ */
    isPaid: { type: Boolean, default: false, index: true },
    amountPaid: { type: Number, default: 0 },
    paymentId: { type: String, default: "" },
    orderId: { type: String, default: "" },
    paidAt: { type: Date, default: null },

    // Personal Info
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    portfolio: String,
    photo: { type: String, default: "" },

    // Professional Summary
    summary: String,

    // Skills
    skills: [String],

    // PDF Path Field
    pdfPath: { type: String },

    // Education
    education: [
      {
        institute: String,
        degree: String,
        specialization: String,
        cgpa: String,
        year: String,
      },
    ],

    // Experience
    experience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],

    // Projects
    projects: [
      {
        title: String,
        description: String,
        techStack: String,
        github: String,
        liveLink: String,
      },
    ],

    certifications: [{ title: String, issuer: String, year: String }],
    achievements: [String],
    languages: [String],

    templateId: { type: String, default: "default_modern" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/* ── Completeness % ── */
resumeSchema.virtual("completeness").get(function () {
  const checks = [
    !!this.fullName,
    !!this.email,
    !!this.phone,
    !!this.location,
    !!this.summary,
    (this.skills || []).length > 0,
    (this.education || []).length > 0,
    (this.projects || []).length > 0 || (this.experience || []).length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
});

resumeSchema.virtual("isReadyToApply").get(function () {
  return !!(this.isPaid && this.fullName && this.email);
});

module.exports = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);