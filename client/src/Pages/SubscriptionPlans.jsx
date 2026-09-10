import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Sparkles, LayoutGrid, Table2, CheckCircle2, Send,
  TrendingUp, BadgeCheck, Lock, Rocket, ArrowRight,
  ShieldCheck, Wallet, Zap, Headphones, Crown, Medal, Award, Gift,
} from "lucide-react";

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const plans = [
  {
    name: "Free", price: "0", applications: "1 Internship / Month",
    tagline: "Start your career journey", color: "from-gray-500 to-gray-700",
    accent: "text-gray-300", ring: "hover:shadow-gray-900/40", glow: "#6b7280", icon: Gift,
    features: ["Access to Job Board", "Standard Support", "1 Application Count"],
  },
  {
    name: "Bronze", price: "100", applications: "3 Internships / Month",
    tagline: "For active applicants", color: "from-amber-600 to-orange-800",
    accent: "text-amber-400", ring: "hover:shadow-amber-900/30", glow: "#d97706", icon: Medal,
    features: ["Premium Resume Lock", "3 Application Counts", "Email Invoice"],
  },
  {
    name: "Silver", price: "300", applications: "5 Internships / Month",
    tagline: "Accelerate your opportunities", color: "from-indigo-500 to-purple-600",
    accent: "text-indigo-400", ring: "hover:shadow-indigo-900/30", glow: "#6366f1", icon: Award,
    popular: true, save: "Popular",
    features: ["Premium Resume Lock", "5 Application Counts", "Priority Email Invoice"],
  },
  {
    name: "Gold", price: "1000", applications: "Unlimited Internships",
    tagline: "Maximum career access", color: "from-yellow-500 to-orange-600",
    accent: "text-yellow-400", ring: "hover:shadow-yellow-900/30", glow: "#eab308", icon: Crown,
    features: ["Premium Resume Lock", "Unlimited Counts", "Instant VIP Invoice", "24/7 Support"],
  },
];

const compareRows = [
  { label: "Applications / Month", values: ["1", "3", "5", "Unlimited"] },
  { label: "Job Board Access", values: [true, true, true, true] },
  { label: "Premium Resume Lock", values: [false, true, true, true] },
  { label: "Email Invoice", values: [false, true, true, true] },
  { label: "Priority Invoice", values: [false, false, true, true] },
  { label: "24/7 Support", values: [false, false, false, true] },
];

const CompareCell = ({ v }) => {
  if (v === true) return <CheckCircle2 size={17} className="mx-auto text-emerald-400" />;
  if (v === false) return <span className="text-gray-700">—</span>;
  return <span className="text-xs font-bold text-gray-300">{v}</span>;
};

const CountdownBoxes = ({ value, tone }) => {
  const color = tone === "emerald"
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
    : "border-rose-500/30 bg-rose-500/10 text-rose-300";
  return <div className={`rounded-lg border px-3 py-2 font-mono text-xs font-black ${color}`}>{value}</div>;
};

