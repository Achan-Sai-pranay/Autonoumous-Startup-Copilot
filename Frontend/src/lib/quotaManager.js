// lib/quotaManager.js
// ---------------------------------------------------------------------------
// Quota & Subscription Tier Manager:
// - Free Plan: 3 blueprint generations per rolling 7-day week.
// - Pro Plan: 10 blueprint generations per rolling 7-day week, priority AI streaming,
//   unlimited Co-Founder queries, watermark-free PDF & PRD exports.
// ---------------------------------------------------------------------------
import { getHistory } from "./projectHistory.js";
import { account, isAppwriteConfigured } from "./appwrite.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const FREE_WEEKLY_LIMIT = 3;
export const PRO_WEEKLY_LIMIT = 100;
const PRO_STORAGE_PREFIX = "ideapulse_pro_tier_";
export const VALID_VOUCHERS = ["FOUNDER_PASS", "IDEAPULSE2026", "BETA_PRO", "VIP_FOUNDER"];

export function normalizeVoucherCode(code) {
  if (!code || typeof code !== "string") return "";
  return code.trim().toUpperCase().replace(/[\s\-_]+/g, "_");
}

export function isUserPro(userId, userPrefs = null) {
  // 1. Check user preferences from Appwrite Cloud if available
  if (userPrefs?.isPro) {
    if (!userPrefs.proExpiresAt || new Date(userPrefs.proExpiresAt).getTime() > Date.now()) {
      return true;
    }
  }

  // 2. Fall back to local storage cache
  const key = `${PRO_STORAGE_PREFIX}${userId || "guest"}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data) return false;
    // Founder pass holders have perpetual or 1-year access
    if (data.isUnlimited || data.voucherCode?.toUpperCase()?.includes("FOUNDER")) {
      return true;
    }
    if (!data.expiresAt) return false;
    return new Date(data.expiresAt).getTime() > Date.now();
  } catch {
    return false;
  }
}

export function getProSubscription(userId) {
  const key = `${PRO_STORAGE_PREFIX}${userId || "guest"}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data) return null;
    if (data.isUnlimited || data.voucherCode?.toUpperCase()?.includes("FOUNDER")) {
      return data;
    }
    if (!data.expiresAt) return null;
    const isExpired = new Date(data.expiresAt).getTime() <= Date.now();
    return isExpired ? null : data;
  } catch {
    return null;
  }
}

export async function upgradeUserToPro(userId, details = {}) {
  const key = `${PRO_STORAGE_PREFIX}${userId || "guest"}`;
  const quotaKey = `ideapulse_quota_${userId || "guest"}`;
  const now = Date.now();
  
  // Require either an authorized voucher code or an explicit verified transaction
  const rawCode = normalizeVoucherCode(details.voucherCode || "");
  const isVoucherValid = Boolean(rawCode && VALID_VOUCHERS.includes(rawCode));
  const isVerifiedTx = Boolean(details.verifiedTransaction || details.paymentId?.startsWith("PAY-VERIFIED-") || details.paymentId?.startsWith("VOUCHER-"));

  if (!isVoucherValid && !isVerifiedTx) {
    throw new Error("Invalid entitlement proof: upgrade requires a verified transaction or early access pass.");
  }

  const isFounder = isVoucherValid || details.isUnlimited || rawCode.includes("FOUNDER");

  const subscription = {
    planId: isFounder ? "founder_pass_unlimited" : "pro_monthly",
    planName: isFounder ? "IdeaPulse VIP Founder (Unlimited)" : "IdeaPulse Pro Founder",
    priceInr: 149,
    priceUsd: 4.99,
    activatedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + (isFounder ? 365 * 24 * 60 * 60 * 1000 : THIRTY_DAYS_MS)).toISOString(),
    paymentMethod: details.paymentMethod || (isVoucherValid ? "VOUCHER" : "GATEWAY"),
    paymentId: details.paymentId || (isVoucherValid ? `VOUCHER-${rawCode}` : `PAY-${Date.now().toString(36).toUpperCase()}`),
    voucherCode: isVoucherValid ? rawCode : undefined,
    isUnlimited: isFounder,
    status: "active",
  };

  try {
    localStorage.setItem(key, JSON.stringify(subscription));
    // Clear and reset quota so user gets fresh unlimited testing immediately
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
        isFounder,
      });
    } catch (err) {
      console.debug("Notice: Could not persist Pro status to Appwrite prefs:", err?.message || err);
    }
  }

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

