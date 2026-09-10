import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const EmailIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
  </svg>
);

const CheckIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

const ArrowLeftIcon = ({ className = "" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!isValidEmail(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/forgot-password`, { email: email.trim() });
      setMessage(res.data.message || "Password reset instructions sent successfully.");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0B1020]">
      {/* Background Glows — adjusted for mobile */}
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />

      <main className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Desktop Branding Section */}
        <aside className="hidden lg:flex flex-col justify-between px-8 py-8 xl:px-16 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 font-bold text-white shadow-lg">iA</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">internArea</h1>
              <p className="text-xs text-slate-300">Internship & career platform</p>
            </div>
          </div>

          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-slate-200 backdrop-blur">
              Secure account recovery
            </span>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight">
              Reset your password and get back to your career journey.
            </h2>
            <p className="mt-4 text-lg leading-7 text-slate-300">
              Enter your registered email address and we’ll send you secure password reset instructions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xl font-bold">Secure</p>
              <p className="mt-1 text-xs text-slate-300">Recovery</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xl font-bold">Fast</p>
              <p className="mt-1 text-xs text-slate-300">Reset</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
              <p className="text-xl font-bold">Email</p>
              <p className="mt-1 text-xs text-slate-300">Verification</p>
            </div>
          </div>
        </aside>

        {/* Forgot Password Card */}
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Mobile Brand */}
            <div className="mb-5 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 font-bold text-white shadow-lg">iA</div>
              <div>
                <h1 className="text-xl font-bold text-white">internArea</h1>
                <p className="text-xs text-slate-300">Career starts here</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              {/* Desktop Card Brand */}
              <div className="mb-7 hidden items-center gap-3 lg:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 font-bold text-white">iA</div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">internArea</h1>
                  <p className="text-xs text-slate-500">Account recovery center</p>
                </div>
              </div>

              <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-orange-600">
                <ArrowLeftIcon className="h-4 w-4" /> Back to Login
              </Link>

              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Forgot Password?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  No worries. Enter your registered email and we’ll help you reset your password.
                </p>
              </div>

              {message && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  </span>
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <ErrorIcon className="h-4 w-4 text-red-600" />
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword}>
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <EmailIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      disabled={loading}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    We’ll send reset instructions only if this email is registered.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading && (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {loading ? "Sending..." : "Send Reset Instructions"}
                </button>
              </form>

              <div className="my-6 flex items-center">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  OR
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="text-center text-sm text-slate-500">
                Remember your password?{" "}
                <Link to="/" className="font-bold text-orange-600 hover:text-orange-700">
                  Login
                </Link>
              </div>

              <div className="mt-3 text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700">
                  Create Account
                </Link>
              </div>
            </div>

            <footer className="mt-5 text-center">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} internArea. All rights reserved.
              </p>
            </footer>
          </div>
        </div>
      </main>
    </section>
  );
};

export default ForgotPassword;