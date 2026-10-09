// lib/authContext.js
// ---------------------------------------------------------------------------
// Authentication manager backed by Appwrite Auth SDK.
// Provides real registration, login, OAuth session redirects, and session checks.
// Eliminates deceptive mock logins from production flow.
// ---------------------------------------------------------------------------
import { account, avatars, ID, OAuthProvider, isAppwriteConfigured } from "./appwrite.js";

const AUTH_STORAGE_KEY = "launchpilot_auth_user_v1";

function formatAppwriteUser(appwriteUser) {
  const name = appwriteUser.name || (appwriteUser.email ? appwriteUser.email.split("@")[0] : "Founder");
  let avatarUrl = "";
  try {
    avatarUrl = avatars.getInitials(name).toString();
  } catch {
    avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name
    )}&backgroundColor=ea580c,f97316`;
  }

  return {
    id: appwriteUser.$id,
    email: appwriteUser.email || "",
    name,
    avatarUrl,
    plan: "Free Starter",
    createdAt: appwriteUser.$createdAt || new Date().toISOString(),
    isRealAuth: true,
  };
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserSession(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return user;
  } catch {
    return user;
  }
}

export function clearUserSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Validates and returns currently authenticated Appwrite user session.
 */
export async function getCurrentUser() {
  if (isAppwriteConfigured()) {
    try {
      const sessionUser = await account.get();
      const user = formatAppwriteUser(sessionUser);
      saveUserSession(user);
      return user;
    } catch {
      // Session expired or unauthenticated
      clearUserSession();
      return null;
    }
  }

  // Fallback to local cached session only if Appwrite is not configured
  return getStoredUser();
}

/**
 * Retrieves a short-lived Appwrite JWT to authenticate backend requests.
 */
export async function getAuthJwt() {
  if (isAppwriteConfigured()) {
    try {
      const res = await account.createJWT();
      return res?.jwt || null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Sign in with email and password via Appwrite
 */
export async function loginWithEmail(email, password) {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured. Please set VITE_APPWRITE_PROJECT_ID.");
  }

  // Delete any lingering active session before creating a new one
  try {
    await account.deleteSession("current");
  } catch {
    // No active session, ignore
  }

  await account.createEmailPasswordSession(email.trim(), password);
  const userRecord = await account.get();
  const user = formatAppwriteUser(userRecord);
  saveUserSession(user);
  return user;
}

/**
 * Create a new account with email, password, and name via Appwrite
 */
export async function registerWithEmail(email, password, name = "") {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured. Please set VITE_APPWRITE_PROJECT_ID.");
  }

  const cleanEmail = email.trim();
  const cleanName = name.trim();

  // 1. Create account
  await account.create(
    ID.unique(),
    cleanEmail,
    password,
    cleanName || undefined
  );

  // 2. Automatically log in to establish session
  await account.createEmailPasswordSession(cleanEmail, password);

  // 3. Fetch user profile
  const userRecord = await account.get();
  const user = formatAppwriteUser(userRecord);
  saveUserSession(user);
  return user;
}

/**
 * OAuth2 Social Login (Google, GitHub)
 * Triggers official Appwrite OAuth redirection flow.
 */
export function loginWithOAuth(provider = "Google") {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured. Please set VITE_APPWRITE_PROJECT_ID in .env.");
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const successUrl = `${origin}/app`;
  const failureUrl = `${origin}/?auth_error=1`;

  const targetProvider =
    provider.toLowerCase() === "github"
      ? OAuthProvider.Github
      : OAuthProvider.Google;

  return account.createOAuth2Session(targetProvider, successUrl, failureUrl);
}

/**
 * Sign out and invalidate session across Appwrite and client
 */
export async function logout() {
  if (isAppwriteConfigured()) {
    try {
      await account.deleteSession("current");
    } catch (err) {
      console.warn("Appwrite logout notice:", err?.message || err);
    }
  }
  clearUserSession();
}
