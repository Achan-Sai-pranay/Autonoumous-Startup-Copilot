// lib/quotaManager.js
// ---------------------------------------------------------------------------
// LaunchPilot Quota & Subscription Tier Manager:
// - Free Tier: Exactly 1 Demo Blueprint lifetime PER DEVICE (Locked after 1 idea).
// - Starter Plan: ₹129 / month — 5 blueprints per rolling 7-day week.
// - Scale Plan: ₹299 / month — 10 blueprints per rolling 7-day week.
// - VIP Founder: Unlimited blueprints (Voucher: FOUNDER_PASS).
// ---------------------------------------------------------------------------
import { getHistory } from "./projectHistory.js";
import { account, isAppwriteConfigured } from "./appwrite.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const FREE_DEVICE_LIFETIME_LIMIT = 1;
export const PLAN_STARTER_LIMIT = 5;
export const PLAN_SCALE_LIMIT = 10;
export const PRO_UNLIMITED_LIMIT = 100;
export const FREE_WEEKLY_LIMIT = 1; // Backwards compatibility for external tests

export const PLANS = {
  starter: {
    id: "starter_129",
    name: "Starter Founder",
    priceInr: 129,
    weeklyLimit: PLAN_STARTER_LIMIT,
    description: "5 startup blueprints / week + full AI suite",
  },
  scale: {
    id: "scale_299",
    name: "Scale Founder",
    priceInr: 299,
    weeklyLimit: PLAN_SCALE_LIMIT,
    description: "10 startup blueprints / week + priority AI queue",
  },
};

const PRO_STORAGE_PREFIX = "ideapulse_pro_tier_";
export const VALID_VOUCHERS = ["FOUNDER_PASS", "IDEAPULSE2026", "BETA_PRO", "VIP_FOUNDER"];

export function normalizeVoucherCode(code) {
  if (!code || typeof code !== "string") return "";
  return code.trim().toUpperCase().replace(/[\s\-_]+/g, "_");
}

/**
 * Generates and permanently persists a unique hardware/browser device fingerprint
 * across localStorage and cookies to prevent logging out and creating new emails.
 */
export function getDeviceId() {
  if (typeof window === "undefined") return "server_device";
  let devId = "";
  try {
    devId = localStorage.getItem("lp_device_fingerprint") || "";
  } catch {
    // ignore
  }

  if (!devId) {
    const match = typeof document !== "undefined" && document.cookie ? document.cookie.match(/lp_dev_id=([^;]+)/) : null;
    if (match) devId = match[1];
  }

  if (!devId) {
    const screenPart = typeof window !== "undefined" && window.screen ? `${window.screen.width}x${window.screen.height}` : "default";
    const navPart = typeof navigator !== "undefined" ? `${navigator.hardwareConcurrency || 2}-${(navigator.language || "en").slice(0, 2)}` : "sys";
    const randomSeed = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    devId = `lp_${screenPart}_${navPart}_${randomSeed}`;

    try {
      localStorage.setItem("lp_device_fingerprint", devId);
      if (typeof document !== "undefined") {
        document.cookie = `lp_dev_id=${devId}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // ignore
    }
  }
  return devId;
}

/**
 * Returns how many free lifetime demo blueprints have been created on this device.
 */
export function getDeviceFreeUsed() {
  if (typeof window === "undefined") return 0;
  const devId = getDeviceId();
  let count = 0;
  try {
    const raw = localStorage.getItem(`lp_dev_used_${devId}`) || localStorage.getItem("lp_device_free_used");
    count = parseInt(raw || "0", 10);
    if (isNaN(count)) count = 0;
  } catch {
    count = 0;
  }
  return count;
}

/**
 * Marks that this device has consumed a free demo blueprint.
 */
export function recordDeviceFreeUsage() {
  if (typeof window === "undefined") return 1;
  const devId = getDeviceId();
  const next = getDeviceFreeUsed() + 1;
  try {
    localStorage.setItem(`lp_dev_used_${devId}`, String(next));
    localStorage.setItem("lp_device_free_used", String(next));
    if (typeof document !== "undefined") {
      document.cookie = `lp_dev_used_cnt=${next}; path=/; max-age=31536000; SameSite=Lax`;
    }
  } catch {
    // ignore
  }
  return next;
}

export function isUserPro(userId, userPrefs = null) {
  // 1. Check user preferences from Appwrite Cloud if available
  if (userPrefs?.isPro) {
    if (!userPrefs.proExpiresAt || new Date(userPrefs.proExpiresAt).getTime() > Date.now()) {
      return true;
    }
  }

  // 2. Check local storage for user account
  const key = `${PRO_STORAGE_PREFIX}${userId || "guest"}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.isUnlimited || data?.voucherCode?.toUpperCase()?.includes("FOUNDER")) {
        return true;
      }
      if (data?.expiresAt && new Date(data.expiresAt).getTime() > Date.now()) {
        return true;
      }
    }
  } catch {
    // ignore
  }

  // 3. Check if current device has an active paid subscription
  try {
    const devId = getDeviceId();
    const devRaw = localStorage.getItem(`lp_device_sub_${devId}`);
    if (devRaw) {
      const devData = JSON.parse(devRaw);
      if (devData?.expiresAt && new Date(devData.expiresAt).getTime() > Date.now()) {
        return true;
      }
    }
  } catch {
    // ignore
  }

  return false;
}

