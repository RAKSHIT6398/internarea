import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./style.css";
import GoogleSignInButton from "./components/GoogleSignInButton";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* OTP verification states */
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifiedToken, setVerifiedToken] = useState(null);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculator
  const getPasswordStrength = () => {
    if (!password) return { width: "0%", color: "", label: "", text: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
      return { width: "33%", color: "bg-red-500", label: "Weak", text: "text-red-500" };
    if (score <= 3)
      return { width: "66%", color: "bg-yellow-500", label: "Medium", text: "text-yellow-600" };
    return { width: "100%", color: "bg-green-500", label: "Strong", text: "text-green-600" };
  };

  const strength = getPasswordStrength();

  const showError = (msg) => {
    setMessage(msg);
    setIsSuccess(false);
  };

  /* ═══ STAGE 1: Email pe OTP bhejo ═══ */
  const sendOtp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      return showError("Please fill all fields first");
    }
    if (password.length < 8) {
      return showError("Password must be at least 8 characters");
    }

    try {
      setMessage("");
      setIsLoading(true);

      // ✅ MATCHES otpRoutes.js: /send-otp
      await axios.post(`${API}/api/otp/send-otp`, { email: email.trim() });

      setOtpSent(true);
      setMessage("OTP sent to your email 📧 — check inbox/spam");
      setIsSuccess(true);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  /* ═══ STAGE 2: OTP verify → verifiedToken ═══ */
  const verifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      return showError("Enter the 6-digit OTP");
    }

    try {
      setMessage("");
      setIsLoading(true);

      // ✅ MATCHES otpRoutes.js: /verify-otp
      const { data } = await axios.post(`${API}/api/otp/verify-otp`, {
        email: email.trim(),
        otp: otp.trim(),
      });

      setVerifiedToken(data.verifiedToken);
      setMessage("Email verified ✅ — ab Create Account dabao");
      setIsSuccess(true);
    } catch (err) {
      showError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ═══ STAGE 3: Register (verifiedToken ke saath) ═══ */
  const handleRegister = async () => {
    try {
      setMessage("");
      setIsLoading(true);

      await axios.post(`${API}/api/auth/register`, {
        name: name.trim(),
        email: email.trim(),
        password,
        verifiedToken,
      });

      toast.success("Account created! Ab login karo 🎉");
      navigate("/login", { replace: true });
    } catch (err) {
      showError(err.response?.data?.message || "Registration Failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* Single submit — stage ke hisaab se */
  const onSubmit = (e) => {
    e.preventDefault();
    if (verifiedToken) return handleRegister();
    if (otpSent) return verifyOtp();
    return sendOtp();
  };

  const resetEmailFlow = () => {
    setOtpSent(false);
    setOtp("");
    setVerifiedToken(null);
    setMessage("");
  };

  const buttonLabel = isLoading
    ? verifiedToken ? "Creating Account..." : otpSent ? "Verifying..." : "Sending OTP..."
    : verifiedToken ? "Create Account"
    : otpSent ? "Verify OTP"
    : "Send OTP to Verify Email";

  return (
    <section className="relative min-h-screen supports-[height:100dvh]:min-h-[100dvh] overflow-hidden bg-[#0B1020]">
      {/* Background Glow */}
      <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl sm:h-96 sm:w-96" />
      <div className="absolute top-1/3 -right-32 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl sm:h-96 sm:w-96" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl sm:h-80 sm:w-80" />

      <main className="relative z-10 grid min-h-screen supports-[height:100dvh]:min-h-[100dvh] lg:grid-cols-2">
        {/* Left Branding Section */}
        <aside className="hidden flex-col justify-between px-10 py-10 text-white lg:flex xl:px-16 xl:py-12">
          <div className="flex items-center gap-3">
            {/* ✅ LOGO 1: Desktop Sidebar */}
            <img
              src="/fav.png"
              alt="internArea Logo"
              className="h-11 w-11 rounded-2xl object-contain shadow-lg bg-white/10 p-1 xl:h-12 xl:w-12"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight xl:text-2xl">internArea</h1>
              <p className="text-xs text-slate-300 xl:text-sm">Internship & career platform</p>
            </div>
          </div>

          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              Build your career profile
            </span>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight xl:mt-6 xl:text-5xl">
              Create your account and unlock internship opportunities.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300 xl:mt-5 xl:text-lg xl:leading-8">
              Join internArea to explore internships, apply faster, and manage
              your career journey from one place.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 xl:gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur xl:p-4">
              <p className="text-xl font-bold xl:text-2xl">Easy</p>
              <p className="mt-1 text-xs text-slate-300 xl:text-sm">Registration</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur xl:p-4">
              <p className="text-xl font-bold xl:text-2xl">100+</p>
              <p className="mt-1 text-xs text-slate-300 xl:text-sm">Internships</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 backdrop-blur xl:p-4">
              <p className="text-xl font-bold xl:text-2xl">Secure</p>
              <p className="mt-1 text-xs text-slate-300 xl:text-sm">Account</p>
            </div>
          </div>
        </aside>

        {/* Register Card */}
        <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-10">
          <div className="w-full max-w-md">
            {/* Mobile / Tablet Brand */}
            <div className="mb-5 flex justify-center sm:mb-6 lg:hidden">
              <div className="flex items-center gap-3">
                {/* ✅ LOGO 2: Mobile Header */}
                <img
                  src="/fav.png"
                  alt="internArea Logo"
                  className="h-10 w-10 rounded-2xl object-contain shadow-lg bg-white/10 p-1 sm:h-12 sm:w-12"
                />
                <div>
                  <h1 className="text-xl font-bold text-white sm:text-2xl">internArea</h1>
                  <p className="text-xs text-slate-300 sm:text-sm">Career starts here</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-7 lg:rounded-[2rem] lg:p-8">
              <div className="mb-6 hidden items-center gap-3 lg:flex xl:mb-7">
                {/* ✅ LOGO 3: Inside Register Card (Desktop) */}
                <img
                  src="/fav.png"
                  alt="internArea Logo"
                  className="h-10 w-10 rounded-2xl object-contain shadow-lg xl:h-11 xl:w-11"
                />
                <div>
                  <h1 className="text-lg font-bold text-slate-900 xl:text-xl">internArea</h1>
                  <p className="text-xs text-slate-500">Create your new account</p>
                </div>
              </div>

              <div className="mb-6 sm:mb-7">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Create Account
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 sm:mt-2">
                  Enter your details to get started with internArea.
                </p>
              </div>

              {message && (
                <div
                  className={`mb-5 flex items-start gap-2 break-words rounded-xl border px-3.5 py-3 text-sm font-medium sm:rounded-2xl sm:px-4 ${
                    isSuccess
                      ? "border-green-200 bg-green-50 text-green-600"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={onSubmit}>
                {/* Full Name */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    disabled={isLoading || otpSent}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-2xl sm:px-4"
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      disabled={isLoading || otpSent}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-2xl sm:px-4 sm:pr-12"
                    />
                    {verifiedToken && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>

                {/* OTP INPUT */}
                {otpSent && !verifiedToken && (
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      placeholder="6-digit code"
                      value={otp}
                      maxLength={6}
                      disabled={isLoading}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center font-mono text-base tracking-[0.3em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-2xl sm:text-lg sm:tracking-[0.4em]"
                    />
                    <button
                      type="button"
                      onClick={resetEmailFlow}
                      className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      ← Change email / resend OTP
                    </button>
                  </div>
                )}

                {/* Password */}
                <div className="mb-5 sm:mb-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min 8 characters)"
                      value={password}
                      disabled={isLoading || otpSent}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-3.5 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-2xl sm:pl-4"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {password ? (
                    <div className="mt-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Password strength:{" "}
                        <span className={`font-semibold ${strength.text}`}>
                          {strength.label}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">
                      Password should be at least 8 characters.
                    </p>
                  )}
                </div>

                <p className="mb-5 text-xs leading-relaxed text-slate-400 sm:mb-6">
                  By creating an account, you agree to our{" "}
                  <span className="cursor-pointer font-medium text-orange-600 hover:underline">
                    Terms of Service
                  </span>{" "}
                  &{" "}
                  <span className="cursor-pointer font-medium text-orange-600 hover:underline">
                    Privacy Policy
                  </span>
                  .
                </p>

                {/* Smart submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:rounded-2xl sm:py-3.5 sm:text-base ${
                    verifiedToken
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/25"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/25"
                  }`}
                >
                  {isLoading && (
                    <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {buttonLabel}
                </button>
              </form>

              <GoogleSignInButton
                disabled={isLoading}
                onError={(msg) => showError(msg)}
              />

              <div className="my-5 flex items-center gap-3 sm:my-6">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">OR</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-orange-600 hover:text-orange-700"
                >
                  Login
                </Link>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400 sm:mt-6">
              © {new Date().getFullYear()} internArea. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </section>
  );
};

export default Register;