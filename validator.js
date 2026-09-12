const { SCHEMA } = require("./schema");
const { STATUS } = require("./status");
const { sha256, verify } = require("./canonical");
const { verifyChain } = require("./chain");

function validateOutput(output, req, publicKey) {
  const violations = [];
  const checks = [];

  const reject = (code, detail) => {
    violations.push({ code, detail });
  };

  // Structural
  const required = SCHEMA.STRUCT.sections;
  for (const section of required) {
    if (!(section in output)) reject("SCHEMA_MISSING_SECTION", section);
  }
  const body = output.output_body;
  if (typeof body !== "string") reject("SCHEMA_OUTPUT_BODY", "output_body must be text");
  else {
    const units = Number.isInteger(output.token_count) ? output.token_count : null;
    if (units === null) reject("TOKEN_COUNT_UNKNOWN", "A trusted token count was not supplied.");
    else if (units < SCHEMA.STRUCT.tokens.min || units > SCHEMA.STRUCT.tokens.max)
      reject("SCHEMA_TOKEN_RANGE", String(units));
  }

  // Semantic
  if (!Array.isArray(output.sources) || output.sources.length < SCHEMA.SEMANTIC.minSources)
    reject("SOURCE_MISSING", "At least one source is required by the canonical schema.");

  if (output.sources) {
    for (const s of output.sources) {
      if (!s.source_id || !s.source_hash) reject("SOURCE_BINDING_MISSING", "source_id/source_hash required");
      else if (sha256(s.content) !== s.source_hash) reject("SOURCE_HASH_MISMATCH", s.source_id);
    }
  }

  if (!Array.isArray(output.claims)) reject("CLAIMS_MISSING", "claims must be explicit");
  else if (SCHEMA.SEMANTIC.claimsRequireEvidence) {
    for (const c of output.claims) {
      if (!c.source_id) reject("CLAIM_UNREFERENCED", c.id || "unknown-claim");
      else if (!output.sources?.some(s => s.source_id === c.source_id))
        reject("CLAIM_SOURCE_NOT_FOUND", c.id || "unknown-claim");
      if (c.evidence_status !== "VERIFIED")
        reject("CLAIM_EVIDENCE_UNVERIFIED", c.id || "unknown-claim");
    }
  }

  if (output.intent_hash !== req.intentHash)
    reject("INTENT_MISMATCH", "Output intent_hash does not match request intent hash.");

  // Governance
  const requiredOpcodes = req.highRisk ? SCHEMA.GOVERNANCE.highRiskOpcodes : SCHEMA.GOVERNANCE.defaultOpcodes;
  const present = new Set((output.rune_trace || []).map(x => x.rune));
  for (const op of requiredOpcodes) if (!present.has(op)) reject("GOVERNANCE_OPCODE_MISSING", op);
  if (!output.rune_trace?.some(x => x.name === "TRACE")) reject("TRACE_MISSING", "RUNE.TRACE");
  if (!output.rune_trace?.some(x => x.name === "SCHEMA")) reject("SCHEMA_BIND_MISSING", "RUNE.SCHEMA");

  // Crypto
  const hashedPayload = {
    output_body: output.output_body,
    sources: output.sources,
    rune_trace: output.rune_trace
  };
  const computedHash = sha256(hashedPayload);
  checks.push({ name: "output_hash", status: STATUS.COMPUTED, value: computedHash });

  if (!output.output_hash) reject("OUTPUT_HASH_UNKNOWN", "Required hash was not supplied.");
  else if (output.output_hash !== computedHash) reject("OUTPUT_HASH_MISMATCH", "SHA-256 mismatch.");

  if (!output.signature) reject("SIGNATURE_UNKNOWN", "Required Ed25519 signature was not supplied.");
  else if (!verify(publicKey, { output_hash: computedHash }, output.signature))
    reject("SIGNATURE_INVALID", "Ed25519 verification failed.");
  else checks.push({ name: "signature", status: STATUS.VERIFIED, value: true });

  const chain = verifyChain(output.chain);
  if (!chain.valid) reject("CHAIN_INVALID", chain.reason);
  else checks.push({ name: "chain", status: STATUS.VERIFIED, value: chain.head });

  if (!Array.isArray(output.chain) || output.chain.length < SCHEMA.CRYPTO.chainDepthMin)
    reject("CHAIN_DEPTH", "Minimum chain depth is 3.");

  const consensusValid = violations.length === 0;
  return {
    valid: consensusValid,
    consensusValid,
    violations,
    checks,
    status: consensusValid ? STATUS.VERIFIED : STATUS.REJECTED
  };
}

module.exports = { validateOutput };