export function isUserScaleFounder(userId, userPrefs = null) {
  if (userPrefs?.planId === "scale_299" || userPrefs?.planId === "founder_pass_unlimited") {
    return true;
  }
  const sub = getProSubscription(userId);
  if (!sub) return false;
  return (
    sub.planId === "scale_299" ||
    sub.planId === "founder_pass_unlimited" ||
    sub.isUnlimited ||
    sub.voucherCode?.toUpperCase()?.includes("FOUNDER")
  );
}

export function getProSubscription(userId) {
  const key = `${PRO_STORAGE_PREFIX}${userId || "guest"}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.isUnlimited || data?.voucherCode?.toUpperCase()?.includes("FOUNDER")) {
        return data;
      }
      if (data?.expiresAt && new Date(data.expiresAt).getTime() > Date.now()) {
        return data;
      }
    }
  } catch {
    // ignore
  }

  // Fallback to device-level subscription
  try {
    const devId = getDeviceId();
    const devRaw = localStorage.getItem(`lp_device_sub_${devId}`);
    if (devRaw) {
      const devData = JSON.parse(devRaw);
      if (devData?.expiresAt && new Date(devData.expiresAt).getTime() > Date.now()) {
        return devData;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export async function upgradeUserToPro(userId, details = {}) {
  const key = `${PRO_STORAGE_PREFIX}${userId || "guest"}`;
  const devId = getDeviceId();
  const quotaKey = `ideapulse_quota_${userId || "guest"}`;
  const now = Date.now();

  const rawCode = normalizeVoucherCode(details.voucherCode || "");
  const isVoucherValid = Boolean(rawCode && VALID_VOUCHERS.includes(rawCode));
  const isRazorpayVerified = Boolean(details.paymentMethod === "RAZORPAY" && (details.paymentId || details.verifiedTransaction));
  const isVerifiedTx = Boolean(details.verifiedTransaction || details.paymentId?.startsWith("PAY-VERIFIED-") || details.paymentId?.startsWith("VOUCHER-") || isRazorpayVerified);

  if (!isVoucherValid && !isVerifiedTx) {
    throw new Error("Upgrade requires a verified Razorpay payment or early access voucher.");
  }

  const isFounder = isVoucherValid || details.isUnlimited || rawCode.includes("FOUNDER");
  const selectedPlanId = details.planId === "scale_299" ? "scale_299" : (isFounder ? "founder_pass_unlimited" : "starter_129");
  const weeklyLimit = selectedPlanId === "scale_299" ? PLAN_SCALE_LIMIT : (isFounder ? 9999 : PLAN_STARTER_LIMIT);
  const priceInr = selectedPlanId === "scale_299" ? 299 : (isFounder ? 0 : 129);
  const planName = isFounder
    ? "VIP Founder (Unlimited)"
    : selectedPlanId === "scale_299"
    ? "Scale Founder (10 ideas/wk)"
    : "Starter Founder (5 ideas/wk)";

  const subscription = {
    planId: selectedPlanId,
    planName,
    priceInr,
    weeklyLimit,
    activatedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + (isFounder ? 365 * 24 * 60 * 60 * 1000 : THIRTY_DAYS_MS)).toISOString(),
    paymentMethod: details.paymentMethod || (isVoucherValid ? "VOUCHER" : "RAZORPAY"),
    paymentId: details.paymentId || (isVoucherValid ? `VOUCHER-${rawCode}` : `RZP-${Date.now().toString(36).toUpperCase()}`),
    orderId: details.orderId || undefined,
    voucherCode: isVoucherValid ? rawCode : undefined,
    isUnlimited: isFounder,
    status: "active",
  };

  try {
    localStorage.setItem(key, JSON.stringify(subscription));
    localStorage.setItem(`lp_device_sub_${devId}`, JSON.stringify(subscription));
    localStorage.removeItem(quotaKey);
    localStorage.setItem(quotaKey, JSON.stringify({ used: 0, periodStart: now, isUnlimited: isFounder }));
  } catch (err) {
    console.warn("Could not save pro subscription locally:", err);
  }

  // Sync entitlement to Appwrite Cloud preferences for cross-domain / cross-device persistence
  if (userId && isAppwriteConfigured()) {
    try {
      await account.updatePrefs({
        isPro: true,
        proExpiresAt: subscription.expiresAt,
        proPlan: subscription.planId,
        weeklyLimit,
        isFounder,
      });
    } catch (err) {
      console.debug("Notice: Could not persist Pro status to Appwrite prefs:", err?.message || err);
    }
  }

  window.dispatchEvent(new CustomEvent("quota-updated", { detail: subscription }));
  return subscription;
}

export function resetUserQuota(userId) {
  const quotaKey = `ideapulse_quota_${userId || "guest"}`;
  try {
    localStorage.removeItem(quotaKey);
  } catch {
    // ignore
  }
}

/**
 * Returns current quota state.
 * Enforces:
 * - Free Tier: Exactly 1 demo blueprint per device (Locked once used).
 * - Starter Tier: 5 blueprints per week (₹129/mo).
 * - Scale Tier: 10 blueprints per week (₹299/mo).
 */
export function getWeeklyUsage(userId, historyList = null) {
  const devId = getDeviceId();
  const sub = getProSubscription(userId);
  const isFounder = Boolean(
    sub?.isUnlimited ||
    sub?.planId === "founder_pass_unlimited" ||
    sub?.voucherCode?.toUpperCase()?.replace(/[\s\-_]+/g, "_")?.includes("FOUNDER") ||
    sub?.paymentId?.toUpperCase()?.includes("FOUNDER")
  );
  const isPro = isUserPro(userId) || isFounder;

  // 1. VIP Founder Pass holders (Unlimited)
  if (isFounder) {
    return {
      used: 0,
      total: 9999,
      remaining: 9999,
      isPro: true,
      isFounder: true,
      isUnlimited: true,
      isLocked: false,
      planId: "founder_pass_unlimited",
      planName: "VIP Founder (Unlimited)",
      priceInr: 0,
      deviceId: devId,
      resetsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
  }

  const now = Date.now();

  // 2. Pro Paid Subscribers (Starter = 5/wk, Scale = 10/wk)
  if (isPro) {
    const isScale = sub?.planId === "scale_299" || sub?.weeklyLimit === PLAN_SCALE_LIMIT;
    const weeklyLimit = isScale ? PLAN_SCALE_LIMIT : PLAN_STARTER_LIMIT;
    const planName = isScale ? "Scale Founder" : "Starter Founder";
    const priceInr = isScale ? 299 : 129;

    let storedUsed = 0;
    let periodStart = now;
    const key = `ideapulse_quota_${userId || "guest"}`;

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.periodStart && now - data.periodStart <= WEEK_MS) {
          storedUsed = data.used || 0;
          periodStart = data.periodStart;
        }
      }
    } catch {
      // ignore
    }

    // Also count blueprints in user history from the last 7 days
    let blueprintsCountInWeek = 0;
    const activeHistory = historyList || (typeof getHistory === "function" ? getHistory(userId) : []);
    if (Array.isArray(activeHistory)) {
      blueprintsCountInWeek = activeHistory.filter((item) => {
        if (!item || !item.createdAt) return false;
        const createdTime = new Date(item.createdAt).getTime();
        return !isNaN(createdTime) && now - createdTime <= WEEK_MS;
      }).length;
    }

    const effectiveUsed = Math.max(storedUsed, blueprintsCountInWeek);
    const remaining = Math.max(0, weeklyLimit - effectiveUsed);
    const resetsAt = new Date(periodStart + WEEK_MS);

    return {
      used: effectiveUsed,
      total: weeklyLimit,
      remaining,
      isPro: true,
      isFounder: false,
      isUnlimited: false,
      isLocked: remaining <= 0,
      planId: isScale ? "scale_299" : "starter_129",
      planName,
      priceInr,
      weeklyLimit,
      deviceId: devId,
      resetsAt,
    };
  }

  // 3. Free Tier: EXACTLY 1 DEMO IDEA LIFETIME PER DEVICE
  const devUsed = getDeviceFreeUsed();
  let historyUsed = 0;
  const activeHistory = historyList || (typeof getHistory === "function" ? getHistory(userId) : []);
  if (Array.isArray(activeHistory)) {
    historyUsed = activeHistory.length;
  }

  const totalUsed = Math.max(devUsed, historyUsed);
  const remaining = Math.max(0, FREE_DEVICE_LIFETIME_LIMIT - totalUsed);
  const isLocked = remaining <= 0;

  return {
    used: totalUsed >= 1 ? 1 : 0,
    total: FREE_DEVICE_LIFETIME_LIMIT,
    remaining,
    isPro: false,
    isFounder: false,
    isUnlimited: false,
    isLocked,
    planId: "free_demo",
    planName: isLocked ? "Free Demo (Locked)" : "Free Demo (1 Idea)",
    priceInr: 0,
    deviceId: devId,
    resetsAt: null, // Lifetime per device, does not reset weekly
  };
}

export function incrementWeeklyUsage(userId, historyList = null) {
  const currentUsage = getWeeklyUsage(userId, historyList);
  if (currentUsage.isUnlimited) return currentUsage;

  if (!currentUsage.isPro) {
    // Record lifetime device consumption for free tier
    recordDeviceFreeUsage();
    return getWeeklyUsage(userId, historyList);
  }

  // For Pro subscribers, increment weekly usage count
  const key = `ideapulse_quota_${userId || "guest"}`;
  const now = Date.now();
  const updatedUsed = currentUsage.used + 1;
  const periodStart = currentUsage.resetsAt ? currentUsage.resetsAt.getTime() - WEEK_MS : now;

  try {
    localStorage.setItem(key, JSON.stringify({ used: updatedUsed, periodStart }));
  } catch {
    // ignore
  }

  return getWeeklyUsage(userId, historyList);
}
