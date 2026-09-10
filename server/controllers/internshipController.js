

const Internship = require("../models/Internship");
const mongoose = require("mongoose");

const buildFilter = (q) => {
  const and = [];

 
  const type = q.postType || "internship";
  and.push({ $or: [{ postType: type }, { postType: { $exists: false } }] });
  and.push({ $or: [{ isActive: true }, { isActive: { $exists: false } }] });

  /* Search */
  if (q.search?.trim()) {
    const rx = new RegExp(q.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    and.push({
      $or: [
        { title: rx }, { companyName: rx }, { company: rx },
        { category: rx }, { location: rx }, { skills: rx },
      ],
    });
  }

  /* Category — multiple comma separated */
  if (q.category && q.category !== "All") {
    const cats = q.category.split(",").map((c) => c.trim()).filter(Boolean);
    and.push({ $or: cats.map((c) => ({ category: new RegExp(c, "i") })) });
  }

  if (q.location?.trim()) and.push({ location: new RegExp(q.location.trim(), "i") });
  if (q.workMode && q.workMode !== "All") and.push({ workMode: q.workMode });
  if (q.wfh === "true") and.push({ workMode: "Remote" });
  if (q.partTime === "true") and.push({ isPartTime: true });
  if (q.featured === "true") and.push({ isFeatured: true });

  if (q.minStipend || q.maxStipend) {
    const s = {};
    if (q.minStipend) s.$gte = Number(q.minStipend);
    if (q.maxStipend) s.$lte = Number(q.maxStipend);
    and.push({ stipendAmount: s });
  }

  if (q.duration) and.push({ duration: new RegExp(q.duration, "i") });
  if (q.activeOnly === "true") and.push({ deadline: { $gte: new Date() } });

  return { $and: and };
};

const SORTS = {
  latest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "stipend-high": { stipendAmount: -1 },
  "stipend-low": { stipendAmount: 1 },
  popular: { applicationsCount: -1, views: -1 },
  deadline: { deadline: 1 },
};

/* ═══════════ 1. LIST (search + filter + pagination) ═══════════ */
exports.getAllInternships = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 9);
    const skip = (page - 1) * limit;

    const filter = buildFilter(req.query);
    const sort = SORTS[req.query.sort] || SORTS.latest;

    const [internships, total] = await Promise.all([
      Internship.find(filter).sort(sort).skip(skip).limit(limit).lean({ virtuals: true }),
      Internship.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      internships,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════ 2. FILTER META (sidebar ke liye) ═══════════ */
/* ═══════════ 2. FILTER META (sidebar ke liye) ═══════════ */
exports.getFilterMeta = async (req, res) => {
  try {
    const type = req.query.postType || "internship";
    const base = {
      $and: [
        { $or: [{ postType: type }, { postType: { $exists: false } }] },
        { $or: [{ isActive: true }, { isActive: { $exists: false } }] },
      ],
    };

    const [categories, locations, stipendRange, counts] = await Promise.all([
      Internship.aggregate([
        { $match: base },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $match: { _id: { $nin: [null, ""] } } },   // 🐛 FIXED
        { $sort: { count: -1 } },
        { $limit: 30 },
      ]),
      Internship.aggregate([
        { $match: base },
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $match: { _id: { $nin: [null, ""] } } },   // 🐛 FIXED
        { $sort: { count: -1 } },
        { $limit: 25 },
      ]),
      Internship.aggregate([
        { $match: base },
        { $group: { _id: null, min: { $min: "$stipendAmount" }, max: { $max: "$stipendAmount" } } },
      ]),
      Internship.aggregate([
        { $match: base },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            remote: { $sum: { $cond: [{ $eq: ["$workMode", "Remote"] }, 1, 0] } },
            partTime: { $sum: { $cond: ["$isPartTime", 1, 0] } },
          },
        },
      ]),
    ]);

    return res.json({
      success: true,
      meta: {
        categories: categories.map((c) => ({ name: c._id, count: c.count })),
        locations: locations.map((l) => ({ name: l._id, count: l.count })),
        stipend: { min: stipendRange[0]?.min || 0, max: stipendRange[0]?.max || 100000 },
        counts: counts[0] || { total: 0, remote: 0, partTime: 0 },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════ 3. SINGLE (id ya slug) + similar ═══════════ */
/* ═══════════ 3. SINGLE (id ya slug) + similar ═══════════ */
exports.getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };

    const internship = await Internship.findOneAndUpdate(
      query,
      { $inc: { views: 1 } },
      { new: true }
    ).lean({ virtuals: true });

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    /* 🐛 FIXED — purane docs bhi similar me aayenge */
    const similar = await Internship.find({
      _id: { $ne: internship._id },
      $and: [
        { $or: [{ isActive: true }, { isActive: { $exists: false } }] },
        { $or: [{ category: internship.category }, { location: internship.location }] },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean({ virtuals: true });

    return res.status(200).json({ success: true, internship, similar });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════ 4. CREATE ═══════════ */
exports.createInternship = async (req, res) => {
  try {
    const payload = { ...req.body };

 
    if (!payload.title) payload.title = "Untitled";
    if (!payload.companyName && payload.company) payload.companyName = payload.company;
    if (!payload.companyName) payload.companyName = "Unknown Company";
    if (!payload.category) payload.category = "Other";
    if (!payload.location) payload.location = "Remote";
    if (!payload.stipend) payload.stipend = "Unpaid";
    if (!payload.aboutInternship) payload.aboutInternship = "No description provided.";

   
    if (!payload.deadline || payload.deadline === "" || payload.deadline === null) {
      payload.deadline = new Date(Date.now() + 30 * 86400000);
    } else {
      const d = new Date(payload.deadline);
      if (isNaN(d.getTime())) {
        payload.deadline = new Date(Date.now() + 30 * 86400000);
      } else {
        payload.deadline = d;
      }
    }

   
    if (payload.startDate && (payload.startDate === "" || isNaN(new Date(payload.startDate).getTime()))) {
      delete payload.startDate;
    }

  
    if (payload.openings === "" || payload.openings === null || isNaN(Number(payload.openings))) {
      payload.openings = 1;
    } else {
      payload.openings = Math.max(1, Number(payload.openings));
    }

    
    if (!["Remote", "On-site", "Hybrid"].includes(payload.workMode)) {
      payload.workMode = "On-site";
    }


    if (!["internship", "job"].includes(payload.postType)) {
      payload.postType = "internship";
    }

    // postedBy
    if (req.user) {
      payload.postedBy = req.user.id || req.user._id || req.user.userId;
    }

    // skills: string → array
    if (typeof payload.skills === "string") {
      payload.skills = payload.skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const internship = await Internship.create(payload);

    return res.status(201).json({
      success: true,
      message: `${internship.postType === "job" ? "Job" : "Internship"} published successfully! 🚀`,
      internship,
    });
  } catch (error) {
    console.error("CREATE INTERNSHIP ERROR:", error.message);
    console.error("PAYLOAD:", JSON.stringify(req.body, null, 2));

   
    if (error.name === "ValidationError") {
      const fields = Object.keys(error.errors).map((k) => `${k}: ${error.errors[k].message}`);
      return res.status(400).json({
        success: false,
        message: `Validation failed → ${fields.join(" | ")}`,
      });
    }

    return res.status(400).json({ success: false, message: error.message });
  }
};
/* ═══════════ 5. UPDATE ═══════════ */
exports.updateInternship = async (req, res) => {
  try {
    const updated = await Internship.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });

    return res.json({ success: true, message: "Updated successfully!", internship: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ═══════════ 6. TOGGLE ACTIVE ═══════════ */
exports.toggleInternship = async (req, res) => {
  try {
    const item = await Internship.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });

    item.isActive = !item.isActive;
    await item.save();

    return res.json({
      success: true,
      message: `Now ${item.isActive ? "ACTIVE ✅" : "PAUSED ⏸️"}`,
      internship: item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════ 7. DELETE ═══════════ */
exports.deleteInternship = async (req, res) => {
  try {
    const deleted = await Internship.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
/* ═══════════ MIGRATE: purane records fix ═══════════ */
/* ═══════════ MIGRATE: purane records fix ═══════════ */
exports.migrateOldPosts = async (req, res) => {
  try {
    const parse = (s) => {
      const n = String(s || "").replace(/,/g, "").match(/\d+/g);
      return n ? Math.max(...n.map(Number)) : 0;
    };

    const r1 = await Internship.updateMany(
      {
        $or: [
          { postType: { $exists: false } },
          { isActive: { $exists: false } },
          { isActivelyHiring: { $exists: false } },
          { workMode: { $exists: false } },
        ],
      },
      {
        $set: {
          postType: "internship",
          isActive: true,
          isActivelyHiring: true,
          workMode: "On-site",
        },
      }
    );

    const all = await Internship.find({}).lean();
    let fixed = 0;

    for (const doc of all) {
      const $set = {};
      if (!doc.stipendAmount) $set.stipendAmount = parse(doc.stipend);
      if (!doc.companyName && doc.company) $set.companyName = doc.company;
      if (!doc.deadline) $set.deadline = new Date(Date.now() + 30 * 86400000);
      if (!doc.aboutInternship && doc.description) $set.aboutInternship = doc.description;
      if (!doc.category) $set.category = "Other";
      if (!doc.stipend) $set.stipend = "Not disclosed";
      if (!doc.openings) $set.openings = 1;

      /* perks purane me String tha → array banao */
      if (doc.perks && typeof doc.perks === "string") {
        $set.perks = doc.perks.split(/[,\n•|]/).map((s) => s.trim()).filter(Boolean);
      }

      if (!doc.slug) {
        const base = `${doc.title || "post"}-${doc.companyName || doc.company || "co"}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        $set.slug = `${base}-${Date.now().toString(36).slice(-5)}`;
      }

      if (Object.keys($set).length) {
        await Internship.updateOne({ _id: doc._id }, { $set });
        fixed++;
      }
    }

    return res.json({
      success: true,
      message: `✅ Migration done — flags: ${r1.modifiedCount}, backfilled: ${fixed}`,
      totalDocs: all.length,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
/* ═══════════ 8. ADMIN: sab (inactive bhi) ═══════════ */
exports.getAllForAdmin = async (req, res) => {
  try {
    const internships = await Internship.find()
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
    return res.json({ success: true, internships, total: internships.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};