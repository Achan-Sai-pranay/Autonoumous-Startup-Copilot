// backend/test/e2e-debate.test.js
import test from "node:test";
import assert from "node:assert";
import { runOpeningClash, callBullAgent, callBearAgent } from "../debate.js";

test("runOpeningClash returns properly structured Bull and Bear cases", async () => {
  const result = await runOpeningClash("AI automated invoicing for freelance copywriters");

  assert.ok(result.bull, "Bull case must exist");
  assert.ok(result.bear, "Bear case must exist");

  assert.ok(result.bull.provider, "Bull provider must be defined");
  assert.ok(result.bull.thesis, "Bull thesis must be defined");
  assert.ok(Array.isArray(result.bull.marketTailwinds), "Bull tailwinds must be an array");
  assert.ok(result.bull.unfairWedge, "Bull unfair wedge must be defined");
  assert.ok(typeof result.bull.convictionScore === "number", "Bull conviction score must be a number");

  assert.ok(result.bear.provider, "Bear provider must be defined");
  assert.ok(result.bear.thesis, "Bear thesis must be defined");
  assert.ok(Array.isArray(result.bear.fatalFlaws), "Bear fatal flaws must be an array");
  assert.ok(result.bear.cacUnitEconomicsTrap, "Bear CAC trap must be defined");
  assert.ok(result.bear.incumbentMoatThreat, "Bear incumbent threat must be defined");
  assert.ok(typeof result.bear.skepticismScore === "number", "Bear skepticism score must be a number");
});
