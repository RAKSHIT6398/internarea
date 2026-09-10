import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import { toast } from "react-toastify";
import GoogleSignInButton from "./components/GoogleSignInButton";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redirectBasedOnRole = (role) => {
    navigate(role === "admin" ? "/admin" : "/home", { replace: true });
  };

  const clearPendingOtpData = () => {
    localStorage.removeItem("otpEmail");
    localStorage.removeItem("otpLoginMethod");
  };

  const saveAuthData = (data) => {
    const user = data.user || {};
    const role = data.role || user.role || "user";

    localStorage.setItem("token", data.token || "");
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userId", user._id || "");
    localStorage.setItem("userName", user.name || "");

    clearPendingOtpData();
    return role;
  };

  // ==========================================
  // EMAIL/PASSWORD LOGIN
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      const res = await axios.post(`${API}/api/auth/login`, {
        email: email.trim(),
        password,
      });

      const data = res.data;

      if (data.otpRequired) {
        const otpEmail = data.email || email.trim();
        setEmail(otpEmail);
        setPassword("");
        setOtp("");
        setShowOtp(true);

        localStorage.setItem("otpEmail", otpEmail);
        localStorage.setItem("otpLoginMethod", "password");

        toast.info("OTP sent to your email 📧");
        return;
      }

      const role = saveAuthData(data);
      toast.success("Login Successful 🎉");
      redirectBasedOnRole(role);
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================
  const handleGoogleLogin = async (credential) => {
    try {
      setError("");
      setIsLoading(true);

      const res = await axios.post(`${API}/api/auth/google`, { credential });
      const data = res.data;

      if (data.otpRequired) {
        const otpEmail = data.email || "";
        setEmail(otpEmail);
        setPassword("");
        setOtp("");
        setShowOtp(true);

        localStorage.setItem("otpEmail", otpEmail);
        localStorage.setItem("otpLoginMethod", "google");

        ["token", "role", "user", "userId", "userName"].forEach((k) =>
          localStorage.removeItem(k)
        );

        toast.info("OTP sent to your registered email 📧");
        return;
      }

      const role = saveAuthData(data);
      toast.success("Google Login Successful 🎉");
      redirectBasedOnRole(role);
    } catch (err) {
      setError(err.response?.data?.message || "Google Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // VERIFY LOGIN OTP
  // ==========================================
  const verifyOtp = async (e) => {
    e.preventDefault();

    const otpEmail = email.trim() || localStorage.getItem("otpEmail");

    if (!otpEmail) {
      setError("Login session expired. Please login again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      const res = await axios.post(`${API}/api/auth/verify-login-otp`, {
        email: otpEmail,
        otp: otp.trim(),
      });

      const data = res.data;
      const role = saveAuthData(data);

      toast.success("OTP Verified ✅");
      redirectBasedOnRole(role);
    } catch (err) {
      setError(err.response?.data?.message || "OTP Verification Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeLoginMethod = () => {
    setShowOtp(false);
    setOtp("");
    setPassword("");
    setError("");
    clearPendingOtpData();
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0B1020]">
      {/* Background Glows — responsive placement */}
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />

      <main className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Desktop Branding Section */}
        <aside
          className="hidden flex-col justify-between px-8 py-8 text-white lg:flex xl:px-16"
        >
          <div className="flex items-center gap-3">
            <img
              src="/fav.png"
              alt="internArea Logo"
              className="h-10 w-10 rounded-2xl object-contain shadow-lg bg-white/10 p-1"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight">internArea</h1>
              <p className="text-xs text-slate-300">Internship & career platform</p>
            </div>
          </div>

          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-slate-200 backdrop-blur">
              Start your career journey
            </span>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight">
              Find internships, build skills, and grow faster.
            </h2>
            <p className="mt-4 text-lg leading-7 text-slate-300">
              Login to access opportunities, manage applications, and continue your professional growth with internArea.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xl font-bold">100+</p>
              <p className="mt-1 text-xs text-slate-300">Opportunities</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xl font-bold">Fast</p>
              <p className="mt-1 text-xs text-slate-300">Applications</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xl font-bold">Secure</p>
              <p className="mt-1 text-xs text-slate-300">Login</p>
            </div>
          </div>
        </aside>

        {/* Login Card */}
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Mobile Brand */}
            <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
              <img
                src="/fav.png"
                alt="internArea Logo"
                className="h-10 w-10 rounded-2xl object-contain shadow-lg bg-white/10 p-1"
              />
              <div>
                <h1 className="text-xl font-bold text-white">internArea</h1>
                <p className="text-xs text-slate-300">Career starts here</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              {/* Desktop Card Brand */}
              <div className="mb-8 hidden items-center gap-3 lg:flex">
                <img
                  src="/fav.png"
                  alt="internArea Logo"
                  className="h-10 w-10 rounded-2xl object-contain shadow-lg"
                />
                <div>
                  <h1 className="text-lg font-bold text-slate-900">internArea</h1>
                  <p className="text-xs text-slate-500">Welcome back to your account</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {showOtp ? "Verify OTP" : "Sign in"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {showOtp
                    ? "Enter the OTP sent to your registered email."
                    : "Enter your details to continue to internArea."}
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={showOtp ? verifyOtp : handleLogin}>
                {/* Email */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    disabled={showOtp || isLoading}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                {!showOtp ? (
                  <>
                    {/* Password */}
                    <div className="mb-3">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        disabled={isLoading}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </div>
                    <div className="mb-5 flex justify-end">
                      <Link to="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                        Forgot Password?
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    {/* OTP */}
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        OTP Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        disabled={isLoading}
                        maxLength={6}
                        autoComplete="one-time-code"
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleChangeLoginMethod}
                      className="mb-4 text-sm font-semibold text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Change email or password
                    </button>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading
                    ? showOtp
                      ? "Verifying..."
                      : "Signing in..."
                    : showOtp
                    ? "Verify OTP"
                    : "Sign in"}
                </button>
              </form>

              {!showOtp && (
                <GoogleSignInButton
                  disabled={isLoading}
                  onCredential={handleGoogleLogin}
                  onError={setError}
                />
              )}

              <div className="mt-6 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700">
                  Register
                </Link>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} internArea. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </section>
  );
};

export default Login;