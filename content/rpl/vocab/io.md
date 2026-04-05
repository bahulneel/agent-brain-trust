# RPL Vocab — IO

Standard tools for reading, generating, and writing content. Requires lrpl.md
for full lazy semantics of `$index`.

---

## $index

Maps an external source to a relation's argument positions. Lazy by default —
the source is not read and the extension is not enumerated until a downstream
goal requires bound values.

```
$index(LOCATION)
$index(LOCATION, "projection hint")
$index(SOURCE-RELATION(?a, $collection), "projection hint"?)
```

**Location** — a string path (local or remote), a URL, or a relation call.

**Projection hint** — a string (not a unifiable expression) describing how
source fields map to argument positions. Omit when the mapping is self-evident.

**Collection avar** — when the location is a relation, the argument marked `$`
identifies the collection to enumerate. One `$`-marked arg per call.

```rpl
-- flat file; column names match args
expert(?name, ?domain, ?approach) <= $index("experts.csv")

-- non-obvious column mapping
component(?id, ?label) <= $index("components.yaml", "component_id, display_name")

-- structural unwinding: one level per $index call
student(?name, ?classes) <= $index("students.yaml")
student-class(?name, ?subject, ?grade) <=
  $index(student(?name, $classes), "subject, grade")
```

Arbitrarily deep nesting is unwound by repeated application. Each level carries
parent bindings forward through the argument list.

---

## $generate

Produces content by LLM generation. The agent is the producer.

```rpl
$generate(?prompt) ^ ~ {:result ?content}
$generate(?prompt, ?options) ^ ~ {:result ?content}
```

**Prompt** — a string or string template with bound lvars.

**Options** — an optional map of generation hints (format, length, schema).
Does not participate in unification.

Generated values carry `:generated true` provenance in the trace, distinct from
collected or derived values.

```rpl
draft(?content) <=
  $generate("Summarise the findings in __findings__") ^ ~ {:result ?content}
```

---

## $write

Persists a bound value to an external location.

```rpl
$write(?content, ?location)
$write(?content, ?location, ?options)
```

**Options** — format, append vs overwrite, encoding.

A trace stratum written via `$write` is a valid `$index` source for a future
stratum. Cross-session continuity is structural.

---

## Transparent References

A lazy expression wrapping a read is a deferred file reference. Constraints on
`?x` accumulated before entry filter what is attended to:

```rpl
content(?x) <= <$read("report.md") ^ ~ {:result ?x}>
```

`?x` behaves identically whether its value comes from a file, an index, a
generation, or a literal. Provenance differs; the lvar does not.

---

## Tool Algebra — Rewrite Rules

Tool authors may declare rewrite rules as optimisation hints. Rules are stated in
natural language with backtick-quoted syntax:

```
Rewrite `EXPR` as `EXPR` when CONDITION
Rewrite `EXPR` as no-op when CONDITION
```

Quoted expressions are matched structurally, not evaluated. Discovery is not
guaranteed; a run that does not discover a rule is correct but may do more work.

Standard rules:

```
Rewrite `$read(?x), $write(?x)` as no-op
  when ?x is otherwise unconsumed

Rewrite `$read(?x), $write(?y)` as `$copy(?x, ?y)`
  when ?x is otherwise unconsumed and ?x != ?y

Rewrite `$read(?x), $generate(?prompt), $write(?y)` as `$transform(?x, ?y, ?prompt)`
  when $generate is the only consumer of the read result
```
