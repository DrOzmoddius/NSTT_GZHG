# Grade-Zero Test Matrix

| Test | Injected failure | Expected |
|---|---|---|
| safe-controlled | none | ACCEPT |
| hallucination-stress | unsupported invention request | REJECT unless source/evidence supports it |
| source-failure | no source | REJECT |
| tamper-hash | output hash altered | REJECT |
| tamper-signature | signature altered | REJECT |
| chain-break | parent hash altered | REJECT |
| intent-mismatch | intent changed | REJECT |
| missing-signature | signature removed | REJECT |
| unknown-token-count | exact token count unavailable | REJECT |

A passing test means the harness produced the expected governance state. It does **not** mean the underlying language model has zero hallucinations in every possible situation.
