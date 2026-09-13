// scripts/setup-appwrite.mjs
const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || "6aa55b210036fc2efe89";
const DATABASE_ID = "launchpilot_db";
const COLLECTION_ID = "blueprints";

const apiKey = process.argv[2] || process.env.APPWRITE_API_KEY;

if (!apiKey) {
  console.error("\n[!] Missing Appwrite API Key.");
  console.error("Usage: node scripts/setup-appwrite.mjs YOUR_APPWRITE_API_KEY\n");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": PROJECT_ID,
  "X-Appwrite-Key": apiKey,
};

async function api(path, method = "GET", body = null) {
  const url = `${ENDPOINT}${path}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log(`\nConnecting to Appwrite: ${ENDPOINT}`);
  console.log(`Project ID: ${PROJECT_ID}\n`);

  console.log(`1. Creating Database '${DATABASE_ID}'...`);
  const dbRes = await api("/databases", "POST", {
    databaseId: DATABASE_ID,
    name: "LaunchPilot DB",
  });

  if (dbRes.ok) {
    console.log(`   Database '${DATABASE_ID}' created successfully.`);
  } else if (dbRes.status === 409) {
    console.log(`   Database '${DATABASE_ID}' already exists.`);
  } else {
    console.error(`   Failed to create database:`, dbRes.data?.message || dbRes.data);
  }

  console.log(`\n2. Creating Collection '${COLLECTION_ID}'...`);
  const colRes = await api(`/databases/${DATABASE_ID}/collections`, "POST", {
    collectionId: COLLECTION_ID,
    name: "blueprints",
    permissions: [
      'read("any")',
      'create("any")',
      'update("any")',
      'delete("any")',
    ],
    documentSecurity: false,
  });

  if (colRes.ok) {
    console.log(`   Collection '${COLLECTION_ID}' created with permissions.`);
  } else if (colRes.status === 409) {
    console.log(`   Collection '${COLLECTION_ID}' already exists.`);
  } else {
    console.error(`   Failed to create collection:`, colRes.data?.message || colRes.data);
  }

  const attributes = [
    { key: "userId", size: 255, required: true },
    { key: "idea", size: 1000, required: false },
    { key: "blueprint", size: 1000000, required: true },
    { key: "localId", size: 100, required: false },
    { key: "createdAt", size: 100, required: false },
  ];

  console.log(`\n3. Creating Attributes...`);
  for (const attr of attributes) {
    const attrRes = await api(
      `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/attributes/string`,
      "POST",
      attr
    );
    if (attrRes.ok) {
      console.log(`   Attribute '${attr.key}' created.`);
    } else if (attrRes.status === 409) {
      console.log(`   Attribute '${attr.key}' already exists.`);
    } else {
      console.error(`   Failed attribute '${attr.key}':`, attrRes.data?.message || attrRes.data);
    }
  }

  console.log(`\nWaiting 3 seconds for Appwrite schema sync...`);
  await sleep(3000);

  console.log(`4. Creating Index 'userId_idx'...`);
  const idxRes = await api(
    `/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/indexes`,
    "POST",
    {
      key: "userId_idx",
      type: "key",
      attributes: ["userId"],
    }
  );

  if (idxRes.ok) {
    console.log(`   Index 'userId_idx' created.`);
  } else if (idxRes.status === 409) {
    console.log(`   Index 'userId_idx' already exists.`);
  } else {
    console.log(`   Index note:`, idxRes.data?.message || idxRes.data);
  }

  console.log(`\nDone! Appwrite Cloud database setup complete.\n`);
}

run().catch((err) => {
  console.error("Setup error:", err);
});
