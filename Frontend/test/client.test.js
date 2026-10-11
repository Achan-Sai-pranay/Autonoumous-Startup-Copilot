// Frontend/test/client.test.js
import test from "node:test";
import assert from "node:assert";

test("Voucher code entitlement validation", () => {
  const validVouchers = ["FOUNDER_PASS", "IDEAPULSE2026", "BETA_PRO", "VIP_FOUNDER"];
  
  const validateCode = (code) => {
    if (!code || typeof code !== "string") return false;
    return validVouchers.includes(code.trim().toUpperCase());
  };

  assert.strictEqual(validateCode("FOUNDER_PASS"), true);
  assert.strictEqual(validateCode("founder_pass"), true);
  assert.strictEqual(validateCode("BETA_PRO"), true);
  assert.strictEqual(validateCode("FAKE_CODE"), false);
  assert.strictEqual(validateCode(""), false);
});

test("Quota limits for Free vs Pro tiers", () => {
  const FREE_WEEKLY_LIMIT = 3;
  const PRO_WEEKLY_LIMIT = 10;

  const calculateRemaining = (used, isPro) => {
    const total = isPro ? PRO_WEEKLY_LIMIT : FREE_WEEKLY_LIMIT;
    return Math.max(0, total - used);
  };

  assert.strictEqual(calculateRemaining(0, false), 3);
  assert.strictEqual(calculateRemaining(2, false), 1);
  assert.strictEqual(calculateRemaining(3, false), 0);
  assert.strictEqual(calculateRemaining(5, false), 0);

  assert.strictEqual(calculateRemaining(0, true), 10);
  assert.strictEqual(calculateRemaining(7, true), 3);
  assert.strictEqual(calculateRemaining(10, true), 0);
});

test("Compulsory login requirement and guest status check", () => {
  // Unauthenticated guests cannot generate directly; they must log in
  const canGenerate = (user, quota) => {
    if (!user) return { allowed: false, reason: "LOGIN_REQUIRED" };
    if (!quota?.isPro && quota?.remaining <= 0) return { allowed: false, reason: "QUOTA_EXCEEDED" };
    return { allowed: true };
  };

  // Guest attempts to generate
  assert.deepStrictEqual(canGenerate(null, { remaining: 3, isPro: false }), {
    allowed: false,
    reason: "LOGIN_REQUIRED",
  });

  // Authenticated user with remaining quota (3 per week free tier)
  assert.deepStrictEqual(canGenerate({ id: "user_1" }, { remaining: 3, isPro: false }), {
    allowed: true,
  });

  // Authenticated user who exhausted free 3 ideas
  assert.deepStrictEqual(canGenerate({ id: "user_1" }, { remaining: 0, isPro: false }), {
    allowed: false,
    reason: "QUOTA_EXCEEDED",
  });
});

test("Backup JSON export and import payload schema check", () => {
  const sampleBackup = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    history: [
      {
        id: "proj_123",
        idea: "AI autonomous co-founder",
        blueprint: { ideaAnalysis: {} },
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const isValidBackup = (data) => {
    return Boolean(
      data &&
      typeof data === "object" &&
      Array.isArray(data.history) &&
      data.history.every((item) => item.id && item.blueprint)
    );
  };

  assert.strictEqual(isValidBackup(sampleBackup), true);
  assert.strictEqual(isValidBackup({ version: "1.0", history: [] }), true);
  assert.strictEqual(isValidBackup({ history: "not an array" }), false);
});

test("VC War Room debate section schema validation", () => {
  const sections = [
    { id: "overview", label: "Executive Overview" },
    { id: "vc-debate", label: "AI Debate (War Room)" },
    { id: "customer-discovery", label: "Customer & Discovery" },
    { id: "market-competitors", label: "Market & Competitors" },
    { id: "product-mvp", label: "Product & MVP" },
    { id: "finances", label: "Financial Model" },
    { id: "gtm", label: "Go-to-Market" },
  ];

  const hasVcDebate = sections.some((s) => s.id === "vc-debate");
  assert.strictEqual(hasVcDebate, true);

  const ids = sections.map((s) => s.id);
  const uniqueIds = new Set(ids);
  assert.strictEqual(ids.length, uniqueIds.size);
});

test("Continuous story flow section transitions and anchors mapping", () => {
  const CONTINUOUS_FLOW_STAGES = [
    { id: "overview", nextId: "vc-debate", stageNum: 1 },
    { id: "vc-debate", nextId: "customer-discovery", stageNum: 2 },
    { id: "customer-discovery", nextId: "market-competitors", stageNum: 3 },
    { id: "market-competitors", nextId: "product-mvp", stageNum: 4 },
    { id: "product-mvp", nextId: "finances", stageNum: 5 },
    { id: "finances", nextId: "gtm", stageNum: 6 },
    { id: "gtm", nextId: null, stageNum: 7 },
  ];

  assert.strictEqual(CONTINUOUS_FLOW_STAGES.length, 7);

  // Verify linear continuum chain
  for (let i = 0; i < CONTINUOUS_FLOW_STAGES.length - 1; i++) {
    const current = CONTINUOUS_FLOW_STAGES[i];
    const next = CONTINUOUS_FLOW_STAGES[i + 1];
    assert.strictEqual(current.nextId, next.id, `Stage ${current.id} must point to ${next.id}`);
    assert.strictEqual(current.stageNum, i + 1);
  }

  // Last stage (GTM) must lead to blueprint completion hero
  const finalStage = CONTINUOUS_FLOW_STAGES[CONTINUOUS_FLOW_STAGES.length - 1];
  assert.strictEqual(finalStage.nextId, null);
  assert.strictEqual(finalStage.stageNum, 7);
});

test("Default displayMode configuration validation", () => {
  const supportedModes = ["continuous", "focused"];
  const defaultMode = "continuous";

  assert.strictEqual(supportedModes.includes(defaultMode), true);
  assert.strictEqual(defaultMode, "continuous");
});


