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
export const PRO_WEEKLY_LIMIT = 10;
const PRO_STORAGE_PREFIX = "ideapulse_pro_tier_";

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
    if (!data || !data.expiresAt) return false;
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
    if (!data || !data.expiresAt) return null;
    const isExpired = new Date(data.expiresAt).getTime() <= Date.now();
    return isExpired ? null : data;
  } catch {
    return null;
  }
}

export async function upgradeUserToPro(userId, details = {}) {
  const key = `${PRO_STORAGE_PREFIX}${userId || "guest"}`;
  const now = Date.now();
  
  // Require either an authorized voucher code or an explicit verified transaction
  const validVouchers = ["FOUNDER_PASS", "IDEAPULSE2026", "BETA_PRO", "VIP_FOUNDER"];
  const isVoucherValid = details.voucherCode && validVouchers.includes(details.voucherCode.toUpperCase());
  const isVerifiedTx = Boolean(details.verifiedTransaction || details.paymentId?.startsWith("PAY-VERIFIED-") || details.paymentId?.startsWith("VOUCHER-"));

  if (!isVoucherValid && !isVerifiedTx) {
    throw new Error("Invalid entitlement proof: upgrade requires a verified transaction or early access pass.");
  }

  const subscription = {
    planId: "pro_monthly",
    planName: "IdeaPulse Pro Founder",
    priceInr: 149,
    priceUsd: 4.99,
    activatedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + THIRTY_DAYS_MS).toISOString(),
    paymentMethod: details.paymentMethod || (isVoucherValid ? "VOUCHER" : "GATEWAY"),
    paymentId: details.paymentId || (isVoucherValid ? `VOUCHER-${details.voucherCode}` : `PAY-${Date.now().toString(36).toUpperCase()}`),
    status: "active",
  };

  try {
    localStorage.setItem(key, JSON.stringify(subscription));
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
      });
    } catch (err) {
      console.debug("Notice: Could not persist Pro status to Appwrite prefs:", err?.message || err);
    }
  }

  return subscription;
}

export function getWeeklyUsage(userId, historyList = null) {
  const isPro = isUserPro(userId);
  const totalLimit = isPro ? PRO_WEEKLY_LIMIT : FREE_WEEKLY_LIMIT;
  const key = `ideapulse_quota_${userId || "guest"}`;
  const now = Date.now();

  let storedUsed = 0;
  let periodStart = now;

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

  // Count actual generated blueprints within the 7-day rolling window
  // Check either passed historyList or localStorage history for this user
  let blueprintsCountInWeek = 0;
  const activeHistory = historyList || (typeof getHistory === "function" ? getHistory(userId) : []);
  if (Array.isArray(activeHistory)) {
    blueprintsCountInWeek = activeHistory.filter((item) => {
      if (!item || !item.createdAt) return false;
      const createdTime = new Date(item.createdAt).getTime();
      return !isNaN(createdTime) && now - createdTime <= WEEK_MS;
    }).length;
  }

  // Ground truth: effective usage is the highest between recorded usage and verified blueprints
  const effectiveUsed = Math.max(storedUsed, blueprintsCountInWeek);

  // If effectiveUsed is higher than storedUsed, persist back to local quota cache
  if (effectiveUsed > storedUsed) {
    try {
      localStorage.setItem(key, JSON.stringify({ used: effectiveUsed, periodStart }));
    } catch {
      // ignore
    }
  }

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
  const key = `ideapulse_quota_${userId || "guest"}`;
  const now = Date.now();
  let currentUsage = getWeeklyUsage(userId, historyList);
  
  const updatedUsed = currentUsage.used + 1;
  const periodStart = currentUsage.resetsAt ? currentUsage.resetsAt.getTime() - WEEK_MS : now;

  try {
    localStorage.setItem(key, JSON.stringify({ used: updatedUsed, periodStart }));
  } catch {
    // ignore
  }

  return getWeeklyUsage(userId, historyList);
}
