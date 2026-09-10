const Internship = require("../models/Internship");
const User = require("../models/User");

const PAGE_SIZE = 20;
const SUGGEST_LIMIT = 5;

const TYPE_WORDS = {
  internships: [
    "internship",
    "internships",
    "intern",
    "interns",
    "training",
  ],
  jobs: ["job", "jobs", "vacancy", "vacancies", "opening", "openings"],
  users: ["user", "users", "people", "person", "profile", "member"],
};

const sanitize = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const makeRegex = (query) => {
  const words = sanitize(query)
    .split(" ")
    .filter(Boolean)
    .map(escapeRegex);

  if (!words.length) return null;
  return new RegExp(words.join(".*"), "i");
};

const isEmailQuery = (q) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(q || "").trim());

const getViewerId = (req) =>
  req.user?.id || req.user?._id || req.userId || null;

/**
 * "mern internship" → { intent: "internships", rest: "mern" }
 * "jobs"            → { intent: "jobs", rest: "" }
 * "aman"            → { intent: null, rest: "aman" }
 * "a@gmail.com"     → { intent: "users", rest: "a@gmail.com" }
 */
const parseIntent = (raw) => {
  const q = sanitize(raw);

  if (!q) return { intent: null, rest: "" };
  if (isEmailQuery(q)) return { intent: "users", rest: q };

  const words = q.toLowerCase().split(" ").filter(Boolean);
  let intent = null;

  const leftover = words.filter((w) => {
    for (const [type, list] of Object.entries(TYPE_WORDS)) {
      if (list.includes(w)) {
        intent = type;
        return false; // ye word hata do
      }
    }
    return true;
  });

  return {
    intent,
    rest: leftover.join(" "),
  };
};

const opportunityFilter = (postType, restQuery) => {
  const filter = {
    postType,
    isActive: true,
  };

  // sirf "internship" / "jobs" likha ho → saari active posts
  if (!restQuery) return filter;

  const regex = makeRegex(restQuery);
  if (!regex) return filter;

  filter.$or = [
    { title: regex },
    { companyName: regex },
    { category: regex },
    { location: regex },
    { skills: regex },
    { aboutInternship: regex },
    { aboutCompany: regex },
    { experience: regex },
    { workMode: regex },
  ];

  return filter;
};

const userFilter = (restQuery, viewerId) => {
  const filter = {};

  if (viewerId) filter._id = { $ne: viewerId };

  if (!restQuery) return filter;

  if (isEmailQuery(restQuery)) {
    filter.email = restQuery.toLowerCase().trim();
    return filter;
  }

  const regex = makeRegex(restQuery);
  filter.$or = [{ name: regex }, { email: regex }];
  return filter;
};

const OPP_SELECT = [
  "_id",
  "postType",
  "title",
  "companyName",
  "companyLogo",
  "location",
  "category",
  "skills",
  "stipend",
  "ctc",
  "experience",
  "duration",
  "workMode",
  "deadline",
  "isFeatured",
  "isActivelyHiring",
  "createdAt",
].join(" ");

const formatOpp = (post) => ({
  _id: post._id,
  postType: post.postType,
  title: post.title,
  company: post.companyName,
  companyName: post.companyName,
  companyLogo: post.companyLogo || "",
  location: post.location || "",
  category: post.category || "",
  skills: post.skills || [],
  stipend: post.stipend || "",
  ctc: post.ctc || "",
  salary: post.ctc || post.stipend || "",
  experience: post.experience || "",
  duration: post.duration || "",
  workMode: post.workMode || "",
  deadline: post.deadline,
  isFeatured: !!post.isFeatured,
  isActivelyHiring: !!post.isActivelyHiring,
  createdAt: post.createdAt,
});

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  profileImage: user.profileImage || "",
  headline: "CareerSphere member",
});

const findOpps = (filter, limit = PAGE_SIZE) =>
  Internship.find(filter)
    .select(OPP_SELECT)
    .sort({ isFeatured: -1, isActivelyHiring: -1, createdAt: -1 })
    .limit(limit)
    .lean();

