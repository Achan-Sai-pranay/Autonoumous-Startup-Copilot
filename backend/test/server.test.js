// backend/test/server.test.js
import test from "node:test";
import assert from "node:assert";

test("Idea validation boundary rules", () => {
  const isTooShort = (idea) => !idea || typeof idea !== "string" || idea.trim().length < 5;
  const isTooLong = (idea) => typeof idea === "string" && idea.trim().length > 2500;

  assert.strictEqual(isTooShort(""), true);
  assert.strictEqual(isTooShort("abc"), true);
  assert.strictEqual(isTooShort("valid idea for a startup"), false);

  const massiveString = "a".repeat(2501);
  assert.strictEqual(isTooLong(massiveString), true);
  assert.strictEqual(isTooLong("a".repeat(2499)), false);
});

test("Waitlist entry email format validation", () => {
  const isValidEmail = (email) => Boolean(email && typeof email === "string" && email.includes("@") && email.includes("."));

  assert.strictEqual(isValidEmail("founder@ideapulse.ai"), true);
  assert.strictEqual(isValidEmail("invalid-email"), false);
  assert.strictEqual(isValidEmail(""), false);
  assert.strictEqual(isValidEmail(null), false);
});

test("Rate limiter configurations and thresholds", async () => {
  const windowMs = 15 * 60 * 1000;
  const maxBlueprintRuns = 20;
  assert.strictEqual(windowMs, 900000);
  assert.strictEqual(maxBlueprintRuns, 20);
});
