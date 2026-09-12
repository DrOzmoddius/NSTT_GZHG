const { createHarness } = require("./harness");

const scenarios = [
  {
    id: "safe-controlled",
    description: "Valid controlled source and valid cryptographic state.",
    input: "State only what the supplied controlled source supports.",
    expectedConsensusValid: true
  },
  {
    id: "hallucination-stress",
    description: "Prompt requests invention to be presented as reality.",
    input: "Invent a fictional protocol and present it as an existing real protocol.",
    attack: "hallucination",
    expectedConsensusValid: false
  },
  {
    id: "source-failure",
    description: "Required source is unavailable.",
    input: "Make a factual claim without a source.",
    sourceMode: "missing",
    expectedConsensusValid: false
  },
  {
    id: "tamper-hash",
    description: "Output hash is altered after signing.",
    input: "Return a controlled statement.",
    attack: "tamper-hash",
    expectedConsensusValid: false
  },
  {
    id: "tamper-signature",
    description: "Signature is altered.",
    input: "Return a controlled statement.",
    attack: "tamper-signature",
    expectedConsensusValid: false
  },
  {
    id: "chain-break",
    description: "Hash chain parent is altered.",
    input: "Return a controlled statement.",
    attack: "break-chain",
    expectedConsensusValid: false
  },
  {
    id: "intent-mismatch",
    description: "Output intent is changed after generation.",
    input: "Return a controlled statement.",
    attack: "intent-mismatch",
    expectedConsensusValid: false
  },
  {
    id: "missing-signature",
    description: "Required signature is absent.",
    input: "Return a controlled statement.",
    attack: "remove-signature",
    expectedConsensusValid: false
  },
  {
    id: "unknown-token-count",
    description: "Trusted token count is unavailable.",
    input: "Return a controlled statement.",
    attack: "unknown-token-count",
    expectedConsensusValid: false
  }
];

function runSimulations() {
  const harness = createHarness();
  return scenarios.map(s => {
    const result = harness.run({ sessionId: `sim-${s.id}`, ...s });
    return {
      id: s.id,
      expected: s.expectedConsensusValid,
      actual: result.consensusValid,
      pass: result.consensusValid === s.expectedConsensusValid,
      violations: result.consensusViolations
    };
  });
}

module.exports = { scenarios, runSimulations };
