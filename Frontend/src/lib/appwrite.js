// lib/appwrite.js
// ---------------------------------------------------------------------------
// Appwrite Client SDK initialization for LaunchPilot AI authentication
// ---------------------------------------------------------------------------
import { Client, Account, Avatars, Databases, ID, OAuthProvider, Query } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || "";
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "launchpilot_db";
export const APPWRITE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID || "blueprints";

export const client = new Client();

if (endpoint) {
  client.setEndpoint(endpoint);
}

if (projectId && projectId !== "YOUR_APPWRITE_PROJECT_ID") {
  client.setProject(projectId);
}

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export { ID, OAuthProvider, Query };

export function isAppwriteConfigured() {
  return Boolean(
    projectId &&
    projectId.trim() !== "" &&
    projectId !== "YOUR_APPWRITE_PROJECT_ID"
  );
}

// Automatically ping Appwrite to verify connectivity and satisfy console handshake
if (isAppwriteConfigured()) {
  client.ping().catch((err) => {
    console.debug("Appwrite ping notice:", err?.message || err);
  });
}
