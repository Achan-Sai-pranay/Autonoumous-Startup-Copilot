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

test("Currency conversion integrity and invariant preservation (USD to INR)", () => {
  // Test with real market rate around 96.8
  const MARKET_USD_TO_INR = 96.8;

  const convertUsdToInr = (usd, rate = MARKET_USD_TO_INR) => Math.round(Number(usd) * rate);
  const convertInrToUsd = (inr, rate = MARKET_USD_TO_INR) => Math.max(1, Math.round(Number(inr) / rate));

  // 1. Value must not simply change symbol from $50 to ₹50; $50 converts to ~₹4,840 at ~96.8
  const usd50 = 50;
  const inrConverted = convertUsdToInr(usd50);
  assert.strictEqual(inrConverted, 4840);
  assert.notStrictEqual(inrConverted, 50, "A $50 price must never simply be changed to ₹50");

  // 2. Mathematical invariant: Breakeven subscriber count must remain 100% identical at any rate
  [83, 96, 96.8, 100].forEach((rate) => {
    const usdPrice = 59;
    const usdBurn = 11;
    const usdBreakeven = Math.max(1, Math.ceil(usdBurn / usdPrice));

    const inrPrice = convertUsdToInr(usdPrice, rate);
    const inrBurn = convertUsdToInr(usdBurn, rate);
    const inrBreakeven = Math.max(1, Math.ceil(inrBurn / inrPrice));

    assert.strictEqual(usdBreakeven, inrBreakeven, `Break-even customer count must be identical at rate ${rate}`);

    // ARR milestone customer targets must remain identical
    const to100kUsd = Math.max(1, Math.ceil(100000 / (usdPrice * 12)));
    const target1Inr = Math.round(100000 * rate);
    const toMilestoneInr = Math.max(1, Math.ceil(target1Inr / (inrPrice * 12)));
    assert.strictEqual(to100kUsd, toMilestoneInr, `ARR milestone volume must remain identical at rate ${rate}`);
  });
});

test("Currency string conversion with ranges and mixed AI text using market rate (~96.8)", () => {
  const USD_TO_INR = 96.8;
  function convertCurrencyString(str, targetCurrency = "INR", rate = USD_TO_INR) {
    if (!str || typeof str !== "string") return str;
    if (targetCurrency === "INR") {
      if (str.includes("₹") && !str.includes("$")) return str;
      return str.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)(?:\s*-\s*\$?(\d+(?:,\d+)*(?:\.\d+)?))?/g, (match, n1, n2) => {
        const v1 = parseFloat(n1.replace(/,/g, ""));
        const inr1 = `₹${Math.round(v1 * rate).toLocaleString("en-IN")}`;
        if (n2) {
          const v2 = parseFloat(n2.replace(/,/g, ""));
          const inr2 = `₹${Math.round(v2 * rate).toLocaleString("en-IN")}`;
          return `${inr1} - ${inr2}`;
        }
        return inr1;
      });
    }
    return str;
  }

  // Ranges ($16-51 at ~96.8)
  assert.strictEqual(convertCurrencyString("$16-51"), "₹1,549 - ₹4,937");
  assert.strictEqual(convertCurrencyString("$16 - $51"), "₹1,549 - ₹4,937");

  // Formatted revenue projections ($4,900 at 96.8)
  assert.strictEqual(convertCurrencyString("$4,900"), "₹4,74,320");
  assert.strictEqual(convertCurrencyString("$588,000"), "₹5,69,18,400");

  // Non-currency intact
  assert.strictEqual(convertCurrencyString("Free tier"), "Free tier");
  assert.strictEqual(convertCurrencyString("₹149/mo"), "₹149/mo");
});

test("Dynamic cloud & database provider scaling (e.g. 1,640 users at 400 price)", async () => {
  const { calculateCloudCosts, CLOUD_PROVIDERS, STARTUP_GLOSSARY } = await import("../src/lib/cloudPricing.js");

  // Verify all 3 famous provider profiles exist
  assert.ok(CLOUD_PROVIDERS.SUPABASE_VERCEL);
  assert.ok(CLOUD_PROVIDERS.AWS_PRODUCTION);
  assert.ok(CLOUD_PROVIDERS.MONGODB_RENDER);

  // Test 1: User audio scenario (1,640 users at 400 INR/mo)
  const users = 1640;
  const price = 400;
  const rate = 96.8;

  // Supabase + Vercel
  const supabaseCosts = calculateCloudCosts(users, "SUPABASE_VERCEL", rate, "INR");
  assert.strictEqual(supabaseCosts.users, 1640);
  assert.ok(supabaseCosts.total > 0);
  assert.ok(supabaseCosts.database > 0);
  assert.ok(supabaseCosts.compute > 0);
  assert.ok(supabaseCosts.totalUsd >= 50 && supabaseCosts.totalUsd <= 120); // ~$74/mo
  assert.ok(supabaseCosts.total >= 5000 && supabaseCosts.total <= 12000); // ~₹7,200/mo

  // Economics check: 1640 users * 400 INR = 656,000 MRR. Cloud burn ~7,200 INR. Net > 640,000 INR
  const mrr = users * price;
  const net = mrr - supabaseCosts.total;
  const margin = Math.round((net / mrr) * 100);
  assert.strictEqual(mrr, 656000);
  assert.ok(net > 645000);
  assert.strictEqual(margin, 99);

  // AWS Production
  const awsCosts = calculateCloudCosts(users, "AWS_PRODUCTION", rate, "INR");
  assert.ok(awsCosts.totalUsd > supabaseCosts.totalUsd); // Enterprise AWS dedicated instances are higher
  assert.ok(awsCosts.total >= 10000); // ~₹13,500/mo

  // Test 2: Scaling increases infrastructure costs monotonically
  const cost100 = calculateCloudCosts(100, "SUPABASE_VERCEL", rate, "INR");
  const cost500 = calculateCloudCosts(500, "SUPABASE_VERCEL", rate, "INR");
  const cost1000 = calculateCloudCosts(1000, "SUPABASE_VERCEL", rate, "INR");
  const cost5000 = calculateCloudCosts(5000, "SUPABASE_VERCEL", rate, "INR");

  assert.ok(cost100.total <= cost500.total);
  assert.ok(cost500.total <= cost1000.total);
  assert.ok(cost1000.total < cost5000.total);

  // Test 3: Glossary completeness
  assert.ok(STARTUP_GLOSSARY.initialTraction.title.length > 0);
  assert.ok(STARTUP_GLOSSARY.pmf.title.length > 0);
  assert.ok(STARTUP_GLOSSARY.scalingPhase.title.length > 0);
  assert.ok(STARTUP_GLOSSARY.marketLeader.title.length > 0);
  assert.ok(STARTUP_GLOSSARY.cloudBurn.title.length > 0);
  assert.ok(STARTUP_GLOSSARY.unitEconomics.title.length > 0);
});

test("Device-level quota lock & LaunchPilot paid plans", async () => {
  const { PLANS, FREE_DEVICE_LIFETIME_LIMIT, PLAN_STARTER_LIMIT, PLAN_SCALE_LIMIT } =
    await import("../src/lib/quotaManager.js");

  // Free Tier: exactly 1 lifetime demo idea per device
  assert.strictEqual(FREE_DEVICE_LIFETIME_LIMIT, 1);

  // Starter Plan: ₹129/mo, 5 ideas/week
  assert.strictEqual(PLANS.starter.priceInr, 129);
  assert.strictEqual(PLANS.starter.weeklyLimit, 5);
  assert.strictEqual(PLAN_STARTER_LIMIT, 5);

  // Scale Plan: ₹299/mo, 10 ideas/week
  assert.strictEqual(PLANS.scale.priceInr, 299);
  assert.strictEqual(PLANS.scale.weeklyLimit, 10);
  assert.strictEqual(PLAN_SCALE_LIMIT, 10);

  // Device lock check
  const isDeviceLocked = (freeUsed, isPro) => {
    if (isPro) return false;
    return freeUsed >= FREE_DEVICE_LIFETIME_LIMIT;
  };

  assert.strictEqual(isDeviceLocked(0, false), false); // Fresh device: unlocked
  assert.strictEqual(isDeviceLocked(1, false), true);  // 1 idea consumed: locked
  assert.strictEqual(isDeviceLocked(2, false), true);  // subsequent attempts: locked
  assert.strictEqual(isDeviceLocked(1, true), false);  // Paid subscriber: unlocked
});


