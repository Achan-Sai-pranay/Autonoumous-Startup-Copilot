// lib/authContext.js
// ---------------------------------------------------------------------------
// Client-side authentication state manager backed by localStorage.
// Handles login, signup, session persistence, and logout with zero external dependencies.
// ---------------------------------------------------------------------------
const AUTH_STORAGE_KEY = "launchpilot_auth_user_v1";

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

export function mockLogin(email, name = "") {
  const user = {
    id: `usr_${Date.now()}`,
    email,
    name: name || email.split("@")[0],
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}&backgroundColor=ea580c,f97316`,
    plan: "Free Starter",
    createdAt: new Date().toISOString(),
  };
  return saveUserSession(user);
}

export function mockSocialLogin(provider = "Google") {
  const email = provider === "Google" ? "founder@gmail.com" : "builder@github.com";
  const name = provider === "Google" ? "Alex Rivera" : "Tech Founder";
  return mockLogin(email, name);
}
