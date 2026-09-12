const crypto = require("node:crypto");

function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  return "{" + Object.keys(value).sort().map(k => JSON.stringify(k) + ":" + canonicalize(value[k])).join(",") + "}";
}

function sha256(value) {
  const bytes = typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(canonicalize(value), "utf8");
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function intentHash(intentId, sessionId) {
  return sha256({ type: "NSTT_INTENT", intentId, sessionId });
}

function generateKeyPair() {
  return crypto.generateKeyPairSync("ed25519");
}

function sign(privateKey, value) {
  const bytes = Buffer.from(canonicalize(value), "utf8");
  return crypto.sign(null, bytes, privateKey).toString("base64");
}

function verify(publicKey, value, signatureB64) {
  if (!signatureB64) return false;
  const bytes = Buffer.from(canonicalize(value), "utf8");
  return crypto.verify(null, bytes, publicKey, Buffer.from(signatureB64, "base64"));
}

module.exports = { canonicalize, sha256, intentHash, generateKeyPair, sign, verify };
