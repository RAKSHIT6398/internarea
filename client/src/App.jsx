import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./Pages/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Profile from "./Pages/Profile";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import Register from "./Register";
import ResumeBuilder from "./Pages/CreateResume";
import UploadTest from "./Pages/UploadTest";
import CreatePost from "./Pages/CreatePost";
import Feed from "./Pages/Feed";
import Users from "./Pages/Users";
import Friends from "./Pages/Friends";
import FriendRequests from "./Pages/FriendRequests";
import ChatPage from "./Pages/ChatPage";
import Home from "./Pages/Home";
import SubscriptionPlans from "./Pages/SubscriptionPlans";
import PostDetails from "./Pages/PostDetails";
import Dashboard from "./Pages/Dashboard";
import AdminPanel from "./Pages/AdminPanel";
import Internships from "./Pages/Internships";
import InternshipDetail from "./Pages/InternshipDetail";
import SearchResults from "./Pages/SearchResults";
import AdminResumeView from "./Pages/AdminResumeView";
import PublicProfile from "./Pages/PublicProfile";
import Landing from "./Pages/Landing";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Layout() {
  const [theme, setTheme] = useState("myPurple");
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ══════════════════════════════════════════════
     🚫 GOOGLE TRANSLATE UI KILLER
     ══════════════════════════════════════════════ */
  useEffect(() => {
    const killGoogleUI = () => {
      if (document.body.style.top && document.body.style.top !== "0px") {
        document.body.style.top = "0px";
      }
      if (document.body.style.position === "relative") {
        document.body.style.position = "static";
      }
      document.documentElement.style.marginTop = "0px";

      document
        .querySelectorAll(
          ".goog-te-banner-frame, .goog-te-banner-frame.skiptranslate, .skiptranslate iframe, .goog-te-balloon-frame, .goog-te-gadget-icon, #goog-gt-tt, .goog-tooltip"
        )
        .forEach((el) => {
          el.style.display = "none";
          el.style.visibility = "hidden";
          el.style.height = "0px";
        });
    };

    killGoogleUI();

    const observer = new MutationObserver(killGoogleUI);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    const interval = setInterval(killGoogleUI, 400);
    const stop = setTimeout(() => clearInterval(interval), 6000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, []);

  /* route change pe clean + scroll top */
  useEffect(() => {
    document.body.style.top = "0px";
    document.body.style.position = "static";
    window.scrollTo(0, 0);
  }, [location.pathname]);

  /* ── Navbar hide — sirf auth pages + landing + admin ──
     Guest bhi Navbar dekhe (guest-mode: Login/Signup buttons) */
  const noNavbarPaths = ["/", "/login", "/register", "/forgot-password"];
  const showNavbar =
    !noNavbarPaths.includes(location.pathname) &&
    !location.pathname.startsWith("/admin");

  /* ── Footer hide ── */
  const noFooterPaths = [
    , "/login", "/register", "/forgot-password",
    "/shared-posts", "/chat",
  ];
  const showFooter =
    !noFooterPaths.includes(location.pathname) &&
    !location.pathname.startsWith("/admin");

  /* ── Full-bleed dark pages (chat) ── */
  const darkPaths = ["/shared-posts", "/chat"];
  const isDark = darkPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar theme={theme} setTheme={setTheme} />}

      {/* 🔻 hidden translate mount point */}
      <div id="google_translate_element" style={{ display: "none" }} />

      <div
        className={`flex min-h-screen flex-col ${
          isDark ? "bg-[#0b0f19]" : "bg-gray-50"
        }`}
      >
        <div className="flex-1">
          <Routes>
            {/* ═══════ Public — Auth ═══════ */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ══════════════════════════════════════════
                Public — Browse (guest dekh sakta hai)
                READ free | ACTIONS pe login gate
                ══════════════════════════════════════════ */}
            <Route path="/internships" element={<Internships postType="internship" />} />
            <Route path="/jobs" element={<Internships postType="job" />} />
            <Route path="/internships/:id" element={<InternshipDetail />} />
            <Route path="/jobs/:id" element={<InternshipDetail />} />
            <Route path="/pricing" element={<SubscriptionPlans />} />
<Route path="/users/:id" element={<PublicProfile />} />
         
            <Route path="/feed" element={<Feed />} />
            <Route path="/post/:id" element={<PostDetails />} />
            <Route path="/search" element={<SearchResults />} />

            {/* ═══════ Protected ═══════ */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
            <Route path="/test" element={<ProtectedRoute><UploadTest /></ProtectedRoute>} />
            <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
           

            {/* 💬 CHAT */}
            <Route path="/shared-posts" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

            <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path="/friend-requests" element={<ProtectedRoute><FriendRequests /></ProtectedRoute>} />

            {/* ═══════ Admin (dono AdminRoute-protected) ═══════ */}
            <Route
              path="/admin/resume-view/:id"
              element={<AdminRoute><AdminResumeView /></AdminRoute>}
            />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

            {/* ═══════ 404 ═══════ */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {showFooter && <Footer />}
        <ToastContainer position="top-right" theme="dark" />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}