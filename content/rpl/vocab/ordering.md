# RPL Vocab — Ordering

Relations and constraints for partial orders, precedence, and sequencing.
Compatible with any RPL or LRPL document.

---

## Core Relations

```rpl
before(?a, ?b)          -- ?a precedes ?b
after(?a, ?b)           -- ?a follows ?b; sugar for before(?b, ?a)
precedes(?a, ?b)        -- strict precedence; ?a before ?b, ?a != ?b
successor(?a, ?b)       -- ?b is the immediate successor of ?a
first(?a, ?set)         -- ?a is the least element of ?set
last(?a, ?set)          -- ?a is the greatest element of ?set
```

---

## Derived Relations

```rpl
after(?a, ?b) <= before(?b, ?a)

precedes(?a, ?b) <= before(?a, ?b), ?a != ?b

-- transitivity (the agent derives the closure)
before(?a, ?c) <= before(?a, ?b), before(?b, ?c)
```

---

## Constraints

```rpl
-- irreflexivity: nothing precedes itself
before(?a, ?a) => false

-- antisymmetry: no cycles
before(?a, ?b), before(?b, ?a) => false
```

---

## Goal: Ordered Traversal

`%traverse` satisfies each element in order, stepping via `next`:

```rpl
%traverse(?set) <= %visit(?x, ?set)
  ; @for(?x, first(?x, ?set), successor(?x, ?next))

%visit(?x, ?set) <= ?x in ?set
```

Authors replace `%visit` with their domain logic or compose it:

```rpl
%process-in-order(?items) <=
  %traverse(?items), %visit(?x, ?items) <= process(?x)
```
