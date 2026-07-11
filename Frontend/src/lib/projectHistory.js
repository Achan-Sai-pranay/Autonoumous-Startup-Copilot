// lib/projectHistory.js
// ---------------------------------------------------------------------------
// Simple localStorage-backed persistence for "Startup History & Saved
// Projects". No backend involved — everything lives in the browser under
// one key. Capped at MAX_ENTRIES so localStorage never grows unbounded.
// Every read/write is wrapped in try/catch: private browsing, disabled
// storage, or a full quota should degrade to "no history" rather than
// crash the app.
// ---------------------------------------------------------------------------
const STORAGE_KEY = "launchpilot_history_v1";
const MAX_ENTRIES = 20;

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Adds a new entry to the front of the list and trims to MAX_ENTRIES.
export function saveToHistory(idea, blueprint) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    idea,
    blueprint,
    createdAt: new Date().toISOString(),
  };

  const existing = getHistory();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save to project history:", err.message);
  }

  return updated;
}

export function deleteFromHistory(id) {
  const updated = getHistory().filter((entry) => entry.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not update project history:", err.message);
  }
  return updated;
}