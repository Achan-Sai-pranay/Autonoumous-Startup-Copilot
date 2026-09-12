// lib/appwrite.js
// ---------------------------------------------------------------------------
// Appwrite Client SDK initialization for LaunchPilot AI authentication
// ---------------------------------------------------------------------------
import { Client, Account, Avatars, ID, OAuthProvider } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || "";

export const client = new Client();

if (endpoint) {
  client.setEndpoint(endpoint);
}

if (projectId && projectId !== "YOUR_APPWRITE_PROJECT_ID") {
  client.setProject(projectId);
}

export const account = new Account(client);
export const avatars = new Avatars(client);
export { ID, OAuthProvider };

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
