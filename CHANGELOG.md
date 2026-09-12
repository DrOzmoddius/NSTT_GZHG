# NSTT Grade-Zero v1 Change Log

## 1.0.0 — fail-closed baseline

### Removed
- `fakeHash(...)`
- `fakeSign(...)`
- literal `hash(intent:...)` placeholders as runtime identity/integrity values
- the implication that a symbolic hash string is a cryptographic hash
- the implication that a valid signature proves factual truth

### Added
- canonical SHA-256 implementation
- real Ed25519 key generation, signing, and verification
- deterministic intent hashing
- three-stage hash chain with real checkpoints
- explicit evidence/status model
- strict source hashing
- claim-to-source binding
- intent equality validation
- signature verification on return
- chain verification on return
- fail-closed consensus
- adversarial simulation suite

### Governance interpretation
The original NSTT package's four-layer model is preserved:
STRUCT -> SEMANTIC -> CRYPTO -> GOVERNANCE.

The change is from **declared enforcement** to **executable enforcement**.

### Important truth boundary
Cryptography validates integrity and authorship of a state. It does not validate that a source is truthful, current, authoritative, or correctly interpreted. Oracle/source verification therefore remains a separate semantic control.

### Token-count boundary
The original schema specifies a 64–4096 token range. A runtime cannot safely infer an exact model-token count from a string without the same tokenizer used by the target model. This reference implementation therefore requires a trusted integer `token_count`; if unavailable, it rejects the state rather than guessing.
