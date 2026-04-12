# (L)RPL Additional Logics: Existential, Modal, and Interpretive Frameworks

## 1. Motivation and Base Logic

The core of **(L)RPL** operates on a series of nested assumptions that simplify expressing relations. To understand why additional logics are necessary, we first deconstruct the language's canonical forms.

### 1.1 The Canonical Form

Every expression in (L)RPL is shorthand for a deeper structural commitment. For example, a standalone relation like `expr` is interpreted through multistage expansion:

- **Assertion**:  
  `true <- expr`  
  Declares that the expression exists—an existence statement within the logic.

- **Invariant**:  
  `expr -> true`  
  Asserts that the claim must hold—i.e., the expression's truth.

The composition `true <- expr -> true` anchors the expression at both ends: as a positive existence ("head") and as a necessary validity ("tail").

### 1.2 Fact vs. Proof

There is a key distinction between a **fact** and a **proof** (truth). A statement like "There is a black swan" claims existence (fact), but does not constitute a proof. In canonical form:

- The head (**`true <- expr`**) asserts the existence.
- The tail (**`expr -> true`**) asserts the proof.

> - Without the tail (invariant), a fact is a floating possibility.  
> - Without the head (assertion), a proof has no subject.

The base logic ensures that fact and proof are inseparable for any standard expression.

### 1.3 Relations vs. Goals

A critical distinction is made between a **Relation** and a **Goal**:

- **Relations (`<-`)**:  
  *Backward looking*. Describe the provenance or "Head" of logic (what must be present for an assertion).

- **Goals (`->`)**:  
  *Forward looking*. Define the "Tail"—the invariant (what must be true for the assertion to hold).

In the base logic, these two are balanced. But at scale, managing these independently provides power. Three composable additional logics support this: **existential**, **modal**, and **interpretive** (below).

---

## 2. Additional Logic A: Existential

This logic governs **materialization and synchronization** of expressions. It introduces explicit lifecycle operators: **`<%`** (Head) and **`%>`** (Tail).

### 2.1 The Four Operational Modes

By decomposing canonical forms into existential components, we find four core states:

| Mode         | Syntax         | Concept             | Description                                               |
|--------------|---------------|---------------------|-----------------------------------------------------------|
| The Log      | `true <% A`   | A Posteriori        | Permanent history—record of what has occurred             |
| The Impulse  | `A <% true`   | Transient Trigger   | Immediate—lasts until the next quiescence                 |
| Consistency  | `true %> A`   | Structural Invariant| Hard constraint—logic is invalid if it contradicts A      |
| Eventually   | `A %> true`   | Liveness Promise    | Pending—obligation until A is met                         |

### 2.2 Analogy: The Lifecycle of the Swan

- **The Log** (`true <% BlackSwan`):  
  Grounded observation. We found a black swan—it’s part of permanent history.

- **The Impulse** (`BlackSwan <% true`):  
  Momentary sighting. Immediate effect; not necessarily a permanent law.

- **Consistency** (`true %> BlackSwan`):  
  Invariant. It's a law that black swans must exist; absence is an error.

- **Eventually** (`BlackSwan %> true`):  
  Search. Pending until a black swan is found.

### 2.3 Reasoning: The Self-Cleaning Trace

The **Impulse** is the key innovation. Using `A <% true` for intermediates (flags, steps) allows high-intensity reasoning without polluting the permanent log. When the system reaches "Satisfactory Quiescence," impulses evaporate, keeping history a clear record of results rather than process clutter.

---

## 3. Additional Logic B: Modal

This logic governs **perspective** ("Mode") in which statements are evaluated. It introduces:

- **`~>`**  (Necessity)
- **`<~`**  (Possibility)

to handle necessity, possibility, and context.

### 3.1 Syntax and Semantics

- **Necessity**:  
  `A ~> B` — Projects `A` into the mode of `B`. Asserts `A` is true within the world-view of `B`.

- **Possibility**:  
  `B <~ A` — Maps `B` back to the base context, allowing for the existence defined by `A`.

### 3.2 Analogy: The Perspective of the Swan

