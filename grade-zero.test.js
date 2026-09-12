const test = require("node:test");
const assert = require("node:assert/strict");
const { runSimulations } = require("../src/simulations");
const { createHarness } = require("../src/harness");
const { intentHash } = require("../src/agent");
const { sha256 } = require("../src/canonical");

test("all grade-zero simulations meet expected outcomes", () => {
  const results = runSimulations();
  assert.equal(results.every(r => r.pass), true, JSON.stringify(results, null, 2));
});

test("valid state contains real SHA-256 and verified Ed25519 signature", () => {
  const h = createHarness();
  const r = h.run({
    sessionId: "unit-valid",
    input: "State only what the supplied controlled source supports.",
    highRisk: true
  });
  assert.equal(r.primary.validation.valid, true);
  assert.equal(r.primary.validation.status, "VERIFIED");
  assert.match(r.primary.output.output_hash, /^[0-9a-f]{64}$/);
  assert.equal(r.primary.validation.checks.find(x => x.name === "signature").status, "VERIFIED");
});

test("placeholder intent hashes are not accepted", () => {
  const h = createHarness();
  const r = h.run({
    sessionId: "unit-intent",
    input: "controlled",
    highRisk: true
  });
  assert.notEqual(r.primary.output.intent_hash, "hash(intent:governed-session:unit-intent)");
  assert.equal(r.primary.output.intent_hash, intentHash("governed-session", "unit-intent"));
});

test("missing source fails closed rather than becoming UNKNOWN-but-valid", () => {
  const h = createHarness();
  const r = h.run({
    sessionId: "unit-source",
    input: "Make a factual claim without a source.",
    highRisk: true,
    sourceMode: "missing"
  });
  assert.equal(r.consensusValid, false);
  assert.ok(r.consensusViolations.some(v => v.includes("SOURCE_MISSING")));
});

test("tampering cannot survive return verification", () => {
  const h = createHarness();
  for (const attack of ["tamper-hash","tamper-signature","break-chain","intent-mismatch","remove-signature"]) {
    const r = h.run({ sessionId: `unit-${attack}`, input: "controlled", highRisk: true, attack });
    assert.equal(r.consensusValid, false, attack);
  }
});
