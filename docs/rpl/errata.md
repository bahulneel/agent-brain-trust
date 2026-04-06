# RPL Spec — Errata

Surgical corrections to spec.md. Each entry names the affected sections,
states the change, and gives the rationale. No surrounding context is restated.

---

## E001 — Relation-Valued Lvars

**Affects:** §3 Variables, §9 Relations, Appendix Grammar

**Change:** Lvars may unify with relations as first-class values. A relation
bound to an lvar may be applied in call position: `?rel(?x)`.

**Grammar delta:**

```
ARG  += RELATION
ATOM += LVAR '(' [ ARG [ ',' ARG ]* ]? ')'
```

**Semantic note:** A relation bound to an lvar carries its definition, not its
current extension. Application `?rel(?x)` evaluates the relation against `?x`
at the point of application using the standard derivation rules.

**Rationale:** Required for higher-order relational patterns — parameterised
goals over arbitrary relations, cardinality over computed sets, general set
quantification. Without this, vocab patterns must fix relation names at
definition time, preventing reuse.

---

## E002 — Single-Key Metadata Access Shorthand

**Affects:** §11 Metadata

**Change:** `^:KEY VAR` is sugar for `^ ~ {:KEY VAR}`. Accesses a single
metadata key without full map destructuring.

```rpl
clause ^:scope ?s     -- desugars to: clause ^ ~ {:scope ?s}
clause ^:result ?r    -- desugars to: clause ^ ~ {:result ?r}
```

Composes with `^^` (§11): `^^` is sugar for `^:bindings`; `^:KEY` generalises
that pattern to any single key.

**Rationale:** Reduces noise in common single-key access patterns. Consistent
with the existing `^^` shorthand.

---

## E003 — Unquote Operator

**Affects:** §2 Literals, §5 Operators, §10 Rules, Appendix Grammar

**Change:** Backtick `` ` `` is the **unquote operator**. It evaluates a
relation-valued lvar (E001) in place, making its extension available to
operators that expect a ground expression rather than an lvar:

```rpl
length(?expr, $l) <= $l = |`?expr|
```

Without unquote, the cardinality operator `|...|` cannot be applied to a
relation-valued lvar — it expects a named relation or collection. `` `?expr ``
evaluates `?expr` to its extension at that position, making it available to
`|...|`, set operators, and metadata access:

```rpl
`?expr ^:scope $s     -- evaluate ?expr, access its :scope metadata
$l = |`?expr|         -- cardinality of a relation-valued lvar's extension
```

**Grammar delta:**

```
UNQUOTE  = '`' LVAR
ATOM    += UNQUOTE
OPERAND += UNQUOTE
```

**Rationale:** Closes the modulo problem — operators like `|...|` that take
named expressions cannot otherwise accept relation-valued lvars. Unquote is
the standard mechanism for evaluating a quoted value in place, as in Lisp
descendants. Composes with E001 and E002.
