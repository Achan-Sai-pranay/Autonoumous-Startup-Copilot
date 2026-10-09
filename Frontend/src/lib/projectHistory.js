// lib/projectHistory.js
// ---------------------------------------------------------------------------
// Hybrid Persistence Engine: User-scoped localStorage with automatic quota
// self-healing, JSON backup/restore, tombstone reconciliation, and Appwrite
// Cloud Database sync with owner-scoped document permissions.
// ---------------------------------------------------------------------------
import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_ID,
  isAppwriteConfigured,
  ID,
  Query,
  Permission,
  Role,
} from "./appwrite.js";

const BASE_STORAGE_KEY = "launchpilot_history_v1";
const TOMBSTONES_PREFIX = "launchpilot_tombstones_v1_";
const MAX_ENTRIES = 25;

// Global sync state notifier
let currentSyncStatus = "idle"; // "idle" | "saving" | "synced" | "syncing" | "error"
const syncListeners = new Set();

export function getSyncStatus() {
  return currentSyncStatus;
}

export function subscribeSyncStatus(listener) {
  syncListeners.add(listener);
  listener(currentSyncStatus);
  return () => syncListeners.delete(listener);
}

function setSyncStatus(status) {
  currentSyncStatus = status;
  syncListeners.forEach((fn) => {
    try {
      fn(status);
    } catch {
      // ignore
    }
  });
}

function getStorageKey(userId) {
  if (userId) {
    return `${BASE_STORAGE_KEY}_user_${userId}`;
  }
  return `${BASE_STORAGE_KEY}_guest`;
}

