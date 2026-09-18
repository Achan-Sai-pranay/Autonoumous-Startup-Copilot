// components/PaymentModal.jsx
// ---------------------------------------------------------------------------
// High-conversion checkout modal for IdeaPulse Pro Founder (₹149 / mo).
// Supports instant UPI, Cards, and NetBanking with live receipt generation.
// ---------------------------------------------------------------------------
import { useState } from "react";
import {
  X,
  Check,
  Zap,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { upgradeUserToPro } from "../lib/quotaManager.js";

export default function PaymentModal({
  isOpen,
  onClose,
  currentUser,
  onPaymentSuccess = () => {},
}) {
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi" | "card" | "netbanking"
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handlePay(e) {
    e?.preventDefault();
    setError("");

    if (paymentMethod === "upi" && (!upiId || !upiId.includes("@"))) {
      setError("Please enter a valid UPI ID (e.g., yourname@okhdfcbank).");
      return;
    }
    if (paymentMethod === "card") {
      const cleanNum = cardNumber.replace(/\s+/g, "");
      if (cleanNum.length < 15) {
        setError("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardExpiry || !cardExpiry.includes("/")) {
        setError("Please enter valid card expiry (MM/YY).");
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setError("Please enter a 3-digit CVV.");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate real gateway handshake (1.2s)
    setTimeout(() => {
      try {
        const sub = upgradeUserToPro(currentUser?.id, {
          paymentMethod: paymentMethod.toUpperCase(),
        });
        setReceipt(sub);
        setIsProcessing(false);
        setIsSuccess(true);
        onPaymentSuccess(sub);
      } catch (err) {
        setIsProcessing(false);
        setError("Payment processing failed. Please retry.");
      }
    }, 1200);
  }

  function handleDone() {
    setIsSuccess(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/70">
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

        {isSuccess ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner animate-scale-up">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Welcome to IdeaPulse Pro!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your account has been upgraded with 10 blueprints per week, priority AI inference, and unlimited Co-Founder chat.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Receipt Number:</span>
                <span className="font-bold text-slate-900">{receipt?.paymentId}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-600">₹149 / month</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Next Billing Cycle:</span>
                <span className="text-slate-800">
                  {receipt?.expiresAt ? new Date(receipt.expiresAt).toLocaleDateString() : "30 days"}
                </span>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              Back to Studio & Start Creating
            </button>
          </div>
        ) : (
          /* Checkout Screen */
          <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50/60 to-white border border-orange-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-orange-900 uppercase tracking-wide">
                  Monthly Subscription
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-slate-900">₹149</span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <span className="text-[11px] text-slate-500 block">Cancel anytime with 1-click</span>
              </div>
              <div className="text-right space-y-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  <Sparkles size={11} /> 10 Ideas / Wk
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
                <span>Priority fast streaming</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-orange-600 shrink-0" />
                <span>Unlimited YC Partner chat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-orange-600 shrink-0" />
                <span>Full PDF & PRD export suite</span>
              </div>
            </div>

            {/* Method Tabs */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "border-orange-500 bg-orange-50 text-orange-900 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <QrCode size={18} />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-orange-500 bg-orange-50 text-orange-900 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <CreditCard size={18} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === "netbanking"
                      ? "border-orange-500 bg-orange-50 text-orange-900 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Building2 size={18} />
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            {paymentMethod === "upi" && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                      UPI
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Scan QR or enter VPA</div>
                      <div className="text-[10px] text-slate-500">GPay, PhonePe, Paytm, CRED</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    Zero Fees
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Your UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. founder@okaxis or mobile@upi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 2222 3333 4444"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div className="space-y-2 pt-1 animate-fade-in">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Popular Banks
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setUpiId(`${bank.toLowerCase()}@netbanking`)}
                      className="p-2 rounded-lg border border-slate-200 hover:border-orange-500 text-left font-medium text-slate-700 hover:text-orange-700 text-[11px]"
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            {/* Pay CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authorizing ₹149 Securely...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Pay ₹149 & Activate Pro</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-600 mt-2.5">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>256-bit SSL encrypted • Instant activation • Cancel anytime</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
