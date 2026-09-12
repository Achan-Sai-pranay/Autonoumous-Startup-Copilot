// lib/authContext.js
// ---------------------------------------------------------------------------
// Authentication manager backed by Appwrite Auth SDK.
// Provides real registration, login, OAuth session redirects, and session checks.
// Falls back smoothly to local session if Appwrite keys are not yet provided.
// ---------------------------------------------------------------------------
import { account, avatars, ID, OAuthProvider, isAppwriteConfigured } from "./appwrite.js";

const AUTH_STORAGE_KEY = "launchpilot_auth_user_v1";

function formatAppwriteUser(appwriteUser) {
  const name = appwriteUser.name || appwriteUser.email.split("@")[0];
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
    email: appwriteUser.email,
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
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
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

  // Fallback to local cached session when offline or during demo
  return getStoredUser();
}

/**
 * Sign in with email and password via Appwrite
 */
export async function loginWithEmail(email, password) {
  if (!isAppwriteConfigured()) {
    return mockLogin(email);
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
    return mockLogin(email, name);
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
 */
export function loginWithOAuth(provider = "Google") {
  if (!isAppwriteConfigured()) {
    return Promise.resolve(mockSocialLogin(provider));
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const successUrl = `${origin}/app`;
  const failureUrl = `${origin}/?auth_error=1`;

  const targetProvider =
    provider.toLowerCase() === "github"
      ? OAuthProvider.Github
      : OAuthProvider.Google;

  account.createOAuth2Session(targetProvider, successUrl, failureUrl);
}

/**
 * Sign out and invalidate session
 */
export async function logout() {
  if (isAppwriteConfigured()) {
    try {
      await account.deleteSession("current");
    } catch (err) {
      console.warn("Appwrite logout notice:", err.message);
    }
  }
  clearUserSession();
}

// --- Legacy / Mock Compatibility -------------------------------------------
export function mockLogin(email, name = "") {
  const user = {
    id: `usr_${Date.now()}`,
    email,
    name: name || email.split("@")[0],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name || email
    )}&backgroundColor=ea580c,f97316`,
    plan: "Free Starter",
    createdAt: new Date().toISOString(),
    isMock: true,
  };
  return saveUserSession(user);
}

export function mockSocialLogin(provider = "Google") {
  const email = provider === "Google" ? "founder@gmail.com" : "builder@github.com";
  const name = provider === "Google" ? "Alex Rivera" : "Tech Founder";
  return mockLogin(email, name);
}
