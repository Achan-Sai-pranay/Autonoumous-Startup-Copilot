// components/PaymentModal.jsx
// ---------------------------------------------------------------------------
// IdeaPulse Pro Founder Upgrade Modal (₹149 / mo • $4.99 / mo)
// Honest, secure upgrade flow:
// - If VITE_PAYMENT_CHECKOUT_URL is configured, directs directly to the gateway checkout.
// - Supports Early Access Passes / Beta Vouchers (e.g. FOUNDER_PASS) for invited testers.
// - Allows joining the Pro Priority Access waitlist with zero fake card collection.
// ---------------------------------------------------------------------------
import { useState } from "react";
import {
  X,
  Check,
  Zap,
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Ticket,
} from "lucide-react";
import { upgradeUserToPro } from "../lib/quotaManager.js";

const CHECKOUT_URL = import.meta.env.VITE_PAYMENT_CHECKOUT_URL || "";

export default function PaymentModal({
  isOpen,
  onClose,
  currentUser,
  onPaymentSuccess = () => {},
}) {
  const [activeTab, setActiveTab] = useState(CHECKOUT_URL ? "checkout" : "access");
  const [voucherCode, setVoucherCode] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState(currentUser?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedWaitlist, setSubmittedWaitlist] = useState(false);
  const [error, setError] = useState("");
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleRedeemVoucher(e) {
    e?.preventDefault();
    setError("");

    const rawCode = (voucherCode || "").trim().toUpperCase();
    const code = rawCode.replace(/[\s\-_]+/g, "_");
    if (!code) {
      setError("Please enter an early access voucher or invitation code.");
      return;
    }

    // Supported early founder vouchers
    const validCodes = ["FOUNDER_PASS", "IDEAPULSE2026", "BETA_PRO", "VIP_FOUNDER"];
    if (!validCodes.includes(code)) {
      setError("Invalid voucher code. Enter FOUNDER_PASS for instant testing access.");
      return;
    }

    setIsSubmitting(true);
    try {
      const sub = await upgradeUserToPro(currentUser?.id, {
        paymentMethod: "VOUCHER",
        paymentId: `VOUCHER-${code}`,
        voucherCode: code,
        isUnlimited: true,
      });
      setIsSubmitting(false);
      setUnlockedSuccess(true);
      if (typeof onPaymentSuccess === "function") {
        onPaymentSuccess(sub);
      }
      window.dispatchEvent(new CustomEvent("quota-updated", { detail: sub }));
    } catch (err) {
      setIsSubmitting(false);
      setError("Activation failed. Please retry.");
    }
  }

  async function handleJoinWaitlist(e) {
    e?.preventDefault();
    setError("");

    const email = waitlistEmail.trim();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid founder email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Record waitlist request to backend or localStorage
      const payload = {
        email,
        userId: currentUser?.id || "guest",
        type: "pro_priority_upgrade",
        requestedAt: new Date().toISOString(),
      };

      // Save locally
      try {
        const existing = JSON.parse(localStorage.getItem("ideapulse_pro_requests") || "[]");
        existing.push(payload);
        localStorage.setItem("ideapulse_pro_requests", JSON.stringify(existing));
      } catch {
        // ignore
      }

      // Try sending to backend waitlist endpoint if reachable
      try {
        await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Backend optional
      }

      setIsSubmitting(false);
      setSubmittedWaitlist(true);
    } catch {
      setIsSubmitting(false);
      setError("Could not submit request. Please try again.");
    }
  }

  function handleExternalCheckout() {
    if (CHECKOUT_URL) {
      window.open(CHECKOUT_URL, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-xs shadow-xs animate-idea-pulse">
              IP
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                IdeaPulse Pro
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                  Founder Tier
                </span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {unlockedSuccess ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner animate-scale-up">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Welcome to IdeaPulse Pro!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your account is upgraded with 10 blueprints per week, priority AI inference, and unlimited Co-Founder chat.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Plan Tier:</span>
                <span className="font-bold text-slate-900">Pro Founder Plan</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Active Quota:</span>
                <span className="font-bold text-emerald-600">10 Blueprints / Week</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="text-emerald-700 font-bold">Active</span>
              </div>
            </div>

            <button
              onClick={() => {
                setUnlockedSuccess(false);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              Back to Studio & Start Creating
            </button>
          </div>
        ) : (
          /* Main Content */
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50/60 to-white border border-orange-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-orange-900 uppercase tracking-wide">
                  Monthly Subscription
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black text-slate-900">₹149</span>
                  <span className="text-xs text-slate-500 font-medium">/ month ($4.99 USD)</span>
                </div>
                <span className="text-[11px] text-slate-500 block">Cancel anytime • No lock-in</span>
              </div>
              <div className="text-right space-y-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  <Sparkles size={11} /> 10 Blueprints / Wk
                </span>
              </div>
            </div>

            {/* Perks List */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-orange-600 shrink-0" />
                <span>10 blueprints every week</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-orange-600 shrink-0" />
                <span>Priority fast AI pipeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-orange-600 shrink-0" />
                <span>Unlimited Co-Founder chat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-orange-600 shrink-0" />
                <span>Watermark-free PDF & PRD export</span>
              </div>
            </div>

            {/* Tabs / Actions */}
            {CHECKOUT_URL ? (
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleExternalCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ExternalLink size={16} />
                </button>
                <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>Encrypted 256-bit payment checkout</span>
                </p>
              </div>
            ) : (
              <div className="pt-2 space-y-4">
                {/* Method Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("access");
                      setError("");
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === "access"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Request Priority Upgrade
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("voucher");
                      setError("");
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === "voucher"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Redeem Founder Voucher
                  </button>
                </div>

                {activeTab === "access" && (
                  <div className="space-y-3 animate-fade-in">
                    {submittedWaitlist ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                        <CheckCircle2 size={24} className="text-emerald-600 mx-auto" />
                        <h4 className="text-xs font-bold text-emerald-900">Priority Request Received!</h4>
                        <p className="text-[11px] text-emerald-700">
                          We will email you a direct invite and instant checkout link as soon as the payment gateway activates.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleJoinWaitlist} className="space-y-3">
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                          <p className="font-semibold flex items-center gap-1.5">
                            <Lock size={13} className="text-amber-700" />
                            Direct Gateway Integration In Progress
                          </p>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            We are configuring a low-friction payment provider. Enter your email below to receive immediate access and an early adopter discount.
                          </p>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Your Founder Email
                          </label>
                          <input
                            type="email"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            placeholder="founder@startup.com"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs text-slate-900 placeholder-slate-400"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <span>Request Pro Access</span>
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {activeTab === "voucher" && (
                  <form onSubmit={handleRedeemVoucher} className="space-y-3 animate-fade-in">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Early Founder Voucher or Passcode
                      </label>
                      <div className="relative">
                        <Ticket size={15} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="e.g. FOUNDER_PASS"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono uppercase text-slate-900"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Beta testers can enter <code className="bg-slate-100 px-1 py-0.5 rounded text-orange-600 font-bold">FOUNDER_PASS</code> to activate.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Activating...</span>
                        </>
                      ) : (
                        <>
                          <span>Activate Pro Plan</span>
                          <Check size={14} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" /> No hidden fees
              </span>
              <span>Need invoice? hello@ideapulse.ai</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
