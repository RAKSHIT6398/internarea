export const API_BASE =
  import.meta.env?.VITE_API_URL || "http://localhost:5000";

/**
 * Kisi bhi tarah ke stored path ko valid URL bana deta hai
 * - absolute windows path
 * - uploads/xyz.pdf
 * - /uploads/xyz.pdf
 * - full http url
 */
export const fileUrl = (p) => {
  if (!p) return "";

  let s = String(p).replace(/\\/g, "/").trim();

  // already full url
  if (/^https?:\/\//i.test(s)) return s;

  // absolute disk path → uploads ke baad ka hissa lo
  const idx = s.toLowerCase().lastIndexOf("/uploads/");
  if (idx !== -1) s = s.slice(idx + 1); // "uploads/xyz.pdf"

  // "C:/..." bacha ho to sirf filename
  if (/^[a-z]:\//i.test(s)) {
    s = "uploads/" + s.split("/").pop();
  }

  s = s.replace(/^\/+/, "");
  if (!s.startsWith("uploads/")) s = `uploads/${s}`;

  return `${API_BASE}/${s}`;
};