- **Necessity** (`BlackSwan ~> :Australia`):  
  Asserts black swan exists specifically within the Australia mode.

- **Possibility** (`:Rare <~ BlackSwan`):  
  The swan's existence makes the "Rare" mode possible in the broader logic.

### 3.3 Reasoning: Contextual Integrity

Modal logic prevents "Flat Logic" errors (e.g., confusing a **User Goal** with a **Safety Requirement**) by using modes to explicitly define evaluation context. The model can now distinguish simulation truths from ground reality.

---

---

## 4. Additional Logic C: Interpretive

This logic governs **interpretation under named languages**. It introduces:

- **`<@`** — on the assertion side, to **define** a Language from a Specification.
- **`@>`** — on the goal side, to request the **Interpretation** of a Statement in a named Language.

### 4.1 Syntax and Semantics

Four concepts organise this logic:

| Concept | Role |
|---|---|
| **Language** | A named reading agent, identified by a kebab-case label — e.g. `sql`, `foaf`, `markdown` |
| **Specification** | Any value the agent can interpret as a language definition |
| **Statement** | A surface expression to be read under a Language |
| **Interpretation** | The RPL program that results — always RPL, regardless of source Language |

The operator `@>` places an interpretive request in goal position: `Statement @> lang-name(Interpretation)`. A Statement that is valid in a Language holds when `Interpretation` unifies with its RPL reading:

```rpl
'SELECT * FROM foo' @> sql(_)           # holds if the statement is valid sql
'SELECT * FROM foo' @> sql(~ foo(_))    # holds if it reads as foo(...)
```

Definitions use `<@` at head-compatible sites, supplying a Specification from which the agent derives the Language:

```rpl
team-dsl(?spec) <@ $read(?path) ^:result ?spec
```

After which `Statement @> team-dsl(Interpretation)` is available.

### 4.2 Analogy: Meaning as Interlingua

A linguist asking whether an English and a German utterance mean the same thing does not compare their words — she translates both into a shared meaning and checks if they align. The meaning is the interlingua; neither language needs to know anything about the other.

Interpretation plays the same role. Two Statements in different Languages share an Interpretation when their RPL readings unify. Here, an English surface is expanded and a German rendering is resolved through a shared `?i`:

```rpl
en-to-de(?en, $de) <- ~ $de @> german(?i), #?en @> english(?i)
```

A Specification is the linguist's semantic theory — it tells the agent how to produce an Interpretation for Statements in that Language.

### 4.3 Reasoning: Diversity and Bridging

**Diversity of representation.** Any Language whose Interpretations are RPL-compatible can contribute facts and structure to the same program. Here a SQL statement is interpreted to derive a projection, which then drives indexing into JSON data:

```rpl
user(?id, ?email, ?verified) <- 
    'SELECT * FROM Users' @> sql(?projection),
    $index('/path/to/data', ?projection)^:result ?json,
    #?json @> json(~ {:id ?id, :email ?email, :info {:verified ?verified}})
```

**Cross-linguistic bridging.** Because every Interpretation is RPL, unification works across Languages without special machinery. Here a markdown table and a SQL query are bridged via a shared `?code`:

```rpl
errors(?id, ?message, ?timestamp) <-
    $read('tables.md#Message+Codes', _) @> markdown(~ message-codes(?code, ?message)),
    $query('SELECT id, code, timestamp FROM error') ^:result ?error,
    #?error @> sql(~ error(?id, ?code, ?timestamp))
```

### 4.4 Implicit Languages

Most programs need no definition clauses. The agent's background already fixes how common language names interpret — `sql`, `foaf`, `sparql`, and others are available without a `<@` clause. Definitions are only needed for languages the agent does not already know.

`rpl` has special standing: it refers not to RPL in the abstract but to the RPL language as currently instantiated for this run — the active dialect, extensions, and logics included. A bare Statement is sugar for its Interpretation under `rpl`; the wrapper is elided because source and target coincide.


---

## 5. Composition and Dual Meaning

These logics can be used separately or combined—yielding a "physics of information." The "Fact vs. Proof" duality is made explicit.