const findUsers = (filter, limit = PAGE_SIZE) =>
  User.find(filter)
    .select("_id name profileImage")
    .sort({ name: 1 })
    .limit(limit)
    .lean();

/* =========================================================
   GET /api/search?q=internship
   GET /api/search?q=jobs
   GET /api/search?q=aman
   GET /api/search?q=aman@gmail.com
========================================================= */
exports.searchAll = async (req, res) => {
  try {
    const started = Date.now();
    const q = sanitize(req.query.q);
    const typeParam = String(req.query.type || "all").toLowerCase();

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const { intent, rest } = parseIntent(q);

    // URL tab (?type=jobs) + typed intent dono respect
    const type =
      typeParam !== "all"
        ? typeParam
        : intent || "all";

    const viewerId = getViewerId(req);

    const internF = opportunityFilter("internship", rest);
    const jobF = opportunityFilter("job", rest);
    const userF = userFilter(rest || q, viewerId);

    const showI = type === "all" || type === "internships";
    const showJ = type === "all" || type === "jobs";
    const showU = type === "all" || type === "users";

    // email / sirf naam → users pehle
    const preferUsers = intent === "users" || isEmailQuery(q);

    const [
      internshipsCount,
      jobsCount,
      usersCount,
      internships,
      jobs,
      users,
    ] = await Promise.all([
      showI ? Internship.countDocuments(internF) : 0,
      showJ ? Internship.countDocuments(jobF) : 0,
      showU ? User.countDocuments(userF) : 0,
      showI && !preferUsers ? findOpps(internF) : Promise.resolve([]),
      showJ && !preferUsers ? findOpps(jobF) : Promise.resolve([]),
      showU ? findUsers(userF) : Promise.resolve([]),
    ]);

    // naam search pe internships/jobs bhi lao, email pe nahi
    let internList = internships;
    let jobList = jobs;

    if (preferUsers && type === "all") {
      internList = [];
      jobList = [];
    }

    if (!preferUsers && type === "all" && !intent && rest) {
      // normal mixed search — already fetched
    }

    const counts = {
      internships: preferUsers ? 0 : internshipsCount,
      jobs: preferUsers ? 0 : jobsCount,
      users: usersCount,
      total:
        (preferUsers ? 0 : internshipsCount) +
        (preferUsers ? 0 : jobsCount) +
        usersCount,
    };

    return res.status(200).json({
      success: true,
      q,
      type,
      intent: intent || "mixed",
      internships: internList.map(formatOpp),
      jobs: jobList.map(formatOpp),
      users: users.map(formatUser),
      counts,
      lockedCount: 0,
      tookMs: Date.now() - started,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: "Search failed. Please try again.",
    });
  }
};

/* =========================================================
   GET /api/search/suggest?q=job
========================================================= */
exports.getSuggestions = async (req, res) => {
  try {
    const q = sanitize(req.query.q);

    if (q.length < 2) {
      return res.status(200).json({
        internships: [],
        jobs: [],
        users: [],
      });
    }

    const { intent, rest } = parseIntent(q);
    const viewerId = getViewerId(req);
    const preferUsers = intent === "users" || isEmailQuery(q);

    const internF = opportunityFilter("internship", rest);
    const jobF = opportunityFilter("job", rest);
    const userF = userFilter(rest || q, viewerId);

    const wantI = !preferUsers && intent !== "jobs";
    const wantJ = !preferUsers && intent !== "internships";
    const wantU = intent !== "internships" && intent !== "jobs";

    const [internships, jobs, users] = await Promise.all([
      wantI ? findOpps(internF, SUGGEST_LIMIT) : Promise.resolve([]),
      wantJ ? findOpps(jobF, SUGGEST_LIMIT) : Promise.resolve([]),
      wantU ? findUsers(userF, 4) : Promise.resolve([]),
    ]);

    return res.status(200).json({
      internships: internships.map(formatOpp),
      jobs: jobs.map(formatOpp),
      users: users.map(formatUser),
    });
  } catch (error) {
    console.error("Suggest error:", error);
    return res.status(500).json({
      internships: [],
      jobs: [],
      users: [],
    });
  }
};