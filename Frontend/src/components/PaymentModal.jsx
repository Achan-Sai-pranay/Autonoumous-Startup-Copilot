// components/PaymentModal.jsx
// ---------------------------------------------------------------------------
// LaunchPilot Upgrade & Razorpay UPI Payment Modal (Apple-style redesign)
// - Free Demo: 1 blueprint lifetime per device (Full institutional access).
// - Plan A: Starter Founder (₹129 / mo — 5 blueprints / week).
// - Plan B: Scale Founder (₹299 / mo — 10 blueprints / week).
// - Integrated Razorpay Checkout: Scan UPI QR, GPay, PhonePe, Paytm, or Cards.
// - Supports Early Access Voucher (e.g. FOUNDER_PASS) for invited testers.
// Styling: auth.css (shared tokens) + payment.css
// ---------------------------------------------------------------------------
import { useState, useEffect } from "react";
import {
  X,
  Check,
  Zap,
  ShieldCheck,
  Loader2,
  Ticket,
  QrCode,
  Smartphone,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { upgradeUserToPro, getDeviceId } from "../lib/quotaManager.js";
import { initiateRazorpayPayment } from "../lib/razorpay.js";
import "../styles/auth.css";
import "../styles/payment.css";

const PLANS = {
  starter_129: {
    tab: "Starter",
    name: "Starter Founder",
    price: 129,
    limit: 5,
    popular: false,
    features: [
      "All 12 Specialist Co-Founders",
      "3-AI VC War Room Debate",
      "PDF & PRD Dossier Export",
    ],
  },
  scale_299: {
    tab: "Scale Founder",
    name: "Scale Founder",
    price: 299,
    limit: 10,
    popular: true,
    features: [
      "Everything in Starter",
      "Priority Multi-Agent Inference",
      "Extended Co-Founder Chat",
    ],
  },
};

export default function PaymentModal({
  isOpen,
  onClose,
  currentUser,
  onPaymentSuccess = () => {},
  theme = "light", // "light" | "dark"
}) {
  const [selectedPlan, setSelectedPlan] = useState("starter_129");
  const [activeTab, setActiveTab] = useState("plans"); // 'plans' | 'voucher'
  const [voucherCode, setVoucherCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);
  const [activatedSub, setActivatedSub] = useState(null);

  // Esc to close + lock page scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const plan = PLANS[selectedPlan];
  const currentPrice = plan.price;
  const currentWeeklyLimit = plan.limit;
  const currentPlanName = plan.name;

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
    <div
      className="ax-overlay"
      data-theme={theme}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ax-card px-card" role="dialog" aria-modal="true" aria-labelledby="px-title">
        {/* Header */}
        <div className="ax-head">
          <div className="px-brand">
            <span className="px-brand-mark">LP</span>
            <div>
              <div className="px-title-row">
                <span className="px-title" id="px-title">LaunchPilot Founder Upgrade</span>
                <span className="px-pill">Instant UPI</span>
              </div>
              <p className="px-caption">
                1 Demo Idea Per Device Used · Upgrade to unlock weekly access
              </p>
            </div>
          </div>
          <button type="button" className="ax-close" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {unlockedSuccess ? (
          /* ---------------- Success ---------------- */
          <div className="ax-body px-success">
            <svg className="px-ring" viewBox="0 0 76 76" aria-hidden="true">
              <circle cx="38" cy="38" r="30" />
              <path d="M26 39l9 9 16-18" />
            </svg>
            <h3>Plan Unlocked Successfully!</h3>
            <p>
              Payment verified. Your account and device have been upgraded with full weekly
              blueprint access.
            </p>

            <dl className="px-list">
              <div>
                <dt>Active Plan</dt>
                <dd>{activatedSub?.planName || currentPlanName}</dd>
              </div>
              <div>
                <dt>Weekly Blueprint Limit</dt>
                <dd className="is-good">
                  {activatedSub?.weeklyLimit || currentWeeklyLimit} Blueprints / Week
                </dd>
              </div>
              <div>
                <dt>Payment Reference</dt>
                <dd className="is-mono">{activatedSub?.paymentId || "Verified"}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd className="is-good">All 12 AI Specialists + War Room Unlocked</dd>
              </div>
            </dl>

            <button
              type="button"
              className="ax-primary"
              onClick={() => {
                setUnlockedSuccess(false);
                onClose();
              }}
            >
              <span>Back to Studio &amp; Validate Startups</span>
              <ArrowRight size={15} className="ax-arrow" />
            </button>
          </div>
        ) : (
          /* ---------------- Selection & Checkout ---------------- */
          <div className="ax-body">
            {/* Main tabs */}
            <div className="ax-seg" role="tablist" data-pos={activeTab === "voucher" ? 1 : 0}>
              <span className="ax-seg-pill" />
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "plans"}
                onClick={() => {
                  setActiveTab("plans");
                  setError("");
                }}
              >
                Choose Subscription
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "voucher"}
                onClick={() => {
                  setActiveTab("voucher");
                  setError("");
                }}
              >
                Have a Voucher Pass?
              </button>
            </div>

            {error && (
              <div className="ax-error" role="alert" key={error}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {activeTab === "plans" ? (
              <>
                {/* Plan switcher */}
                <div
                  className="ax-seg"
                  role="radiogroup"
                  aria-label="Plan"
                  data-pos={selectedPlan === "scale_299" ? 1 : 0}
                  style={{ marginBottom: 0 }}
                >
                  <span className="ax-seg-pill" />
                  {Object.entries(PLANS).map(([id, p]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={selectedPlan === id}
                      aria-selected={selectedPlan === id}
                      className="px-seg-plan"
                      onClick={() => setSelectedPlan(id)}
                    >
                      <span>{p.tab}</span>
                      <em>₹{p.price}</em>
                    </button>
                  ))}
                </div>

                {/* Selected plan detail */}
                <div className="px-panel" key={selectedPlan}>
                  <div className="px-panel-top">
                    <div className="px-price">
                      ₹{plan.price}
                      <span className="px-per">/ month</span>
                    </div>
                    <div className="px-chips">
                      {plan.popular && <span className="px-chip px-chip--solid">Popular</span>}
                      <span className="px-chip">{plan.limit} Blueprints per week</span>
                    </div>
                  </div>
                  <ul className="px-feats">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <span className="px-tick">
                          <Check size={11} strokeWidth={3.2} />
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Razorpay checkout dock */}
                <div className="px-dock">
                  <div className="px-dock-row">
                    <span className="px-methods">
                      <QrCode size={16} />
                      <span>Instant UPI QR, GPay, PhonePe, Cards</span>
                    </span>
                    <span className="px-total">
                      ₹{currentPrice} <small>/ mo</small>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="ax-primary"
                    onClick={handlePayWithRazorpay}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="ax-spin" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone size={16} />
                        <span>
                          Pay ₹{currentPrice} &amp; Unlock {currentWeeklyLimit} Ideas/Week
                        </span>
                      </>
                    )}
                  </button>

                  <div className="px-trust">
                    <span>
                      <ShieldCheck size={13} /> 256-Bit SSL Secured
                    </span>
                    <span>Razorpay Verified</span>
                    <span>Direct UPI Auto-Credit</span>
                  </div>
                </div>
              </>
            ) : (
              /* ---------------- Voucher ---------------- */
              <form className="px-ticket" onSubmit={handleRedeemVoucher} noValidate>
                <div className="px-ticket-top">
                  <span className="px-ticket-icon">
                    <Ticket size={20} />
                  </span>
                  <div>
                    <h4 className="px-ticket-title">Founder Invitation / Early Access Pass</h4>
                    <p className="px-ticket-copy">
                      If you received an early invitation pass (such as{" "}
                      <span className="px-code">FOUNDER_PASS</span>), enter it below to unlock
                      testing access.
                    </p>
                  </div>
                </div>

                <div className="px-perf" />

                <div className="px-ticket-bottom">
                  <label htmlFor="voucher-code" className="ax-label">
                    Voucher Code
                  </label>
                  <div className="px-coupon">
                    <input
                      id="voucher-code"
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FOUNDER_PASS"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="submit"
                      className="px-redeem"
                      disabled={isProcessing || !voucherCode.trim()}
                    >
                      {isProcessing ? (
                        <Loader2 size={15} className="ax-spin" />
                      ) : (
                        <Zap size={14} />
                      )}
                      <span>Redeem Pass &amp; Activate</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