### 5.1 Composing the Impulse and the Mode

- **Filtered Impulse**:  
  `(A ~> B) <% true`  
  *Analogy*: Impulse to see a black swan under "Scientific Discovery" mode—triggers only if fact matches modal proof.

- **Modal Log**:  
  `true <% (A ~> B)`  
  *Analogy*: Grounds the fact that the black swan exists within a region—proof is now permanent.

### 5.2 The Meaning of the Dual

- **Forward Projection** (`A ~> B`):  
  "Given A, the mode of B must be satisfied." (fact requirement)

- **Backward Mapping** (`A <~ B`):  
  "The presence of mode B justifies A." (provenance for proof)

With existential anchors, precise assertions arise:

- `true %> (BlackSwan ~> :Protected)` — Any found swan must be viewed as protected.
- `(BlackSwan <~ :Mutation) <% true` — Immediate impulse: black swan is identified since the "Mutation" mode is seen.

### 5.3 Interpretive with existential and modal

- **Interpretive invariant under a mode:**  
  `French(Paragraph, ?i) ~> French(PullQuote, ?i) ~> true` — same as **`(Paragraph @> french(?i)) ~> (PullQuote @> french(?i)) ~> true`**; shared **`?i`** ties the same RPL program across nested modal goals; hosts may treat `~> true` as an elidable default tail where the spec allows.

- **Pending an interpretive reading:**  
  `Sql(A) %> true` — same as **`(A @> sql) %> true`**; liveness until the **Sql** interpretation is satisfiable alongside existential quiescence.

- **Impulse under a language:**  
  `Foaf(Fact) <% true` — same as **`(fact @> foaf) <% true`**; transient **Foaf** interpretation without forcing the inner graph to be asserted as base RPL truth.

---

## 6. Composition of Core with Additional Logics

The true power of (L)RPL emerges by synthesizing:

- **Core Form**
- **Existential Logic**
- **Modal Logic**
- **Interpretive Logic**

This enables "reasoning machinery" that manages truth, temporal presence, modes, and **cross-language** interpretations.

### 6.1 The Teleological Modal Impulse

**Form:**  
`(A ~> B) <% true -> C`

Combine existential impulse, modal projection, and base relation.

*Analogy*: Impulse to see black swan under "Discovery" mode `(BlackSwan ~> :Discovery <% true)`. If so, triggers `-> :UpdateLog`.

*Meaning*: The log is updated only for transient sightings that satisfy the modal goal and any interpretive side condition; the impulse fades, but the consequence remains.

### 6.2 The Invariant Proof of Possibility

**Form:**  
`true %> (A <~ B) <- C`

Anchors modal possibility as structural invariant.

*Analogy*: Law (`true %>`) that mode "Biological Diversity" is possible because black swan exists (`:Diversity <~ BlackSwan`). Maintained by `<- :EnvironmentScan`.

*Meaning*: System is invalid if the environment scan can’t justify diversity through presence of the swan. Proof is tied to fact existence.

### 6.3 The Eventually Nested Necessity

**Form:**  
`(A ~> B) %> true`

Uses liveness promise to wait for a modal necessity.

*Analogy*: The system is "pending" (`%> true`) until it can necessarily project a swan into the "Secure" mode (`BlackSwan ~> :Secure`).

*Meaning*: Not satisfied by any swan; must prove it holds within the modal constraint for quiescence.

---

## 7. Summary

By treating existential, modal, and interpretive constructs as **additional logics**, we preserve the performance of the core language while equipping developers to build sophisticated, clean, context-aware agents—including **cross-surface** programs shared via interpretive witnesses. This modular approach ensures logic stability even as the agent's world-view becomes more complex.

---

## 8. Related Documents

- [../README.md](../README.md) — RPL entry point and worked example.
- [rpl.md](rpl.md) — Base normative specification (syntax, semantics, runtime).
- [lrpl.md](lrpl.md) — Lazy extension delta.
- [../theory.md](../theory.md) — Bloom/CALM grounding and formal-vs-agent layer.
- [../vision.md](../vision.md) — Central ideas and design principles.