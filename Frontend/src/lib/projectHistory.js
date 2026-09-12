// lib/projectHistory.js
// ---------------------------------------------------------------------------
// User-scoped localStorage persistence for "Startup History & Saved
// Projects". Isolates each user's history under their own unique key
// (e.g. launchpilot_history_v1_user_<id>), ensuring new accounts start with
// clean/isolated vaults, with zero crossover between users.
// ---------------------------------------------------------------------------
const BASE_STORAGE_KEY = "launchpilot_history_v1";
const MAX_ENTRIES = 25;

function getStorageKey(userId) {
  if (userId) {
    return `${BASE_STORAGE_KEY}_user_${userId}`;
  }
  return `${BASE_STORAGE_KEY}_guest`;
}

export function getHistory(userId = null) {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Adds a new entry to the front of the user's list and trims to MAX_ENTRIES.
export function saveToHistory(idea, blueprint, userId = null) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: userId || "guest",
    idea,
    blueprint,
    createdAt: new Date().toISOString(),
  };

  const key = getStorageKey(userId);
  const existing = getHistory(userId);
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save to project history:", err.message);
  }

  return updated;
}

export function deleteFromHistory(id, userId = null) {
  const key = getStorageKey(userId);
  const updated = getHistory(userId).filter((entry) => entry.id !== id);
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not update project history:", err.message);
  }
  return updated;
}

export function clearUserHistory(userId = null) {
  const key = getStorageKey(userId);
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
  return [];
}