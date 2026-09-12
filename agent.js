const { generateKeyPair, sha256, intentHash, sign } = require("./canonical");
const { buildChain } = require("./chain");
const { SCHEMA } = require("./schema");
const { validateOutput } = require("./validator");

const REQUIRED = SCHEMA.GOVERNANCE.defaultOpcodes;

function makeRuneTrace(req) {
  return [
    { rune: "ᚠ", name: "FORCE", args: { condition: "ALL_CHECKS_PASS" } },
    { rune: "ᚢ", name: "LIMIT", args: { maxDepth: 3 } },
    { rune: "ᚦ", name: "VERIFY", args: { target: "source_hash" } },
    { rune: "ᚨ", name: "REJECT", args: { onFailure: "HALLUCINATION_OR_DRIFT" } },
    { rune: "ᚱ", name: "TRACE", args: { step: 1 } },
    { rune: "ᛊ", name: "SCHEMA", args: { schemaId: SCHEMA.id, schemaVersion: SCHEMA.version } },
    { rune: "ᛁ", name: "INTENT", args: { intentId: req.intentId, intentHash: req.intentHash } },
    ...(req.highRisk ? [
      { rune: "ᛃ", name: "HIGH_RISK_AUDIT", args: { required: true } },
      { rune: "ᛇ", name: "ESCALATION", args: { mode: "STRICT" } },
      { rune: "ᛉ", name: "SECURITY_GATE", args: { required: true } },
      { rune: "ᛒ", name: "BOUNDARY", args: { mode: "FAIL_CLOSED" } }
    ] : [])
  ];
}

function createAgent(id) {
  const keys = generateKeyPair();

  function produce(req, body, sources, claims = [], mutate = null) {
    const runes = makeRuneTrace(req);
    const base = {
      summary: body.slice(0, 200),
      reasoning: "Audit record only; no hidden reasoning is reconstructed.",
      sources,
      constraints: ["No unverified claim may be promoted to verified state."],
      output_body: body,
      token_count: Math.max(64, body.trim().split(/\s+/).length),
      claims,
      intent_hash: req.intentHash,
      rune_trace: runes
    };

    const output_hash = sha256({
      output_body: base.output_body,
      sources: base.sources,
      rune_trace: base.rune_trace
    });
    const signed = { ...base, output_hash };
    signed.signature = sign(keys.privateKey, { output_hash });

    const chain = buildChain([
      { stage: "STATE_0", agentId: id, schemaId: SCHEMA.id },
      { stage: "OUTPUT", output_hash },
      { stage: "RETURN", output_hash, agentId: id }
    ]);
    signed.chain = chain;

    if (mutate) mutate(signed);

    return { agentId: id, output: signed, validation: validateOutput(signed, req, keys.publicKey) };
  }

  return { id, produce, publicKey: keys.publicKey };
}

module.exports = { createAgent, REQUIRED, intentHash };
