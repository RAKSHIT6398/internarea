import axios from "axios";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 🔐 Auto-attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 Global error handling (optional but recommended)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // or your auth route
    }
    return Promise.reject(err);
  }
);

export default api;