const STATUS = Object.freeze({
  COMPUTED: "COMPUTED",
  VERIFIED: "VERIFIED",
  UNVERIFIED: "UNVERIFIED",
  UNKNOWN: "UNKNOWN",
  REJECTED: "REJECTED"
});

function evidenceState(status, value = null, reason = null) {
  return { status, value, reason };
}

module.exports = { STATUS, evidenceState };
