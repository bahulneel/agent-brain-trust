# RPL Vocab — Provenance

Relations for recording the origin, time, and lineage of facts. The audit
vocabulary. Composes with any domain that requires traceability.

---

## Core Relations

```rpl
asserted-by(?fact, ?agent)       -- ?agent introduced ?fact
asserted-at(?fact, ?time)        -- ?fact was introduced at ?time
derived-from(?fact, ?source)     -- ?fact was derived from ?source
via(?fact, ?relation)            -- ?fact was established through ?relation
supersedes(?new, ?old)           -- ?new replaces ?old
retracted-by(?fact, ?agent)      -- ?agent retracted ?fact
retracted-at(?fact, ?time)       -- ?fact was retracted at ?time
```

---

## Lineage

```rpl
-- full lineage: chain of derivations
lineage(?fact, ?source) <= derived-from(?fact, ?source)
lineage(?fact, ?root)   <= derived-from(?fact, ?mid), lineage(?mid, ?root)

-- current: not retracted
current(?fact) <= not retracted-by(?fact, _)
```

---

## Metadata Conventions

Provenance is typically carried in trace metadata (§spec §11):

```rpl
rel(?args) ^ ~ {:asserted-by ?agent, :asserted-at ?time, :via ?relation}
```

The agent mints provenance metadata at assertion time. Authors may query it:

```rpl
recent(?fact) <= asserted-at(?fact, ?t), ?t after now - "24h"
```

---

## Constraints

```rpl
-- a retracted fact is no longer current
retracted-by(?fact, _), current(?fact) => false

-- supersession implies the old fact is retracted
supersedes(?new, ?old) => retracted-by(?old, _)
```

---

## Goal: Provenance Report

```rpl
%provenance-report(?fact) <=
  lineage(?fact, ?root),
  asserted-by(?root, ?agent),
  asserted-at(?root, ?time)
```
