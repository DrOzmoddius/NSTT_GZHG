const { createAgent, intentHash } = require("./agent");
const { STATUS } = require("./status");

function createHarness() {
  const agents = Object.fromEntries(
    ["red-bird","oracle","merlin-dev","sentinel","archivist","fabricator"].map(id => [id, createAgent(id)])
  );

  function run({ sessionId, input, highRisk = true, sourceMode = "valid", attack = null }) {
    const req = {
      sessionId,
      input,
      intentId: "governed-session",
      intentHash: intentHash("governed-session", sessionId),
      highRisk
    };

    const sourceContent = sourceMode === "missing"
      ? null
      : `Authoritative test source for session ${sessionId}.`;

    const sources = sourceContent === null ? [] : [{
      source_id: "SRC-001",
      content: sourceContent,
      source_hash: require("./canonical").sha256(sourceContent)
    }];

    const claims = sourceContent === null ? [] : [{
      id: "CLAIM-001",
      text: "The source exists for this controlled test.",
      source_id: "SRC-001",
      evidence_status: attack === "hallucination" ? "UNVERIFIED" : "VERIFIED"
    }];

    const mutation = attack === "tamper-hash" ? o => { o.output_hash = "00".repeat(32); }
      : attack === "tamper-signature" ? o => { o.signature = Buffer.from("tampered").toString("base64"); }
      : attack === "break-chain" ? o => { o.chain = o.chain.map((e, i) => i === 2 ? { ...e, parentHash: "00".repeat(32) } : e); }
      : attack === "intent-mismatch" ? o => { o.intent_hash = "wrong-intent"; }
      : attack === "remove-signature" ? o => { delete o.signature; }
      : attack === "unknown-token-count" ? o => { o.token_count = undefined; }
      : null;

    const primary = agents["red-bird"].produce(req, input, sources, claims, mutation);

    const auditorReq = { ...req, intentId: "audit-primary-output", intentHash: intentHash("audit-primary-output", sessionId) };
    const oracleReq = { ...req, intentId: "oracle-verify", intentHash: intentHash("oracle-verify", sessionId) };
    const oracle = agents["oracle"].produce(oracleReq,
      primary.validation.valid ? "Source verification passed for the supplied source." : "Verification rejected: primary state is not verified.",
      sources,
      primary.validation.valid ? claims : []
    );

    const auditor = agents["merlin-dev"].produce(auditorReq,
      `Audit result: primary=${primary.validation.status}; oracle=${oracle.validation.status}.`,
      sources, claims
    );

    const sentinel = agents["sentinel"].produce(
      { ...req, intentId: "security-scan", intentHash: intentHash("security-scan", sessionId) },
      "Security scan completed as a controlled governance test.",
      sources, claims
    );

    const archivist = agents["archivist"].produce(
      { ...req, intentId: "contextualize", intentHash: intentHash("contextualize", sessionId) },
      "Contextualization completed without inventing historical facts.",
      sources, claims
    );

    const fabricator = agents["fabricator"].produce(
      { ...req, intentId: "artifact-generate", intentHash: intentHash("artifact-generate", sessionId) },
      "Artifact generation withheld unless primary verification succeeds.",
      sources, claims
    );

    const all = { primary, oracle, auditor, sentinel, archivist, fabricator };
    const violations = [];
    for (const [name, r] of Object.entries(all)) {
      for (const v of r.validation.violations) violations.push(`${name}.${v.code}`);
    }

    // Fail closed: any critical violation, or any primary non-verified state, invalidates consensus.
    const criticalCodes = ["SCHEMA","GOVERNANCE","HALLUCINATION","SECURITY","SOURCE","INTENT","SIGNATURE","OUTPUT_HASH","CHAIN","TOKEN"];
    const critical = violations.filter(v => criticalCodes.some(c => v.includes(c)));
    const consensusValid = primary.validation.status === STATUS.VERIFIED && critical.length === 0;

    return {
      sessionId,
      primary,
      agents: all,
      consensusValid,
      consensusViolations: violations
    };
  }

  return { run };
}

module.exports = { createHarness };
