// lib/quotaManager.js
// ---------------------------------------------------------------------------
// Free Plan Weekly Quota Manager:
// Tracks 3 free blueprint generations per rolling 7-day week per user.
// Resets automatically after 7 days.
// ---------------------------------------------------------------------------
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const FREE_WEEKLY_LIMIT = 3;

export function getWeeklyUsage(userId) {
  const key = `launchpilot_quota_${userId || "guest"}`;
  const now = Date.now();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {
        used: 0,
        total: FREE_WEEKLY_LIMIT,
        remaining: FREE_WEEKLY_LIMIT,
        resetsAt: new Date(now + WEEK_MS),
      };
    }
    const data = JSON.parse(raw);
    if (!data.periodStart || now - data.periodStart > WEEK_MS) {
      const newPeriod = { used: 0, periodStart: now };
      localStorage.setItem(key, JSON.stringify(newPeriod));
      return {
        used: 0,
        total: FREE_WEEKLY_LIMIT,
        remaining: FREE_WEEKLY_LIMIT,
        resetsAt: new Date(now + WEEK_MS),
      };
    }
    const used = data.used || 0;
    const remaining = Math.max(0, FREE_WEEKLY_LIMIT - used);
    const resetsAt = new Date(data.periodStart + WEEK_MS);
    return { used, total: FREE_WEEKLY_LIMIT, remaining, resetsAt };
  } catch {
    return {
      used: 0,
      total: FREE_WEEKLY_LIMIT,
      remaining: FREE_WEEKLY_LIMIT,
      resetsAt: new Date(now + WEEK_MS),
    };
  }
}

export function incrementWeeklyUsage(userId) {
  const key = `launchpilot_quota_${userId || "guest"}`;
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
  localStorage.setItem(key, JSON.stringify(data));
  return getWeeklyUsage(userId);
}
