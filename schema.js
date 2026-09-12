const SCHEMA = Object.freeze({
  id: "NSTT-GOV-CORE-001",
  version: "1.0.0",
  STRUCT: {
    tokens: { min: 64, max: 4096 },
    format: "tree",
    sections: ["summary", "reasoning", "sources", "constraints"],
    types: ["text", "symbolic", "numeric", "rune_opcode"]
  },
  SEMANTIC: {
    mustReference: "source_hash",
    minSources: 1,
    claimsRequireEvidence: true,
    evidenceLink: "source_id",
    prohibitedCategories: ["personal_attack", "disallowed_sensitive", "policy_violation"],
    intentAlignment: "must_match_intent_hash"
  },
  CRYPTO: {
    signature: { required: true, algorithm: "Ed25519" },
    hash: { algorithm: "SHA-256", fields: ["output_body", "sources", "rune_trace"] },
    chainDepthMin: 3,
    requireCheckpoints: true,
    verifyOnReturn: true
  },
  GOVERNANCE: {
    defaultOpcodes: ["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᛊ"],
    highRiskOpcodes: ["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᛊ","ᛃ","ᛇ","ᛉ","ᛒ"],
    modes: {
      audit_strict: ["no_unreferenced_claims","mandatory_explainability"],
      standard: ["explainability_preferred"]
    },
    onViolation: ["REJECT","ROLLBACK","TERMINATE"],
    requireTrace: true,
    requireSchemaBind: true
  }
});

module.exports = { SCHEMA };
