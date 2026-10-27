# Layer `interpretive`

**Provides.** Interpretation under named languages. Every interpretation is an RPL program.

**Depends on.** [`rpl`](rpl.md).

**Not provided.** The languages themselves (`sql`, `markdown`, …). Those are host or definition clauses.

---

### interpretive.1 — Define and interpret

**Law.** `<@` defines a language from a specification (assertion side). `@>` requests the interpretation of a statement in a named language (goal side). A statement holds when its interpretation unifies with the expected RPL reading.

**FOL reading.** *Comment.* A translation into the `rpl` theory, not a FOL quantifier.

**Surface.** `Statement @> lang(Interpretation)`, `name(?spec) <@ Specification`.

**Spec.** [logics.md §4](../specification/logics.md#4-additional-logic-c-interpretive).

**Example.**

```rpl
'SELECT * FROM foo' @> sql(_)
'SELECT * FROM foo' @> sql(~ foo(_))
```

**Not.** A comparison of surface strings. Shared meaning is shared `rpl` interpretation.

**Comment.** The name `rpl` as a language refers to the dialect of this run (layers taken, extensions included). A bare statement is sugar for interpretation under that `rpl` ([logics.md §4.4](../specification/logics.md#44-implicit-languages)).
