# RPL Vocab — Distinctness

Relations and constraints for mutual exclusion, conflict detection, and
uniqueness. The vocabulary that makes premature convergence structurally
inexpressible.

---

## Core Relations

```rpl
distinct(?a, ?b)               -- ?a and ?b are distinct values
unique(?rel, ?arg-pos)         -- no two tuples share the same value at ?arg-pos
exclusive(?rel-a, ?rel-b)      -- ?rel-a and ?rel-b cannot both hold
conflict(?a, ?b)               -- ?a and ?b are in conflict
```

---

## Constraints

```rpl
-- mutual exclusion between two relations
exclusive(?r1, ?r2), ?r1(?x), ?r2(?x) => false

-- explicit conflict
conflict(?a, ?b) => not (?a, ?b)
```

---

## Goals

```rpl
-- goal: verify no two participants hold identical claims
%no-shared-claims(?participants) <=
  not (
    holds(?p1, ?claim),
    holds(?p2, ?claim),
    ?p1 in ?participants,
    ?p2 in ?participants,
    ?p1 != ?p2
  )
```

Two participants holding the same claim is a constraint violation, not merely a
stylistic failure. Premature convergence is structurally inexpressible without
violating this constraint.
