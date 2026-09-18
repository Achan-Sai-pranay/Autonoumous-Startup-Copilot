// lib/quotaManager.js
// ---------------------------------------------------------------------------
// Quota & Subscription Tier Manager:
// - Free Plan: 3 blueprint generations per rolling 7-day week.
// - Pro Plan: 10 blueprint generations per rolling 7-day week, priority AI streaming,
//   unlimited Co-Founder queries, watermark-free PDF & PRD exports.
// ---------------------------------------------------------------------------
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const FREE_WEEKLY_LIMIT = 3;
export const PRO_WEEKLY_LIMIT = 10;
const PRO_STORAGE_PREFIX = "ideapulse_pro_tier_";

export function isUserPro(userId) {
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

export function upgradeUserToPro(userId, details = {}) {
  const key = `${PRO_STORAGE_PREFIX}${userId || "guest"}`;
  const now = Date.now();
  const subscription = {
    planId: "pro_monthly",
    planName: "IdeaPulse Pro Founder",
    priceInr: 149,
    priceUsd: 4.99,
    activatedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + THIRTY_DAYS_MS).toISOString(),
    paymentMethod: details.paymentMethod || "UPI / Card",
    paymentId: details.paymentId || `PAY-${Date.now().toString(36).toUpperCase()}`,
    status: "active",
  };

  try {
    localStorage.setItem(key, JSON.stringify(subscription));
  } catch (err) {
    console.warn("Could not save pro subscription locally:", err);
  }

  return subscription;
}

export function getWeeklyUsage(userId) {
  const isPro = isUserPro(userId);
  const totalLimit = isPro ? PRO_WEEKLY_LIMIT : FREE_WEEKLY_LIMIT;
  const key = `ideapulse_quota_${userId || "guest"}`;
  const now = Date.now();

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {
        used: 0,
        total: totalLimit,
        remaining: totalLimit,
        isPro,
        planName: isPro ? "Pro Founder" : "Free Starter",
        resetsAt: new Date(now + WEEK_MS),
      };
    }
    const data = JSON.parse(raw);
    if (!data.periodStart || now - data.periodStart > WEEK_MS) {
      const newPeriod = { used: 0, periodStart: now };
      localStorage.setItem(key, JSON.stringify(newPeriod));
      return {
        used: 0,
        total: totalLimit,
        remaining: totalLimit,
        isPro,
        planName: isPro ? "Pro Founder" : "Free Starter",
        resetsAt: new Date(now + WEEK_MS),
      };
    }
    const used = data.used || 0;
    const remaining = Math.max(0, totalLimit - used);
    const resetsAt = new Date(data.periodStart + WEEK_MS);
    return {
      used,
      total: totalLimit,
      remaining,
      isPro,
      planName: isPro ? "Pro Founder" : "Free Starter",
      resetsAt,
    };
  } catch {
    return {
      used: 0,
      total: totalLimit,
      remaining: totalLimit,
      isPro,
      planName: isPro ? "Pro Founder" : "Free Starter",
      resetsAt: new Date(now + WEEK_MS),
    };
  }
}

export function incrementWeeklyUsage(userId) {
  const key = `ideapulse_quota_${userId || "guest"}`;
  const now = Date.now();
  let data = { used: 0, periodStart: now };
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.periodStart && now - parsed.periodStart <= WEEK_MS) {
        data = parsed;
      }
    }
  } catch {
    // ignore
  }
  data.used = (data.used || 0) + 1;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
  return getWeeklyUsage(userId);
}
