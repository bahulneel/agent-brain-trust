# RPL Vocab — Versioning

Relations for succession, history, and temporal fact management.

---

## Core Relations

```rpl
version(?entity, ?v)             -- ?entity is at version ?v
succeeds(?v2, ?v1)               -- ?v2 is the successor of ?v1
current-version(?entity, ?v)     -- ?v is the current version of ?entity
history(?entity, ?v, ?time)      -- ?entity was at version ?v at ?time
changelog(?v1, ?v2, ?delta)      -- what changed between versions
```

---

## Derived Relations

```rpl
current-version(?entity, ?v) <=
  version(?entity, ?v),
  not succeeds(_, ?v)

-- full version chain
ancestor-version(?entity, ?v) <=
  version(?entity, ?v)
ancestor-version(?entity, ?v) <=
  succeeds(?v2, ?v), ancestor-version(?entity, ?v2)
```

---

## Constraints

```rpl
-- an entity has exactly one current version
current-version(?e, ?v1), current-version(?e, ?v2), ?v1 != ?v2 => false

-- succession is a function: each version has at most one successor
succeeds(?v2, ?v), succeeds(?v3, ?v), ?v2 != ?v3 => false
```

---

## Goals

```rpl
-- goal: advance an entity to a new version
%advance-version(?entity, ?v-new) <=
  current-version(?entity, ?v-current),
  succeeds(?v-new, ?v-current)

-- goal: roll back to a prior version
%rollback(?entity, ?v-target) <=
  ancestor-version(?entity, ?v-target),
  current-version(?entity, ?v-current),
  ?v-current != ?v-target
```
