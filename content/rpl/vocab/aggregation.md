# RPL Vocab — Aggregation

Relations and goals for quorum, unanimous agreement, and threshold conditions.

---

## Core Relations

```rpl
all-hold(?rel, ?set)         -- every element of ?set satisfies ?rel
some-hold(?rel, ?set)        -- at least one element satisfies ?rel
n-hold(?rel, ?set, ?n)       -- at least ?n elements satisfy ?rel
quorum(?rel, ?set, ?thresh)  -- proportion satisfying ?rel meets ?thresh
unanimous(?rel, ?set)        -- all-hold; sugar for readability
```

---

## Derived Relations

```rpl
all-hold(?rel, ?set) <= |?rel intersect ?set| = |?set|

n-hold(?rel, ?set, ?n) <= |?rel intersect ?set| >= ?n

quorum(?rel, ?set, ?thresh) <=
  |?rel intersect ?set| * 1 / |?set| >= ?thresh

unanimous(?rel, ?set) <= all-hold(?rel, ?set)
```

---

## Goals

```rpl
-- goal: satisfied when all members of ?set have approved
%unanimous-approval(?set) <=
  unanimous(approved(_), ?set)

-- goal: satisfied when a majority have approved
%majority-approval(?set) <=
  quorum(approved(_), ?set, 0.5)

-- goal: satisfied when at least ?n have approved
%threshold-approval(?set, ?n) <=
  n-hold(approved(_), ?set, ?n)
```

---

## Constraints

```rpl
-- quorum threshold must be between 0 and 1
quorum(_, _, ?t) => ?t > 0, ?t <= 1
```