const SubscriptionPlans = ({ user, fetchUserProfile }) => {
  const [subLoading, setSubLoading] = useState(null);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [priceView, setPriceView] = useState("cards");
  const [countdown, setCountdown] = useState("00:00:00");

  const updatePaymentWindow = () => {
    const now = new Date();
    const ist = new Date(now.getTime() + 330 * 60 * 1000);
    const hour = ist.getUTCHours();
    const open = hour >= 10 && hour < 11;
    setIsWindowOpen(open);

    let target;
    if (open) { target = new Date(ist); target.setUTCHours(11, 0, 0, 0); }
    else if (hour < 10) { target = new Date(ist); target.setUTCHours(10, 0, 0, 0); }
    else { target = new Date(ist); target.setUTCDate(target.getUTCDate() + 1); target.setUTCHours(10, 0, 0, 0); }

    let diff = Math.max(0, Math.floor((target.getTime() - ist.getTime()) / 1000));
    const h = String(Math.floor(diff / 3600)).padStart(2, "0");
    diff %= 3600;
    const m = String(Math.floor(diff / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");
    setCountdown(`${h}:${m}:${s}`);
  };

  useEffect(() => {
    updatePaymentWindow();
    const timer = setInterval(updatePaymentWindow, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscription = async (planName) => {
    if (planName === "Free") return;
    if (!isWindowOpen) {
      setStatusType("error");
      setStatusMessage("Payment gateway is available daily from 10 AM to 11 AM IST.");
      return;
    }

    try {
      setSubLoading(planName);
      setStatusMessage("");
      const token = localStorage.getItem("token");
      if (!token) {
        setStatusType("error");
        setStatusMessage("Please login before purchasing a plan.");
        return;
      }

      // ✅ Dynamic API URL
      const { data } = await axios.post(
        `${API}/api/subscriptions/create-order`,
        { plan: planName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!window.Razorpay) throw new Error("Razorpay SDK not loaded.");

      const options = {
        key: "rzp_test_T1UOgsBKCf986s",
        amount: data.order.amount,
        currency: data.order.currency || "INR",
        name: "CareerSphere",
        description: `Upgrading to ${planName} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            // ✅ Dynamic API URL
            const verifyRes = await axios.post(
              `${API}/api/subscriptions/verify-payment`,
              {
                plan: planName,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: data.order.amount,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            setStatusType("success");
            setStatusMessage(`🎉 ${verifyRes.data.message || `${planName} plan activated successfully.`}`);
            if (fetchUserProfile) await fetchUserProfile();
          } catch (err) {
            console.error("Verify error:", err?.response?.data || err);
            setStatusType("error");
            setStatusMessage(err?.response?.data?.message || "Payment verification failed.");
          }
        },
        modal: { ondismiss: () => { setStatusType("error"); setStatusMessage("Payment was cancelled."); } },
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#4f46e5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setStatusType("error");
        setStatusMessage(response?.error?.description || "Payment failed.");
      });
      rzp.open();
    } catch (error) {
      console.error("Order error:", error?.response?.data || error);
      setStatusType("error");
      setStatusMessage(error?.response?.data?.message || error?.message || "Something went wrong.");
    } finally {
      setSubLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <section id="pricing" className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: "linear-gradient(rgba(99,102,241,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="pointer-events-none absolute -top-32 left-[12%] h-80 w-80 rounded-full bg-indigo-600/25 blur-[110px]" />
        <div className="pointer-events-none absolute top-40 right-[8%] h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[130px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300 backdrop-blur">
              <Sparkles size={12} /> Pricing
            </span>
            <h2 className="text-3xl font-black leading-[1.15] tracking-tight sm:text-5xl">
              Upgrade Your{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Career Multiplier
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-gray-400">
              Choose the right CareerSphere plan and unlock more internship opportunities, premium features and priority support.
            </p>

            <div className={`mx-auto mt-8 flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl border p-4 backdrop-blur-xl sm:flex-row sm:justify-between ${
              isWindowOpen ? "border-emerald-500/40 bg-emerald-500/[0.07]" : "border-rose-500/40 bg-rose-500/[0.07]"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isWindowOpen ? "bg-emerald-400" : "bg-rose-400"} opacity-75`} />
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isWindowOpen ? "bg-emerald-500" : "bg-rose-500"}`} />
                </span>
                <div className="text-left">
                  <p className={`text-xs font-black uppercase tracking-wider ${isWindowOpen ? "text-emerald-300" : "text-rose-300"}`}>
                    Gateway {isWindowOpen ? "Open" : "Closed"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {isWindowOpen ? "Closes in" : "Daily window 10–11 AM IST • Opens in"}
                  </p>
                </div>
              </div>
              <CountdownBoxes value={countdown} tone={isWindowOpen ? "emerald" : "rose"} />
            </div>

            {statusMessage && (
              <div className={`mx-auto mt-4 max-w-lg rounded-xl border p-3.5 text-xs font-medium backdrop-blur ${
                statusType === "success" ? "border-emerald-500/50 bg-emerald-950/50 text-emerald-200" : "border-rose-500/50 bg-rose-950/50 text-rose-200"
              }`}>
                {statusMessage}
              </div>
            )}

            <div className="mt-8 inline-flex rounded-xl border border-gray-800 bg-gray-900/70 p-1 backdrop-blur">
              {[
                { k: "cards", label: "Plan Cards", icon: LayoutGrid },
                { k: "compare", label: "Compare All", icon: Table2 },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.k} onClick={() => setPriceView(t.k)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition ${
                      priceView === t.k ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-gray-400 hover:text-white"
                    }`}>
                    <Icon size={13} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {priceView === "cards" ? (
            <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {plans.map((plan) => {
                const isCurrentPlan = user?.subscription?.toLowerCase() === plan.name.toLowerCase() || (plan.name === "Free" && !user?.subscription);
                const disabled = plan.name === "Free" || subLoading === plan.name || !isWindowOpen || isCurrentPlan;
                const Icon = plan.icon;

                return (
                  <div key={plan.name} className={`group relative flex flex-col rounded-[1.35rem] border bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                    plan.popular ? "z-10 border-indigo-500/60 lg:-mt-4 lg:mb-4 lg:scale-[1.045] shadow-2xl shadow-indigo-600/15" : "border-gray-800 hover:border-gray-700"
                  } ${isCurrentPlan ? "border-emerald-500/60 shadow-emerald-600/10" : ""}`}>
                    {isCurrentPlan && (
                      <span className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-white">
                        ✓ Your Current Plan
                      </span>
                    )}
                    {plan.popular && !isCurrentPlan && (
                      <span className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-black">
                        🔥 Most Popular
                      </span>
                    )}
                    <div className="relative overflow-hidden rounded-t-[1.35rem] p-6 pb-5">
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-[0.16] ${plan.color}`} />
                      <div className="relative">
                        <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition duration-300 group-hover:scale-110 group-hover:rotate-6 ${plan.color}`}>
                          <Icon size={19} />
                        </div>
                        <h3 className="text-base font-black uppercase tracking-wider">{plan.name}</h3>
                        <p className="mt-0.5 text-[11px] text-gray-500">{plan.tagline}</p>
                        <div className="mt-4 flex items-end gap-1">
                          <span className="text-[15px] font-bold text-gray-400">₹</span>
                          <span className={`text-4xl font-black leading-none ${plan.accent}`}>{plan.price}</span>
                          <span className="pb-1 text-[11px] text-gray-500">/month</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold">
                            <Send size={10} /> {plan.applications}
                          </span>
                          {plan.save && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-300">
                              <TrendingUp size={10} /> {plan.save}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mx-6 h-px bg-gray-800" />
                    <div className="flex flex-grow flex-col justify-between p-6 pt-5">
                      <ul className="mb-7 space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5 text-[12px] text-gray-300">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
                              <CheckCircle2 size={11} className="text-indigo-400" />
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => handleSubscription(plan.name)} disabled={disabled}
                        className={`w-full rounded-xl py-3.5 text-[11px] font-black uppercase tracking-[0.12em] transition-all ${
                          isCurrentPlan ? "cursor-default bg-emerald-600 text-white"
                          : plan.name === "Free" ? "cursor-not-allowed border border-gray-800 bg-gray-900 text-gray-600"
                          : !isWindowOpen ? "cursor-not-allowed border border-gray-800 bg-gray-900 text-gray-600"
                          : plan.name === "Gold" ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:shadow-lg hover:shadow-amber-600/30"
                          : plan.name === "Silver" ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-600/30"
                          : "bg-gradient-to-r from-amber-600 to-orange-700 text-white"
                        }`}>
                        <span className="flex items-center justify-center gap-1.5">
                          {subLoading === plan.name ? (
                            <><span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Processing...</>
                          ) : isCurrentPlan ? (
                            <><BadgeCheck size={13} /> Active Tier</>
                          ) : plan.name === "Free" ? "Default Access"
                          : !isWindowOpen ? (
                            <><Lock size={12} /> Locked</>
                          ) : (
                            <><Rocket size={13} /> Buy Upgrade <ArrowRight size={13} /></>
                          )}
                        </span>
                      </button>
                      {!isCurrentPlan && plan.name !== "Free" && (
                        <p className="mt-2.5 text-center text-[9.5px] text-gray-600">Secure payment • Instant activation</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-950/60">
                      <th className="p-5 text-left text-[11px] font-black uppercase tracking-wider text-gray-500">Features</th>
                      {plans.map((plan) => {
                        const Icon = plan.icon;
                        return (
                          <th key={plan.name} className="p-5 text-center">
                            <div className={`mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${plan.color}`}>
                              <Icon size={15} />
                            </div>
                            <div className="text-sm font-black">{plan.name}</div>
                            <div className={`text-[11px] font-bold ${plan.accent}`}>₹{plan.price}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((row, i) => (
                      <tr key={row.label} className={`border-b border-gray-800/60 ${i % 2 ? "bg-gray-950/25" : ""}`}>
                        <td className="p-4 pl-5 text-xs font-semibold text-gray-300">{row.label}</td>
                        {row.values.map((v, j) => (
                          <td key={j} className="p-4 text-center"><CompareCell v={v} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: ShieldCheck, text: "256-bit Secure Payments", c: "text-emerald-400" },
              { icon: Wallet, text: "UPI • Cards • NetBanking", c: "text-indigo-400" },
              { icon: Zap, text: "Instant Plan Activation", c: "text-amber-400" },
              { icon: Headphones, text: "Human Support", c: "text-purple-400" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-2.5 text-[11px] font-semibold text-gray-400 backdrop-blur transition hover:border-gray-700 hover:text-gray-200">
                  <Icon size={14} className={item.c} /> {item.text}
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-[11px] text-gray-600">
            Powered by <span className="font-bold text-gray-400">Razorpay</span> · GST invoice emailed automatically · Need help?{" "}
            <a href="mailto:support@careersphere.com" className="font-semibold text-indigo-400 hover:underline">support@internArea.com</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPlans;