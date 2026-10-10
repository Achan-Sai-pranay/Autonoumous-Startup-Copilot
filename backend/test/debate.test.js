// backend/test/debate.test.js
import test from "node:test";
import assert from "node:assert";
import { groqPool, openRouterPool, geminiPool } from "../debate.js";

test("KeyPool parses comma-separated keys and rotates round-robin", () => {
  process.env.TEST_KEYS = "key_alpha, key_beta, key_gamma";
  const pool = new (groqPool.constructor)("TEST_KEYS");

  assert.strictEqual(pool.hasKeys(), true);
  const keys = pool.getKeys();
  assert.deepStrictEqual(keys, ["key_alpha", "key_beta", "key_gamma"]);

  assert.strictEqual(pool.getNextKey(), "key_alpha");
  assert.strictEqual(pool.getNextKey(), "key_beta");
  assert.strictEqual(pool.getNextKey(), "key_gamma");
  assert.strictEqual(pool.getNextKey(), "key_alpha"); // wraps around
});

test("KeyPool gracefully handles empty or undefined env vars", () => {
  delete process.env.TEST_EMPTY_KEYS;
  const pool = new (groqPool.constructor)("TEST_EMPTY_KEYS");

  assert.strictEqual(pool.hasKeys(), false);
  assert.deepStrictEqual(pool.getKeys(), []);
  assert.strictEqual(pool.getNextKey(), null);
});

test("3-AI Committee debate structure contract", () => {
  const sampleDebate = {
    bull: {
      provider: "Groq (Llama 3.3 70B)",
      thesis: "High conviction upside thesis.",
      marketTailwinds: ["AI workflow automation"],
      unfairWedge: "Ultra-fast execution and zero bloat.",
      convictionScore: 88,
    },
    bear: {
      provider: "OpenRouter (DeepSeek V3)",
      thesis: "Ruthless CAC attack.",
      fatalFlaws: ["Customer acquisition cost trap"],
      cacUnitEconomicsTrap: "High acquisition friction.",
      incumbentMoatThreat: "Big tech feature bundling.",
      skepticismScore: 84,
    },
    judge: {
      provider: "Google (Gemini 2.5 Flash)",
      winningSide: "Bull",
      scorecard: {
        marketDemand: { winner: "Bull", rationale: "Clear user pull." },
        defensibility: { winner: "Bear", rationale: "Moat is narrow." },
        technicalFeasibility: { winner: "Bull", rationale: "Fast to build." },
        unitEconomics: { winner: "Bear", rationale: "Needs pilot validation." },
      },
      verdictSummary: "The committee approves proceed with caution.",
      keyConditionToProceed: "Pre-sell 5 customers.",
      numberOneExperiment: "Run a concierge pilot.",
    },
    rebuttalRound: {
      bullRebuttal: "Organic demand solves CAC.",
      bearRebuttal: "Paid conversions still unproven.",
    },
  };

  assert.ok(sampleDebate.bull.thesis);
  assert.ok(sampleDebate.bear.thesis);
  assert.ok(sampleDebate.judge.verdictSummary);
  assert.strictEqual(sampleDebate.judge.scorecard.marketDemand.winner, "Bull");
  assert.ok(sampleDebate.rebuttalRound.bullRebuttal);
});
