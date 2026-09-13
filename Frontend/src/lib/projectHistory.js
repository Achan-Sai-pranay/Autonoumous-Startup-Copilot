// lib/projectHistory.js
// ---------------------------------------------------------------------------
// Hybrid Persistence Engine: User-scoped localStorage with automatic quota
// self-healing, JSON backup/restore, and Appwrite Cloud Database sync.
// ---------------------------------------------------------------------------
import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_ID,
  isAppwriteConfigured,
  ID,
  Query,
} from "./appwrite.js";

const BASE_STORAGE_KEY = "launchpilot_history_v1";
const MAX_ENTRIES = 25;

function getStorageKey(userId) {
  if (userId) {
    return `${BASE_STORAGE_KEY}_user_${userId}`;
  }
  return `${BASE_STORAGE_KEY}_guest`;
}

/**
 * Loads project history from localStorage.
 */
export function getHistory(userId = null) {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Error reading local project history:", err.message);
    return [];
  }
}

/**
 * Safely persists history with automatic quota management.
 * If 5MB quota is reached, prunes the oldest items to prevent QuotaExceededError crashes.
 */
function safeSetStorage(key, entries) {
  let listToSave = entries;
  while (listToSave.length > 0) {
    try {
      localStorage.setItem(key, JSON.stringify(listToSave));
      return listToSave;
    } catch (err) {
      if (
        err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        err.code === 22 ||
        err.code === 1014
      ) {
        console.warn(`Storage quota exceeded. Pruning oldest blueprint (current count: ${listToSave.length})...`);
        // Remove the oldest project (at the end) to free up quota
        listToSave = listToSave.slice(0, -1);
      } else {
        console.error("Local storage error:", err);
        break;
      }
    }
  }
  return listToSave;
}

/**
 * Adds a new project to history (local + cloud if configured).
 */
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
  const candidate = [entry, ...existing.filter((e) => e.id !== entry.id)].slice(0, MAX_ENTRIES);

  const updated = safeSetStorage(key, candidate);

  // Background sync to Appwrite Database if active
  if (userId && isAppwriteConfigured()) {
    saveProjectToCloud(idea, blueprint, userId, entry.id).catch((err) => {
      console.debug("Cloud DB sync background notice:", err.message);
    });
  }

  return updated;
}

/**
 * Deletes a project from history.
 */
export function deleteFromHistory(id, userId = null) {
  const key = getStorageKey(userId);
  const updated = getHistory(userId).filter((entry) => entry.id !== id);
  safeSetStorage(key, updated);

  if (userId && isAppwriteConfigured()) {
    deleteProjectFromCloud(id).catch((err) => {
      console.debug("Cloud DB delete notice:", err.message);
    });
  }

  return updated;
}

/**
 * Clears the history for the specified user or guest.
 */
export function clearUserHistory(userId = null) {
  const key = getStorageKey(userId);
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
  return [];
}

/**
 * Exports all saved projects as a JSON string for offline vault backups.
 */
export function exportHistoryJson(userId = null) {
  const history = getHistory(userId);
  return JSON.stringify({ version: "1.0", exportedAt: new Date().toISOString(), history }, null, 2);
}

/**
 * Imports projects from a JSON vault string.
 */
export function importHistoryJson(jsonString, userId = null) {
  try {
    const data = JSON.parse(jsonString);
    const imported = Array.isArray(data) ? data : data?.history;
    if (!Array.isArray(imported)) throw new Error("Invalid backup format");

    const existing = getHistory(userId);
    const mergedMap = new Map();
    [...imported, ...existing].forEach((item) => {
      if (item && item.id && item.blueprint) {
        mergedMap.set(item.id, item);
      }
    });

    const combined = Array.from(mergedMap.values()).slice(0, MAX_ENTRIES);
    const key = getStorageKey(userId);
    return safeSetStorage(key, combined);
  } catch (err) {
    console.error("Failed to import history:", err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Appwrite Cloud Database Sync Adapter
// ---------------------------------------------------------------------------

/**
 * Saves a blueprint document to Appwrite Cloud Database.
 */
export async function saveProjectToCloud(idea, blueprint, userId, localId) {
  if (!isAppwriteConfigured() || !userId) return null;

  try {
    const doc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        idea: typeof idea === "string" ? idea.slice(0, 1000) : "",
        blueprint: JSON.stringify(blueprint),
        localId: localId || "",
        createdAt: new Date().toISOString(),
      }
    );
    return doc;
  } catch (err) {
    console.debug("Appwrite Database save note:", err?.message || err);
    return null;
  }
}

/**
 * Pulls the user's blueprints from Appwrite Cloud Database.
 */
export async function syncHistoryFromCloud(userId) {
  if (!isAppwriteConfigured() || !userId) return getHistory(userId);

  try {
    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt"), Query.limit(MAX_ENTRIES)]
    );

    if (res && res.documents && res.documents.length > 0) {
      const cloudHistory = res.documents.map((doc) => ({
        id: doc.localId || doc.$id,
        cloudId: doc.$id,
        userId: doc.userId,
        idea: doc.idea,
        blueprint: typeof doc.blueprint === "string" ? JSON.parse(doc.blueprint) : doc.blueprint,
        createdAt: doc.createdAt || doc.$createdAt,
      }));

      // Cache locally
      const key = getStorageKey(userId);
      safeSetStorage(key, cloudHistory);
      return cloudHistory;
    }
  } catch (err) {
    console.debug("Appwrite Database sync note (falling back to local):", err?.message || err);
  }

  return getHistory(userId);
}

/**
 * Deletes a blueprint from Appwrite Cloud Database.
 */
export async function deleteProjectFromCloud(docId) {
  if (!isAppwriteConfigured()) return;
  try {
    await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, docId);
  } catch (err) {
    console.debug("Appwrite cloud delete note:", err?.message || err);
  }
}