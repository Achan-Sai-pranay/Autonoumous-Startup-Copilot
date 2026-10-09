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
