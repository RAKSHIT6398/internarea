export const CATEGORIES = [
  { name: "Software Development", icon: "💻" },
  { name: "Web Development",      icon: "🌐" },
  { name: "App Development",      icon: "📱" },
  { name: "Data Science",         icon: "📊" },
  { name: "Machine Learning / AI",icon: "🤖" },
  { name: "UI/UX Design",         icon: "🎨" },
  { name: "Graphic Design",       icon: "🖌️" },
  { name: "Digital Marketing",    icon: "📢" },
  { name: "Content Writing",      icon: "✍️" },
  { name: "Social Media",         icon: "📸" },
  { name: "Video Editing",        icon: "🎬" },
  { name: "Business Development", icon: "📈" },
  { name: "Sales",                icon: "🤝" },
  { name: "Finance & Accounts",   icon: "💰" },
  { name: "Human Resources",      icon: "👥" },
  { name: "Operations",           icon: "⚙️" },
  { name: "Cyber Security",       icon: "🔒" },
  { name: "Cloud / DevOps",       icon: "☁️" },
  { name: "Testing / QA",         icon: "🐞" },
  { name: "Media & Journalism",   icon: "📰" },
  { name: "Teaching / Training",  icon: "📚" },
  { name: "Research",             icon: "🔬" },
  { name: "Legal",                icon: "⚖️" },
  { name: "Other",                icon: "✨" },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

/* Home / Listing page ke special quick filters */
export const QUICK_FILTERS = [
  { key: "all",      label: "All",            type: "all" },
  { key: "wfh",      label: "Work From Home", type: "flag", param: "wfh" },
  { key: "partTime", label: "Part-time",      type: "flag", param: "partTime" },
  { key: "featured", label: "Featured 🔥",     type: "flag", param: "featured" },
];