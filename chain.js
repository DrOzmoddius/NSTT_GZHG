const { sha256 } = require("./canonical");

function makeChainEntry({ index, parentHash, state }) {
  const stateHash = sha256(state);
  const entryHash = sha256({
    type: "NSTT_CHAIN_ENTRY",
    index,
    parentHash,
    stateHash
  });
  return Object.freeze({ index, parentHash, stateHash, entryHash });
}

function buildChain(states) {
  let parentHash = null;
  return states.map((state, index) => {
    const entry = makeChainEntry({ index, parentHash, state });
    parentHash = entry.entryHash;
    return entry;
  });
}

function verifyChain(chain) {
  if (!Array.isArray(chain) || chain.length === 0) return { valid: false, reason: "CHAIN_MISSING" };
  let parentHash = null;
  for (let i = 0; i < chain.length; i++) {
    const e = chain[i];
    if (e.index !== i) return { valid: false, reason: `CHAIN_INDEX:${i}` };
    if (e.parentHash !== parentHash) return { valid: false, reason: `CHAIN_PARENT:${i}` };
    const expected = sha256({
      type: "NSTT_CHAIN_ENTRY",
      index: e.index,
      parentHash: e.parentHash,
      stateHash: e.stateHash
    });
    if (expected !== e.entryHash) return { valid: false, reason: `CHAIN_HASH:${i}` };
    parentHash = e.entryHash;
  }
  return { valid: true, head: parentHash };
}

module.exports = { makeChainEntry, buildChain, verifyChain };
