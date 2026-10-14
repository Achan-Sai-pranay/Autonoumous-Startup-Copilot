// lib/razorpay.js
// ---------------------------------------------------------------------------
// Razorpay Standard Checkout & UPI Integration for LaunchPilot:
// - Loads https://checkout.razorpay.com/v1/checkout.js on demand
// - Communicates with backend /api/razorpay/create-order & verify-payment
// - Supports instant UPI QR code scanning, PhonePe, Google Pay, Paytm, Cards
// ---------------------------------------------------------------------------
import { upgradeUserToPro, getDeviceId } from "./quotaManager.js";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const rawApiUrl = isLocalhost
  ? (import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5001/api/generate-blueprint")
  : (import.meta.env.VITE_API_URL || "https://ideapulse-y1n5.onrender.com/api/generate-blueprint");

const BASE_API = rawApiUrl.replace(/\/api\/[a-zA-Z0-9_-]+$/, "");

/**
 * Dynamically injects Razorpay Checkout script if not already loaded.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("Failed to load Razorpay checkout script.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay checkout for the selected plan.
 * @param {Object} options
 * @param {'starter_129'|'scale_299'} options.planId
 * @param {Object} options.currentUser
 * @param {Function} options.onSuccess
 * @param {Function} options.onError
 */
export async function initiateRazorpayPayment({
  planId = "starter_129",
  currentUser = null,
  onSuccess = () => {},
  onError = () => {},
}) {
  const isScriptLoaded = await loadRazorpayScript();
  const deviceId = getDeviceId();

  const planMeta = {
    starter_129: { amount: 129, name: "Starter Founder (5 ideas/week)", limit: 5 },
    scale_299: { amount: 299, name: "Scale Founder (10 ideas/week)", limit: 10 },
  }[planId] || { amount: 129, name: "Starter Founder (5 ideas/week)", limit: 5 };

  let orderData = null;
  try {
    const res = await fetch(`${BASE_API}/api/razorpay/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        userId: currentUser?.id || "guest",
        email: currentUser?.email || "",
        name: currentUser?.name || "Startup Founder",
        deviceId,
      }),
    });

    if (res.ok) {
      orderData = await res.json();
    }
  } catch (err) {
    console.warn("Could not reach backend Razorpay order route, using fallback checkout:", err);
  }

  // If Razorpay SDK loaded and we have a valid key or order
  if (isScriptLoaded && window.Razorpay && orderData?.keyId && !orderData.keyId.includes("placeholder")) {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: "INR",
      name: "LaunchPilot AI",
      description: planMeta.name,
      image: "/images/icon.svg",
      order_id: orderData.orderId,
      prefill: {
        name: currentUser?.name || "",
        email: currentUser?.email || "",
      },
      theme: {
        color: "#ea580c", // Brand terracotta/orange
      },
      handler: async function (response) {
        try {
          // Verify with backend
          const verifyRes = await fetch(`${BASE_API}/api/razorpay/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              userId: currentUser?.id,
              deviceId,
            }),
          });

          const sub = await upgradeUserToPro(currentUser?.id, {
            paymentMethod: "RAZORPAY",
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            planId,
            verifiedTransaction: true,
            weeklyLimit: planMeta.limit,
          });

          onSuccess(sub);
        } catch (err) {
          onError(err.message || "Payment verification failed.");
        }
      },
      modal: {
        ondismiss: function () {
          onError("Payment cancelled by user.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    return;
  }

  // Demo / Test Mode Simulator (When Live Razorpay Keys are pending in backend/.env)
  // This allows the founder and reviewers to test the entire unlocked flow without payment friction.
  const simulateConfirm = window.confirm(
    `[LaunchPilot Razorpay Gateway Demo]\n\nPlan: ${planMeta.name}\nAmount: ₹${planMeta.amount}\n\nRazorpay keys are ready to be connected in backend/.env.\n\nClick "OK" to simulate a successful UPI QR payment of ₹${planMeta.amount} and unlock your 5 or 10 weekly blueprints immediately!`
  );

  if (simulateConfirm) {
    try {
      const mockPayId = `pay_sim_${Date.now().toString(36)}`;
      const sub = await upgradeUserToPro(currentUser?.id, {
        paymentMethod: "RAZORPAY",
        paymentId: mockPayId,
        orderId: `order_sim_${Date.now().toString(36)}`,
        planId,
        verifiedTransaction: true,
        weeklyLimit: planMeta.limit,
      });
      onSuccess(sub);
    } catch (err) {
      onError(err.message);
    }
  } else {
    onError("Payment cancelled.");
  }
}
