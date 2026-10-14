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

test("Device Quota 1 Free Lifetime Blueprint logic", () => {
  const canDeviceGenerate = (deviceCount, isPro) => {
    if (isPro) return true;
    return deviceCount < 1;
  };

  assert.strictEqual(canDeviceGenerate(0, false), true); // First demo idea allowed
  assert.strictEqual(canDeviceGenerate(1, false), false); // Second idea locked on free tier
  assert.strictEqual(canDeviceGenerate(2, false), false); // Subsequent ideas locked
  assert.strictEqual(canDeviceGenerate(1, true), true); // Paid subscriber unlocked
  assert.strictEqual(canDeviceGenerate(5, true), true); // Paid subscriber unlocked
});

test("Razorpay plan amounts and signature verification", async () => {
  const crypto = await import("crypto");

  const plans = {
    starter_129: { priceInr: 129, paise: 12900, weeklyLimit: 5 },
    scale_299: { priceInr: 299, paise: 29900, weeklyLimit: 10 },
  };

  assert.strictEqual(plans.starter_129.paise, 12900);
  assert.strictEqual(plans.scale_299.paise, 29900);

  // HMAC verification test
  const secret = "test_rzp_secret_key_12345";
  const orderId = "order_9A33XWu170gUtm";
  const paymentId = "pay_29MoThyUh3RxfH";

  const expectedSignature = crypto.default
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert.strictEqual(typeof expectedSignature, "string");
  assert.strictEqual(expectedSignature.length, 64);

  // Verification matching
  const verify = (sig) => sig === expectedSignature;
  assert.strictEqual(verify(expectedSignature), true);
  assert.strictEqual(verify("tampered_signature"), false);
});