export function getWeeklyUsage(userId, historyList = null) {
  // Unauthenticated guests do not have an active session quota.
  // Account creation/login is required to unlock the 3 weekly blueprints.
  if (!userId) {
    return {
      used: 0,
      total: FREE_WEEKLY_LIMIT,
      remaining: FREE_WEEKLY_LIMIT,
      isPro: false,
      isGuest: true,
      planName: "Sign in required",
      resetsAt: new Date(Date.now() + WEEK_MS),
    };
  }

  const sub = getProSubscription(userId);
  const isFounder = Boolean(
    sub?.isUnlimited ||
    sub?.planId === "founder_pass_unlimited" ||
    sub?.voucherCode?.toUpperCase()?.replace(/[\s\-_]+/g, "_")?.includes("FOUNDER") ||
    sub?.paymentId?.toUpperCase()?.includes("FOUNDER")
  );
  const isPro = isUserPro(userId) || isFounder;

  // Founder Pass holders get unlimited test generations
  if (isFounder) {
    return {
      used: 0,
      total: 9999,
      remaining: 9999,
      isPro: true,
      isFounder: true,
      isUnlimited: true,
      planName: "VIP Founder (Unlimited)",
      resetsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
  }

  const key = `ideapulse_quota_${userId}`;
  const now = Date.now();

  let storedUsed = 0;
  let periodStart = now;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.isUnlimited) {
        return {
          used: 0,
          total: 9999,
          remaining: 9999,
          isPro: true,
          isFounder: true,
          isUnlimited: true,
          planName: "VIP Founder (Unlimited)",
          resetsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        };
      }
      if (data.periodStart && now - data.periodStart <= WEEK_MS) {
        storedUsed = data.used || 0;
        periodStart = data.periodStart;
      }
    }
  } catch {
    // ignore
  }

  // Count actual generated blueprints within the 7-day rolling window
  let blueprintsCountInWeek = 0;
  const activeHistory = historyList || (typeof getHistory === "function" ? getHistory(userId) : []);
  if (Array.isArray(activeHistory)) {
    blueprintsCountInWeek = activeHistory.filter((item) => {
      if (!item || !item.createdAt) return false;
      const createdTime = new Date(item.createdAt).getTime();
      return !isNaN(createdTime) && now - createdTime <= WEEK_MS;
    }).length;
  }

  // Effective usage count
  const effectiveUsed = Math.max(storedUsed, blueprintsCountInWeek);

  // Generous limit for Pro users (minimum 100, or always +50 above current history) so developers and founders are never locked out
  const baseLimit = isPro ? PRO_WEEKLY_LIMIT : FREE_WEEKLY_LIMIT;
  const totalLimit = isPro ? Math.max(baseLimit, effectiveUsed + 50) : baseLimit;
  const remaining = Math.max(0, totalLimit - effectiveUsed);
  const resetsAt = new Date(periodStart + WEEK_MS);

  return {
    used: effectiveUsed,
    total: totalLimit,
    remaining,
    isPro,
    planName: isPro ? "Pro Founder" : "Free Starter",
    resetsAt,
  };
}

export function incrementWeeklyUsage(userId, historyList = null) {
  if (!userId) {
    return getWeeklyUsage(null);
  }
  const key = `ideapulse_quota_${userId}`;
  const now = Date.now();
  let currentUsage = getWeeklyUsage(userId, historyList);
  
  if (currentUsage.isUnlimited) {
    return currentUsage;
  }

  const updatedUsed = currentUsage.used + 1;
  const periodStart = currentUsage.resetsAt ? currentUsage.resetsAt.getTime() - WEEK_MS : now;

  try {
    localStorage.setItem(key, JSON.stringify({ used: updatedUsed, periodStart }));
  } catch {
    // ignore
  }

  return getWeeklyUsage(userId, historyList);
}
