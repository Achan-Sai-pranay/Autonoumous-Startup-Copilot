// components/PaymentModal.jsx
// ---------------------------------------------------------------------------
// LaunchPilot Upgrade & Razorpay UPI Payment Modal:
// - Free Demo: 1 blueprint lifetime per device (Full institutional access).
// - Plan A: Starter Founder (₹129 / mo — 5 blueprints / week).
// - Plan B: Scale Founder (₹299 / mo — 10 blueprints / week).
// - Integrated Razorpay Checkout: Scan UPI QR, GPay, PhonePe, Paytm, or Cards.
// - Supports Early Access Voucher (e.g. FOUNDER_PASS) for invited testers.
// ---------------------------------------------------------------------------
import { useState } from "react";
import {
  X,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
  Ticket,
  QrCode,
  Smartphone,
  CreditCard,
  Building2,
  ArrowRight,
} from "lucide-react";
import { upgradeUserToPro, getDeviceId } from "../lib/quotaManager.js";
import { initiateRazorpayPayment } from "../lib/razorpay.js";

export default function PaymentModal({
  isOpen,
  onClose,
  currentUser,
  onPaymentSuccess = () => {},
}) {
  const [selectedPlan, setSelectedPlan] = useState("starter_129");
  const [activeTab, setActiveTab] = useState("plans"); // 'plans' | 'voucher'
  const [voucherCode, setVoucherCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);
  const [activatedSub, setActivatedSub] = useState(null);

  if (!isOpen) return null;

  const currentPrice = selectedPlan === "scale_299" ? 299 : 129;
  const currentWeeklyLimit = selectedPlan === "scale_299" ? 10 : 5;
  const currentPlanName = selectedPlan === "scale_299" ? "Scale Founder" : "Starter Founder";

  async function handlePayWithRazorpay() {
    setError("");
    setIsProcessing(true);

    try {
      await initiateRazorpayPayment({
        planId: selectedPlan,
        currentUser,
        onSuccess: (sub) => {
          setIsProcessing(false);
          setActivatedSub(sub);
          setUnlockedSuccess(true);
          onPaymentSuccess(sub);
          window.dispatchEvent(new CustomEvent("quota-updated", { detail: sub }));
        },
        onError: (errMsg) => {
          setIsProcessing(false);
          if (errMsg && !errMsg.includes("cancelled")) {
            setError(errMsg);
          }
        },
      });
    } catch (err) {
      setIsProcessing(false);
      setError(err.message || "Could not initiate payment. Please try again.");
    }
  }

  async function handleRedeemVoucher(e) {
    e?.preventDefault();
    setError("");

    const rawCode = (voucherCode || "").trim().toUpperCase();
    const code = rawCode.replace(/[\s\-_]+/g, "_");
    if (!code) {
      setError("Please enter your invitation or founder voucher code.");
      return;
    }

    const validCodes = ["FOUNDER_PASS", "IDEAPULSE2026", "BETA_PRO", "VIP_FOUNDER"];
    if (!validCodes.includes(code)) {
      setError("Invalid voucher code. Enter FOUNDER_PASS for instant testing access.");
      return;
    }

    setIsProcessing(true);
    try {
      const sub = await upgradeUserToPro(currentUser?.id, {
        paymentMethod: "VOUCHER",
        paymentId: `VOUCHER-${code}`,
        voucherCode: code,
        isUnlimited: true,
      });
      setIsProcessing(false);
      setActivatedSub(sub);
      setUnlockedSuccess(true);
      onPaymentSuccess(sub);
      window.dispatchEvent(new CustomEvent("quota-updated", { detail: sub }));
    } catch {
      setIsProcessing(false);
      setError("Activation failed. Please check your network and retry.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[94vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-black text-xs shadow-xs">
              LP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                  LaunchPilot Founder Upgrade
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  Instant UPI
                </span>
              </div>
              <p className="text-[11px] text-slate-500">1 Demo Idea Per Device Used · Upgrade to unlock weekly access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {unlockedSuccess ? (
          /* Success Screen */
          <div className="p-7 sm:p-9 text-center space-y-5 animate-fade-in my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Plan Unlocked Successfully!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Payment verified. Your account and device have been upgraded with full weekly blueprint access.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>Active Plan:</span>
                <span className="font-bold text-slate-900">{activatedSub?.planName || currentPlanName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Weekly Blueprint Limit:</span>
                <span className="font-bold text-emerald-600">{activatedSub?.weeklyLimit || currentWeeklyLimit} Blueprints / Week</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Reference:</span>
                <span className="font-mono text-slate-700">{activatedSub?.paymentId || "Verified"}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Access:</span>
                <span className="text-emerald-700 font-bold">All 12 AI Specialists + War Room Unlocked</span>
              </div>
            </div>

            <button
              onClick={() => {
                setUnlockedSuccess(false);
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Back to Studio & Validate Startups</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Selection & Checkout View */
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
              <button
                type="button"
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  activeTab === "plans"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("plans")}
              >
                Choose Subscription
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  activeTab === "voucher"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("voucher")}
              >
                Have a Voucher Pass?
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            {activeTab === "plans" ? (
              <div className="space-y-4">
                {/* 2 Plan Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Plan 1: Starter (₹129) */}
                  <div
                    onClick={() => setSelectedPlan("starter_129")}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === "starter_129"
                        ? "border-orange-500 bg-orange-50/40 shadow-xs ring-1 ring-orange-500"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Starter</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === "starter_129" ? "border-orange-600 bg-orange-600" : "border-slate-300"}`}>
                        {selectedPlan === "starter_129" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">₹129</span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>
                    <p className="mt-1 text-[11px] font-bold text-orange-700">
                      5 Blueprints per week
                    </p>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                      <li className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>All 12 Specialist Co-Founders</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>3-AI VC War Room Debate</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>PDF & PRD Dossier Export</span>
                      </li>
                    </ul>
                  </div>

                  {/* Plan 2: Scale (₹299) */}
                  <div
                    onClick={() => setSelectedPlan("scale_299")}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPlan === "scale_299"
                        ? "border-orange-500 bg-orange-50/40 shadow-xs ring-1 ring-orange-500"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white shadow-xs">
                      Popular
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Scale Founder</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === "scale_299" ? "border-orange-600 bg-orange-600" : "border-slate-300"}`}>
                        {selectedPlan === "scale_299" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">₹299</span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>
                    <p className="mt-1 text-[11px] font-bold text-orange-700">
                      10 Blueprints per week
                    </p>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                      <li className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>Everything in Starter</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>Priority Multi-Agent Inference</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>Extended Co-Founder Chat</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Razorpay UPI Action */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <QrCode size={15} className="text-orange-600" />
                      <span>Instant UPI QR, GPay, PhonePe, Cards</span>
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{currentPrice} <span className="text-[10px] text-slate-500 font-normal">/ mo</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handlePayWithRazorpay}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone size={16} />
                        <span>Pay ₹{currentPrice} & Unlock {currentWeeklyLimit} Ideas/Week</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-600" /> 256-Bit SSL Secured
                    </span>
                    <span>•</span>
                    <span>Razorpay Verified</span>
                    <span>•</span>
                    <span>Direct UPI Auto-Credit</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Voucher Pass Tab */
              <form onSubmit={handleRedeemVoucher} className="space-y-4">
                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/70 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-950">
                    <Ticket size={16} className="text-orange-600" />
                    <span>Founder Invitation / Early Access Pass</span>
                  </div>
                  <p className="text-[11px] text-orange-900/80 leading-relaxed">
                    If you received an early invitation pass (such as <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-orange-200">FOUNDER_PASS</code>), enter it below to unlock testing access.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="voucher-code" className="text-xs font-bold text-slate-700 block">
                    Voucher Code
                  </label>
                  <input
                    id="voucher-code"
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FOUNDER_PASS"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !voucherCode.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={15} />}
                  <span>Redeem Pass & Activate</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
