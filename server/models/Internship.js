

const mongoose = require("mongoose");


const parseAmount = (str) => {
  if (!str) return 0;

  const nums = String(str)
    .replace(/,/g, "")
    .match(/\d+/g);

  if (!nums) return 0;

  return Math.max(...nums.map(Number));
};

/** String / Array → Array */
const toArray = (v) => {
  if (Array.isArray(v)) {
    return v.filter(Boolean);
  }

  if (typeof v === "string") {
    return v
      .split(/[,\n•|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
};




const InternshipSchema = new mongoose.Schema(
  {
    /* =====================================================
       TYPE
    ===================================================== */

    postType: {
      type: String,
      enum: ["internship", "job"],
      default: "internship",
      index: true,
    },


    /* =====================================================
       BASIC
    ===================================================== */

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      index: true,
    },


    /* =====================================================
       COMPANY
    ===================================================== */

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyLogo: {
      type: String,
      default: "",
    },

    companyWebsite: {
      type: String,
      default: "",
    },

    aboutCompany: {
      type: String,
      default: "",
    },


    /* =====================================================
       CATEGORY / SKILLS
    ===================================================== */

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    skills: {
      type: [String],
      default: [],
      set: toArray,
    },


    /* =====================================================
       LOCATION / WORK MODE
    ===================================================== */

    location: {
      type: String,
      required: true,
      trim: true,
    },

    workMode: {
      type: String,
      enum: ["Remote", "On-site", "Hybrid"],
      default: "On-site",
      index: true,
    },

    isPartTime: {
      type: Boolean,
      default: false,
    },


    /* =====================================================
       MONEY
    ===================================================== */

    stipend: {
      type: String,
      required: true,
    },

    stipendAmount: {
      type: Number,
      default: 0,
      index: true,
    },

    isUnpaid: {
      type: Boolean,
      default: false,
    },

    isNegotiable: {
      type: Boolean,
      default: false,
    },

    /* Jobs ke liye */
    ctc: {
      type: String,
      default: "",
    },

    experience: {
      type: String,
      default: "Fresher",
    },


    /* =====================================================
       DURATION / DATES
    ===================================================== */

    duration: {
      type: String,
      default: "",
    },

    startDate: {
      type: Date,
    },

    isStartImmediate: {
      type: Boolean,
      default: false,
    },

    deadline: {
      type: Date,
      required: true,
    },


    /* =====================================================
       RICH DETAILS
    ===================================================== */

    aboutInternship: {
      type: String,
      required: true,
    },

    responsibilities: {
      type: [String],
      default: [],
      set: toArray,
    },

    whoCanApply: {
      type: String,
      default: "",
    },

    preferredQualifications: {
      type: [String],
      default: [],
      set: toArray,
    },

    perks: {
      type: [String],
      default: [],
      set: toArray,
    },

    additionalInfo: {
      type: String,
      default: "",
    },

    openings: {
      type: Number,
      default: 1,
      min: 1,
    },


    /* =====================================================
       SELECTION
    ===================================================== */

    assessmentRequired: {
      type: Boolean,
      default: false,
    },

    assessmentDetails: {
      type: String,
      default: "",
    },


    /* =====================================================
       FLAGS / META
    ===================================================== */

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActivelyHiring: {
      type: Boolean,
      default: true,
    },

    requiresPremiumResume: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    applicationsCount: {
      type: Number,
      default: 0,
    },


    /* =====================================================
       USER
    ===================================================== */

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);


/* =========================================================
   PRE SAVE
   Auto slug + stipendAmount
========================================================= */

InternshipSchema.pre("save", function () {
  /* -----------------------------
     Generate slug
  ----------------------------- */

  if (
    this.isModified("title") ||
    this.isModified("companyName") ||
    !this.slug
  ) {
    const base = `${this.title}-${this.companyName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    this.slug = `${base}-${Date.now().toString(36).slice(-5)}`;
  }


  /* -----------------------------
     Calculate stipend amount
  ----------------------------- */

  if (
    this.isModified("stipend") ||
    this.isModified("isUnpaid") ||
    !this.stipendAmount
  ) {
    this.stipendAmount = this.isUnpaid
      ? 0
      : parseAmount(this.stipend);
  }
});


/* =========================================================
   PRE FIND ONE AND UPDATE
   Update stipendAmount when stipend changes
========================================================= */

InternshipSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() || {};

  const stipend =
    update.stipend ??
    update.$set?.stipend;

  if (stipend !== undefined) {
    if (!update.$set) {
      update.$set = {};
    }

    update.$set.stipendAmount = parseAmount(stipend);

    this.setUpdate(update);
  }
});


/* =========================================================
   SEARCH INDEX
========================================================= */

InternshipSchema.index({
  title: "text",
  companyName: "text",
  category: "text",
  location: "text",
  skills: "text",
});


/* =========================================================
   VIRTUALS
========================================================= */

/* Internship expire ho chuki hai ya nahi */
InternshipSchema.virtual("isExpired").get(function () {
  if (!this.deadline) {
    return false;
  }

  return new Date(this.deadline) < new Date();
});


/* Kitne days remaining hain */
InternshipSchema.virtual("daysLeft").get(function () {
  if (!this.deadline) {
    return null;
  }

  const diff =
    new Date(this.deadline).getTime() -
    new Date().getTime();

  const days = Math.ceil(diff / 86400000);

  return days > 0 ? days : 0;
});


/* =========================================================
   EXPORT
========================================================= */

module.exports = mongoose.model(
  "Internship",
  InternshipSchema
);