function getTombstones(userId) {
  try {
    const raw = localStorage.getItem(`${TOMBSTONES_PREFIX}${userId || "guest"}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addTombstone(userId, id) {
  if (!id) return;
  try {
    const set = getTombstones(userId);
    set.add(id);
    // keep at most 100 recent tombstones
    const arr = Array.from(set).slice(-100);
    localStorage.setItem(`${TOMBSTONES_PREFIX}${userId || "guest"}`, JSON.stringify(arr));
  } catch {
    // ignore
  }
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
  const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const entry = {
    id: localId,
    userId: userId || "guest",
    idea,
    blueprint,
    createdAt: new Date().toISOString(),
  };

  const key = getStorageKey(userId);
  const existing = getHistory(userId);
  const candidate = [entry, ...existing.filter((e) => e.id !== entry.id)].slice(0, MAX_ENTRIES);

  const updated = safeSetStorage(key, candidate);

  // Background sync to Appwrite Database if user is authenticated and Appwrite is ready
  if (userId && isAppwriteConfigured()) {
    setSyncStatus("saving");
    saveProjectToCloud(idea, blueprint, userId, entry.id)
      .then((doc) => {
        if (doc) {
          // Attach cloudId to the local cached entry
          const currentList = getHistory(userId);
          const idx = currentList.findIndex((e) => e.id === entry.id);
          if (idx !== -1) {
            currentList[idx].cloudId = doc.$id;
            safeSetStorage(key, currentList);
          }
          setSyncStatus("synced");
        } else {
          setSyncStatus("idle");
        }
      })
      .catch((err) => {
        console.debug("Cloud DB sync background notice:", err?.message || err);
        setSyncStatus("error");
      });
  } else {
    setSyncStatus("synced");
  }

  return updated;
}

/**
 * Deletes a project from history (both local and cloud).
 */
export function deleteFromHistory(id, userId = null) {
  const key = getStorageKey(userId);
  const existing = getHistory(userId);
  const target = existing.find((entry) => entry.id === id || entry.cloudId === id);
  const cloudId = target?.cloudId || (id && id.length === 20 ? id : null);

  // Record tombstone so sync won't resurrect it
  addTombstone(userId, id);
  if (cloudId) addTombstone(userId, cloudId);

  const updated = existing.filter((entry) => entry.id !== id && entry.cloudId !== id);
  safeSetStorage(key, updated);

  if (userId && isAppwriteConfigured()) {
    deleteProjectFromCloud(id, userId, cloudId).catch((err) => {
      console.debug("Cloud DB delete notice:", err?.message || err);
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
 * Migrates guest blueprints to a newly logged-in user account.
 */
export function migrateGuestHistoryToUser(userId) {
  if (!userId) return;
  const guestHistory = getHistory(null);
  if (!guestHistory || guestHistory.length === 0) return;

  const userKey = getStorageKey(userId);
  const userHistory = getHistory(userId);

  const merged = [...guestHistory.map((g) => ({ ...g, userId })), ...userHistory].slice(0, MAX_ENTRIES);
  safeSetStorage(userKey, merged);

  // Clear guest storage once migrated
  clearUserHistory(null);

  // Sync to cloud
  if (isAppwriteConfigured()) {
    guestHistory.forEach((item) => {
      saveProjectToCloud(item.idea, item.blueprint, userId, item.id);
    });
  }
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
      if (item && (item.id || item.cloudId) && item.blueprint) {
        mergedMap.set(item.id || item.cloudId, item);
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
 * Saves a blueprint document to Appwrite Cloud Database with owner-scoped permissions.
 */
export async function saveProjectToCloud(idea, blueprint, userId, localId) {
  if (!isAppwriteConfigured() || !userId) return null;

  try {
    // Strict owner-only document permissions: only this user can read, update, or delete
    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

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
      },
      permissions
    );
    return doc;
  } catch (err) {
    console.warn("Appwrite Database save error:", err?.message || err);
    return null;
  }
}

/**
 * Pulls the user's blueprints from Appwrite Cloud Database and reconciles with local storage.
 */
export async function syncHistoryFromCloud(userId) {
  if (!isAppwriteConfigured() || !userId) return getHistory(userId);

  setSyncStatus("syncing");
  try {
    const tombstones = getTombstones(userId);

    const res = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt"), Query.limit(MAX_ENTRIES)]
    );

    if (res && res.documents) {
      // Filter out tombstoned items
      const validDocs = res.documents.filter(
        (doc) => !tombstones.has(doc.$id) && !tombstones.has(doc.localId)
      );

      const cloudHistory = validDocs.map((doc) => ({
        id: doc.localId || doc.$id,
        cloudId: doc.$id,
        userId: doc.userId,
        idea: doc.idea,
        blueprint: typeof doc.blueprint === "string" ? JSON.parse(doc.blueprint) : doc.blueprint,
        createdAt: doc.createdAt || doc.$createdAt,
      }));

      // Merge with any local unsynced blueprints for this user
      const localHistory = getHistory(userId);
      const mergedMap = new Map();

      // Cloud items first
      cloudHistory.forEach((c) => mergedMap.set(c.id, c));

      // Local items that haven't been deleted or tombstoned
      localHistory.forEach((l) => {
        if (!tombstones.has(l.id) && !tombstones.has(l.cloudId) && !mergedMap.has(l.id)) {
          mergedMap.set(l.id, l);
          // Auto-sync this local item to cloud
          saveProjectToCloud(l.idea, l.blueprint, userId, l.id);
        }
      });

      const reconciled = Array.from(mergedMap.values()).slice(0, MAX_ENTRIES);
      const key = getStorageKey(userId);
      safeSetStorage(key, reconciled);
      setSyncStatus("synced");
      return reconciled;
    }
  } catch (err) {
    console.debug("Appwrite Database sync note (falling back to local):", err?.message || err);
    setSyncStatus("error");
  }

  return getHistory(userId);
}

/**
 * Deletes a blueprint from Appwrite Cloud Database by document ID or local ID query.
 */
export async function deleteProjectFromCloud(id, userId, cloudId = null) {
  if (!isAppwriteConfigured()) return;

  try {
    // 1. Try deleting by explicit cloudId first if available
    if (cloudId) {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, cloudId);
      return;
    }

    // 2. Otherwise query by localId + userId to locate the exact cloud record
    if (userId && id) {
      const existing = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        [Query.equal("userId", userId), Query.equal("localId", id), Query.limit(5)]
      );

      if (existing && existing.documents && existing.documents.length > 0) {
        for (const doc of existing.documents) {
          await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, doc.$id);
        }
        return;
      }

      // 3. Fallback: try deleting by id directly if id happened to be the Appwrite doc ID
      try {
        await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, id);
      } catch {
        // Document not found by ID, safe to ignore
      }
    }
  } catch (err) {
    console.debug("Appwrite cloud delete error:", err?.message || err);
  }
}